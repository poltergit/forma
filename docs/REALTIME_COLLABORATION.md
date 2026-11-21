# FORMA — Real-Time Scene Collaboration

**Version:** 0.4  
**Phase:** 05 — Technical Architecture  
**Status:** Proposed MVP architecture based on owner-approved collaboration requirement  
**Backend:** Supabase Auth, PostgreSQL, RLS, Realtime  
**Scope:** Invite-only collaborative Scene Studio; no public rooms or anonymous editing

---

## 1. Product decision

The first release must support real-time collaboration in Scene Studio. Collaboration is not a later roadmap placeholder.

The first release includes private invite-only rooms attached to saved scenes, owner/editor/viewer roles, live presence, committed scene updates, server-authoritative mutation ordering, reconnect recovery, and clear attribution/conflict feedback.

Not included: public rooms, anonymous editing, chat/comments/video, offline multi-user merge, branching, full version history, CRDT-based editing, team workspaces, or arbitrary collaboration roles.

## 2. Architecture and consistency contract

Supabase Realtime is a transport for presence and change notifications. PostgreSQL is the durable source of truth. A realtime message is never proof that a write committed.

The client submits a typed command. The Next.js boundary validates session and payload. A narrowly scoped PostgreSQL RPC/function performs authorization, locking/revision validation, idempotency, document mutation, and command receipt in one database transaction. The RPC is the atomicity boundary: a Next.js server action alone cannot make several database requests transactional.

The function derives actor identity from `auth.uid()`; it never trusts a client-supplied actor ID. Ordinary browser clients must not have direct permission to replace `scenes.document` or `scenes.revision`.

Prefer a security-invoker function if its permissions can be made safe. If a security-definer function is necessary, pin `search_path`, schema-qualify objects, revoke broad execute grants, grant only the required role, and repeat all authorization checks inside the function. Do not rely solely on checks in the Next.js layer.

## 3. Data model

### Membership
`public.scene_members`:
- `scene_id` and `user_id` composite primary key.
- `role` limited to `editor` or `viewer`.
- `invited_by` and server-generated `created_at`.
- Owner remains `scenes.owner_id`; do not duplicate owner membership.

Only the owner can add/remove members or change roles.

### Invitations
Store scene, normalized recipient identity, inviter, role, SHA-256 token hash, expiry, accepted/revoked/expired timestamps, actor IDs, and creation timestamp. Never store raw token. The server generates 32 random bytes with Node crypto and hashes the base64url token using SHA-256; PostgreSQL receives only the digest. Acceptance reads the authenticated account's confirmed email from auth.users and binds it to the invitation identity. Membership creation and invitation consumption occur in one transaction.

See [Invitation & Membership Engine](INVITATION_MEMBERSHIP_ENGINE.md) and migration draft [20261121000300_forma_invitation_membership_rpc.sql](../supabase/migrations/20261121000300_forma_invitation_membership_rpc.sql). The RPCs cover create, accept, revoke, and owner removal. They remain unexecuted review drafts.

### Command receipts
Use a durable unique command ID scoped appropriately (at minimum unique per scene) and retain actor, command type, resulting revision, and timestamp. Store only the minimum metadata required for idempotency and recovery. Decide retention before adding full payload/audit history.

## 4. Authorization contract

| Action | Owner | Editor | Viewer | Anonymous/non-member |
|---|---:|---:|---:|---:|
| Read scene | Yes | Yes | Yes | No |
| Edit scene | Yes | Yes | No | No |
| Delete scene | Yes | No | No | No |
| Rename scene | Yes | Yes | No | No |
| Manage membership/invitations | Yes | No | No | No |
| View presence | Yes | Yes | Yes | No |

RLS and database privileges enforce access independently of UI. Viewer restrictions must hold for direct REST/RPC attempts and realtime paths, not merely disabled controls.

## 5. Command protocol

Initial allowlist:
- `object.create`
- `object.delete`
- `object.rename`
- `object.transform.set`
- `object.visibility.set`
- `object.material.set`
- `scene.settings.set`

Each command carries command ID, scene ID, expected revision, command type, target ID where needed, and a bounded validated payload. The authenticated actor is derived from `auth.uid()`.

Atomic database operation:
1. Validate command envelope and supported type.
2. Verify authenticated user and current owner/editor membership.
3. Check whether command ID already has a receipt; return the prior result for a retry.
4. Lock the scene row (or use a rigorously equivalent compare-and-swap strategy).
5. Check expected revision and command-specific rebase rules.
6. Apply command to the latest validated document.
7. Increment revision.
8. Update scene and insert command receipt in the same transaction.
9. Return resulting revision and minimal change metadata.

The unique command ID must be protected by a database constraint so simultaneous retries cannot both commit. A transaction failure must leave neither the scene update nor receipt committed.

### Conflict policy
- Different-object edits may be rebased only when command semantics prove independence.
- Same-property edits resolve in committed database order; clients receive actor/revision attribution.
- Destructive or structurally dependent stale commands are rejected for user review.
- Never claim general safe rebase for arbitrary commands.
- Undo is a new compensating command.

## 6. Realtime contract

### Presence
Use private scene-scoped channels. Presence contains minimal identity/display metadata, role, selected object ID, and optional throttled ephemeral viewport state. Do not persist cursor movement or include full scene documents, emails, tokens, or sensitive settings.

### Committed updates
After database commit, notify authorized clients of the new revision. A client:
- ignores duplicate or older revisions;
- fetches authoritative state or applies a verifiable committed command;
- does not overwrite an active local interaction with stale state;
- reconciles pending command IDs;
- displays connection and synchronization status.

A notification can be missed, duplicated, delayed, or arrive out of order. Correctness must not depend on exactly-once delivery.

### Revocation
Membership removal must block future database reads and commands regardless of any still-open socket. Verify the provider's channel authorization refresh/revocation semantics. The application must force local unsubscribe and clear private data; do not assume an open channel instantly loses authorization without testing.

### Reconnect
1. Re-establish session and channel authorization.
2. Fetch latest scene snapshot and revision.
3. Query command receipts for pending IDs.
4. Mark committed commands complete.
5. Reapply only commands proven safe against current state.
6. Surface unresolved intent for manual retry/recovery.

## 7. Invitation lifecycle

1. A trusted server action authenticates the owner, generates 32 random bytes, creates a base64url token, and computes its SHA-256 digest.
2. The owner-only create RPC validates scene ownership, role, recipient, digest shape, and a 1–7 day expiry; only the digest is persisted.
3. The server sends a link using the configured transactional email provider. Prefer a URL fragment for the token so it is not sent in the initial HTTP request; the redemption page must capture it, immediately scrub it from browser history, avoid third-party scripts/analytics, and use a strict no-referrer policy.
4. Recipient authenticates. The server hashes the submitted token; the acceptance RPC verifies the confirmed auth.users email, locks the scene/invitation, and atomically creates membership and records the accepting actor.
5. Owner may revoke a pending invitation or remove an accepted collaborator. Removal locks the scene row, serializing against the scene command RPC's membership check.
6. Delivery failure is handled as a separate side effect: attempt invitation revocation and show failure rather than a false success.

The email provider, server-side rate limiter, canonical origins, and actual Realtime revocation behavior remain validation decisions.

Never disclose account existence. Never report success before delivery/creation is confirmed. If email is not configured, show a truthful unavailable/error state; do not fake invitation delivery.

## 8. Privacy and abuse controls

- Private channels only.
- No complete scene document in presence.
- Enforce payload/message and command rate limits.
- Rate-limit invite creation and acceptance.
- Re-check authorization on every durable operation.
- Avoid logging document contents, invite tokens, and recipient emails.
- Keep service-role credentials server-only.
- Clear local private state on sign-out, account change, or access revocation.

## 9. UX and performance

Show collaborator identity and role, distinguish remote selections, and expose connected/reconnecting/offline/sync-pending/conflict states. Viewers have read-only controls and accessible descriptions. Throttle transient presence; do not persist pointer movement. Keep local scene editing usable when no collaborators are present.

## 10. Authorization and reconnect implementation\n\nSee [Realtime Authorization & Recovery](REALTIME_AUTHORIZATION_RECOVERY.md) and draft migration `supabase/migrations/20261121000400_forma_realtime_authorization_recovery.sql`. The channel topic is versioned and private; presence/broadcast payloads are untrusted hints, never durable state. A narrow receipt RPC reconciles a caller's pending command IDs after reconnect. Provider authorization refresh and live-socket revocation still require isolated verification.\n\n## 11. Required validation

See [Phase 05 Technical Validation Plan](PHASE_05_VALIDATION_PLAN.md) and [Security Threat Model](SECURITY_THREAT_MODEL.md).

Critical tests: RLS for all roles, direct-write bypass denial, private-channel join/revocation, identity-bound single-use invitations, duplicate command retries, concurrent commands, transaction rollback, missed/out-of-order notifications, reconnect recovery, and oversized payload rejection.

**Status:** Architecture and review-only SQL drafts. No migration has been applied; no email flow, provider configuration, Realtime configuration, or integration test has been implemented or verified.
