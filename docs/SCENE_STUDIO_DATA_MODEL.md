# FORMA — Scene Studio Data Model & Security

**Version:** 0.3  
**Status:** Proposed; collaboration-aware model requires isolated validation  
**Backend:** Supabase PostgreSQL + Auth + RLS  
**Scope:** Private scenes with owner/editor/viewer membership

---

## 1. Principles

- Scene documents are versioned JSON data, not serialized Three.js runtime objects.
- The authenticated owner owns the scene; collaboration is granted through explicit membership.
- RLS is the authorization boundary, not a substitute for application validation.
- Scene writes are revision-aware and performed through a typed server-authorized command layer.
- All client/database data is untrusted and validated at runtime.
- No public sharing or anonymous access in the MVP.

## 2. Tables

### `public.scenes`

| Field | Type | Rule |
|---|---|---|
| id | uuid | Primary key |
| owner_id | uuid | Required auth.users reference |
| title | text | Trimmed, 1–80 characters |
| document | jsonb | Versioned SceneDocument |
| schema_version | integer | Initially version 1 |
| revision | bigint | Starts at 1; increments on accepted command |
| created_at | timestamptz | Server generated |
| updated_at | timestamptz | Server maintained |

### `public.scene_members`

| Field | Type | Rule |
|---|---|---|
| scene_id | uuid | FK scenes, cascade delete |
| user_id | uuid | FK auth.users, cascade delete |
| role | text | editor or viewer only |
| invited_by | uuid | Auth user who granted access |
| created_at | timestamptz | Server generated |

Primary key: scene_id + user_id. Owner is represented by scenes.owner_id, not a duplicate membership.

### `public.scene_invitations`

| Field | Type | Rule |
|---|---|---|
| id | uuid | Primary key |
| scene_id | uuid | FK scenes, cascade delete |
| recipient_email_normalized | text | Intended recipient identity |
| role | text | editor or viewer |
| token_hash | text | Hash of random single-use token |
| invited_by | uuid | Scene owner |
| expires_at | timestamptz | Short-lived expiry |
| accepted_at | timestamptz nullable | Acceptance timestamp |
| revoked_at | timestamptz nullable | Revocation timestamp |
| created_at | timestamptz | Server generated |

Raw tokens must never be stored. Invitation rows are only accessed through trusted server operations. Avoid disclosing whether a recipient email maps to an existing account.

### `public.scene_command_receipts` (required for collaboration MVP)

| Field | Type | Rule |
|---|---|---|
| scene_id | uuid | Scene reference; cascade delete |
| command_id | uuid | Client-generated idempotency key |
| actor_id | uuid | Derived from authenticated database identity |
| command_type | text | Allowlisted command name |
| resulting_revision | bigint | Revision committed by this command |
| created_at | timestamptz | Server generated |

Use `(scene_id, command_id)` as a unique key. Retain only the metadata needed to make retries idempotent and reconcile pending commands after reconnect. Define a retention policy before launch; do not retain full command payloads or snapshots without a separate decision.

## 3. Scene document V1

```ts
type Vec3 = [number, number, number];
type SceneObjectType = "box" | "sphere" | "plane";

type SceneDocumentV1 = {
  schemaVersion: 1;
  settings: {
    background: string;
    gridVisible: boolean;
  };
  objects: Array<{
    id: string;
    type: SceneObjectType;
    name: string;
    visible: boolean;
    transform: {
      position: Vec3;
      rotation: Vec3;
      scale: Vec3;
    };
    material: { color: string };
  }>;
};
```

The first editor version supports box/sphere/plane primitives, object names, visibility, transforms, background, grid visibility, and simple color materials. Add more features through explicit schema evolution.

## 4. Proposed authorization matrix

| Operation | Owner | Editor | Viewer | Non-member |
|---|---:|---:|---:|---:|
| Read scene | Yes | Yes | Yes | No |
| Edit scene | Yes | Yes | No | No |
| Delete scene | Yes | No | No | No |
| Rename scene | Yes | Yes | No | No |
| Add/remove members | Yes | No | No | No |
| Change roles | Yes | No | No | No |
| Read presence | Yes | Yes | Yes | No |

Every action requires server-side role validation and matching database policy. Viewers must be unable to mutate through API, SQL, or realtime paths.

## 5. RLS policy intent

- Owner and members can read scenes according to the role matrix.
- Owner/editor may mutate scene content only through the narrowly scoped command RPC.
- Ordinary browser roles must not have direct table privileges to update `scenes.document` or `scenes.revision`; this prevents bypassing validation, revision ordering, and command receipts.
- Owner may delete a scene through a separately authorized operation.
- Membership and invitation mutations use owner-only trusted operations.
- Only owner can delete scenes or manage membership/invitations.
- Viewers have read-only access.
- Anonymous and non-members have no access.
- Membership changes are not self-service.
- Invitations are not directly selectable by ordinary authenticated users.
- Realtime channels are private and authorized against current membership.

Avoid recursive RLS policy definitions. Any security-definer helper must pin search_path, use minimal execute grants, and be reviewed. Test policies using actual authenticated database roles. The initial owner-only SQL in older versions of this document must not be treated as sufficient for collaboration.

## 6. Revision-aware command protocol

Do not let clients replace a full scene document using a stale revision.

Each edit is a typed command with:
- command ID (idempotency key);
- scene ID;
- expected revision;
- allowlisted command type;
- target object ID if relevant;
- validated payload.

Trusted request and database operation:
1. Next.js validates session and command envelope with Zod.
2. The browser/server request invokes a narrowly scoped PostgreSQL RPC using the authenticated user's Supabase session; the database derives actor identity from `auth.uid()`.
3. The RPC verifies owner/editor membership and command authorization.
4. Inside one transaction, it checks command ID idempotency, locks/reads the latest scene and revision, validates command semantics, applies the command, increments revision, updates the scene, and inserts the command receipt.
5. The RPC returns the prior receipt for a duplicate command ID, or the newly committed revision and minimal change metadata.

The database function—not a sequence of Next.js requests—is the atomicity boundary. Prefer security-invoker execution where feasible. If security-definer is necessary, pin `search_path`, schema-qualify all objects, restrict execute grants, and repeat identity/role checks inside the function. A Next.js authorization check alone is insufficient.

Concurrent commands are serialized. Same-property edits use commit order; clients display collaborator attribution and clear conflict feedback. Unsafe stale commands are rejected and can be reapplied by the user. Undo is a compensating command, not deletion of another person's work.

## 7. Realtime behavior

- Supabase Realtime private channels provide scene presence and committed-change notifications.
- Presence is ephemeral and includes minimal identity, role, selected object, and optional throttled cursor/viewport state.
- Database revision is authoritative; realtime notification is not durable.
- Ignore duplicate/older revisions.
- On reconnect, re-authorize, fetch latest snapshot, reconcile command receipts, and restore safe pending commands.
- Revoked users are unsubscribed and private state cleared.
- Do not broadcast full documents or high-frequency pointer events as durable mutations.

See [Real-Time Collaboration](REALTIME_COLLABORATION.md), [Security Threat Model](SECURITY_THREAT_MODEL.md), and [Phase 05 Technical Validation Plan](PHASE_05_VALIDATION_PLAN.md).

## 8. Validation and limits

- Reject unknown document/schema versions and unexpected properties.
- Require finite transform values and supported primitive types.
- Enforce unique object IDs and bounded object names.
- Initial object-count proposal: 100 per scene.
- Initial serialized scene document proposal: 1 MiB.
- Validate color syntax and numeric ranges.
- Validate every command and every generator parameter at runtime.
- Revalidate after database reads.
- Establish collaboration command size/rate limits per user and scene before launch.

Limits are initial proposals; profile and test before production.

## 9. Security and testing matrix

Test in an isolated Supabase environment using Alice (owner), Bob (editor), Casey (viewer), Dana (revoked member), and anonymous:

- Anonymous/non-member cannot read scene or join presence.
- Owner can invite, change role, revoke; others cannot.
- Editor can edit but cannot manage membership or delete.
- Viewer can read/presence but cannot mutate.
- Invitation token is single-use, expires, is identity-bound, and is stored hashed.
- Duplicate command ID is idempotent.
- Concurrent commands produce deterministic revisions.
- Missed realtime events recover from snapshot.
- Revocation removes access for connected clients.
- Malformed and oversized commands are rejected.
- Owner deletion cleans related rows through explicit cascade/cleanup.

## 10. Storage decision

No storage bucket is needed for the primitive-only editor. When assets or thumbnails are introduced, use private buckets, owner/member-scoped policies, server-side content and size validation, and orphan cleanup.

## 11. Acceptance criteria

- Migrations apply cleanly to a fresh isolated database.
- RLS proves owner/editor/viewer/revoked/anonymous boundaries.
- Invitation flow is real and tested; no fake success states.
- Commands are authorized, validated, idempotent, and revision ordered through the PostgreSQL RPC; direct table-write bypass is denied.
- Multiple clients see committed changes without manual refresh.
- Reconnect restores authoritative state without silent loss.
- Failed saves preserve local work and explain recovery.
- No production secrets or raw invitation tokens are committed.

**Status:** Proposed architecture only. No migration has been applied; no RLS, invitation, or realtime test has been run.
