# FORMA — Real-Time Scene Collaboration

**Version:** 0.1  
**Phase:** 05 — Technical Architecture  
**Status:** Proposed MVP architecture based on owner-approved collaboration requirement  
**Backend:** Supabase Auth, PostgreSQL, RLS, Realtime  
**Scope:** Invite-only collaborative Scene Studio; no public rooms or anonymous editing

---

## 1. Product decision

The first release must support real-time collaboration in Scene Studio. Collaboration is not a later roadmap placeholder.

The MVP should let a scene owner invite named FORMA accounts, assign a role, and work in the same scene together. Participants should see each other's presence and committed scene changes without manually refreshing.

The first release is deliberately bounded:
- Private, invite-only rooms attached to saved scenes.
- Roles: owner, editor, viewer.
- Live presence: who is in the scene, selection, and lightweight cursor/viewport presence where supported.
- Live scene updates for committed edits.
- Server-authoritative ordering of document mutations.
- Reconnection and snapshot recovery.
- Clear collaborator attribution and conflict feedback.

Not included in the first release:
- Public rooms or anonymous guest editing.
- Voice/video, chat, comments, or activity feeds.
- Multiplayer cursors with guaranteed pixel-perfect cross-device alignment.
- Offline multi-user merge.
- Branching, merge UI, or full version history.
- CRDT-based arbitrary concurrent document editing.
- Team workspaces, organization billing, or granular custom roles.

## 2. Architecture choice

Use **Supabase Realtime** for presence and change notifications, and PostgreSQL as the durable source of truth.

Use a **server-authoritative, revision-ordered operation model** for scene edits:
1. A client submits a typed edit command with the scene ID and expected revision.
2. The authenticated server boundary verifies membership and role.
3. The command payload is runtime-validated.
4. A database transaction locks or compare-and-swaps the scene revision, applies the command to the latest document, increments revision, and records the committed change.
5. After commit, clients receive a realtime database-change notification and fetch or apply the authoritative revision.
6. If a client missed events or reconnects, it loads the latest snapshot and revision.

This intentionally avoids a CRDT in the first release. It is easier to reason about with a constrained scene document and a small number of collaborators. It does mean the server is authoritative and concurrent edits must be serialized and reconciled.

**Important:** Supabase Realtime notifications are not the durable event log. PostgreSQL scene state and committed revision data remain authoritative. A missed notification must never mean a lost edit.

## 3. Collaboration data model

### Scene membership

Add a `public.scene_members` table:

| Column | Type | Purpose |
|---|---|---|
| scene_id | uuid | Scene reference |
| user_id | uuid | Collaborator auth user reference |
| role | text | `editor` or `viewer` |
| invited_by | uuid | Owner/account that granted access |
| created_at | timestamptz | Membership creation |

Primary key: `(scene_id, user_id)`. The scene owner remains `scenes.owner_id` and does not need a duplicate membership row.

Only the scene owner may add/remove members or change roles. A collaborator cannot promote themselves or invite others in the MVP.

### Invitations

Use a separate invitation record if email-based invitations are included:
- scene ID;
- normalized recipient email;
- inviter user ID;
- role;
- hashed, single-use invitation token;
- expiry and accepted/revoked timestamps.

Never store raw invitation tokens. Do not reveal whether an email belongs to an existing account. Invitation creation and acceptance must happen through a trusted server-side flow with rate limits. Keep the service-role credential server-only if the selected invitation provider API requires it.

An invitation must not grant access until the intended account accepts it and a membership row is created. The exact email delivery mechanism and token lifecycle must be verified during implementation.

## 4. Authorization model

| Action | Owner | Editor | Viewer | Anonymous |
|---|---:|---:|---:|---:|
| Read scene | Yes | Yes | Yes | No |
| Edit scene | Yes | Yes | No | No |
| Delete scene | Yes | No | No | No |
| Rename scene | Yes | Proposed: yes | No | No |
| Invite/remove members | Yes | No | No | No |
| Change member roles | Yes | No | No | No |
| View room presence | Yes | Yes | Yes | No |

All permissions must be enforced server-side and in database RLS. Hiding buttons is not authorization.

### RLS policy intent

- Owner access derives from `scenes.owner_id = auth.uid()`.
- Member read access derives from a matching `scene_members` row.
- Editor mutations require owner or editor membership.
- Viewer mutations are denied.
- Only the owner may manage `scene_members`.
- Membership changes cannot be performed by the member themselves.
- Invitation records are never directly readable by arbitrary authenticated users.
- Realtime channels must be private and use authorization policies appropriate to scene membership.

Policy helpers must avoid recursive RLS evaluation. If a security-definer helper is used, pin its search path, restrict execute grants, and review it carefully. Test policies with real authenticated roles before release.

## 5. Mutation and conflict protocol

Do not let each client write a complete stale scene document over another participant's changes.

Use a small allowlisted command set, for example:
- `object.create`
- `object.delete`
- `object.rename`
- `object.transform.set`
- `object.visibility.set`
- `object.material.set`
- `scene.settings.set`

Each command includes a command ID, scene ID, expected revision, target object ID where applicable, and a validated payload. The server derives the actor from the authenticated session.

The transaction must:
1. Verify scene membership and editor role.
2. Lock/read the current scene row.
3. Check command ID idempotency.
4. Validate the expected revision and command semantics.
5. Apply the command to the current authoritative document.
6. Increment revision and update the scene.
7. Record the committed command metadata and resulting revision.
8. Commit atomically.

### Concurrent edits

- Commands are serialized by the server/database.
- Commands that target different objects can generally be accepted against the latest revision after safe revalidation.
- Concurrent writes to the same property use server commit order; the later accepted command wins.
- The UI should show collaborator attribution and a subtle "updated by…" state for changed properties.
- If a command cannot be safely rebased, reject it with a conflict response; preserve the user's local intent and offer retry/reapply.
- Undo is a new compensating command, not deletion of another collaborator's history.
- Never silently replace the local working document with a stale snapshot.

This is collaborative editing, but it is not a CRDT and does not promise conflict-free offline editing.

## 6. Realtime behavior

### Presence channel

Use a private scene-scoped channel for:
- active participant identity (minimal display name/avatar metadata);
- role;
- selected object ID;
- lightweight viewport/cursor state where useful;
- heartbeat/presence lifecycle.

Presence is ephemeral. Do not persist pointer coordinates or high-frequency cursor telemetry.

### Document updates

Use database change notifications for committed scene revisions. A client receiving a new revision should:
- ignore duplicate/older revisions;
- fetch the authoritative scene or apply a verified committed operation;
- update the local editor without destroying an active drag;
- reconcile pending local commands;
- show connection and synchronization state.

Throttle high-frequency transient interactions. Do not broadcast every pointer movement or raw frame update as a durable scene mutation.

### Reconnect and recovery

- Rejoin the private channel and re-check authorization.
- Fetch latest scene snapshot and revision.
- Reconcile any pending command IDs against committed command records.
- Reapply only commands known to be safe against the new revision.
- Show unresolved edits and let the user retry or copy the local intent.
- If access has been revoked, stop subscriptions and clear the private scene from memory.

## 7. Invitation and membership lifecycle

1. Owner opens sharing controls.
2. Owner specifies an email/account recipient and role.
3. Server validates owner permission, recipient format, rate limits, and invitation policy.
4. Recipient receives an expiring invitation.
5. Recipient authenticates and accepts.
6. Server validates token, intended identity, expiry, and scene status.
7. Server creates membership.
8. Realtime channel authorization recognizes the member.
9. Owner can revoke membership at any time; revoked members lose access on the next authorized request/channel recheck.

If invitation delivery is not configured, do not simulate success. Provide a clearly labeled local-development invitation path only in test environments.

## 8. Data privacy and abuse controls

- Private channels only.
- Never include full scene documents in presence payloads.
- Validate and cap message size and command frequency.
- Rate-limit invite creation and acceptance.
- Do not expose recipient account existence.
- Avoid logging document contents, invite tokens, or private emails.
- Enforce membership and role checks on every mutation, not only at room join.
- Re-check authorization after reconnect and on sensitive operations.
- Revoke access promptly when membership is removed.
- Do not use service-role credentials in the browser.

## 9. Performance and UX

- Show participant avatars/initials and role labels.
- Clearly distinguish local selection from other collaborators' selections.
- Use restrained selection outlines and names; avoid cluttering the viewport.
- Provide connection state: connected, reconnecting, offline, sync pending, conflict.
- Keep the editor usable when no collaborators are present.
- Provide a viewer mode that disables edit affordances and keyboard mutation commands.
- Presence updates should be throttled and low-volume.
- Keep the scene viewport and editing controls responsive while remote changes arrive.

## 10. Testing matrix

Use at least Alice (owner), Bob (editor), Casey (viewer), Dana (revoked member), and an anonymous session.

| Scenario | Expected |
|---|---|
| Owner invites editor | Invitation created; no access until accepted |
| Editor accepts | Membership established; scene readable/editable |
| Viewer accepts | Scene readable; all mutations denied |
| Anonymous joins private channel | Denied |
| Non-member guesses scene ID | No scene or presence access |
| Editor tries to invite another user | Denied |
| Viewer sends edit command | Denied |
| Two editors edit different objects | Both accepted in revision order |
| Two editors edit same property | Deterministic server order; UI communicates winning update |
| Duplicate command retries | Idempotent; no duplicate mutation |
| Client misses realtime event | Snapshot/revision recovery restores state |
| Member is revoked while connected | Access removed; subscriptions and private state cleared |
| Malformed/oversized command | Rejected |
| Owner deletes scene | Membership/invitations/commands handled by cascade or explicit cleanup |

## 11. MVP acceptance criteria

- Owner can invite a registered or new account through a real, verified invitation flow.
- Owner can assign editor/viewer and revoke membership.
- RLS and private-channel policies enforce the role matrix.
- Two authenticated clients see presence and committed changes without refresh.
- Concurrent edits are serialized and conflict behavior is visible.
- Reconnect recovers the latest authoritative scene without silent data loss.
- Viewers cannot mutate through UI, API, database, or realtime paths.
- Revoked users lose access.
- Multi-user integration tests pass in an isolated Supabase project.

## 12. Deferred architecture decisions

Before implementation, verify Supabase Realtime authorization and quotas for the selected plan, current invitation API behavior, database function/transaction design, and the exact Next.js server boundary. If the resulting custom synchronization layer becomes disproportionately complex, evaluate a dedicated collaboration provider as a separate cost/security decision. Do not quietly substitute an unreviewed third-party service.

No collaboration SQL has been applied and no real-time implementation has been built or tested.
