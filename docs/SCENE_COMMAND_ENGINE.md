# FORMA — Scene Command Engine Contract

**Version:** 0.1  
**Phase:** 05 — Technical Architecture  
**Status:** Proposed command contract; implementation draft requires isolated Supabase validation

## 1. Purpose

Scene Studio mutations are commands, not client-side document replacements. Each command is authenticated, authorized, validated, serialized against a scene revision, applied atomically, and recorded with an idempotency receipt.

PostgreSQL is the durable authority. Realtime is only a notification/presence transport.

## 2. Envelope

The RPC accepts p_scene_id (uuid), p_command_id (uuid), p_expected_revision (bigint), p_command_type (allowlisted text), and p_payload (JSON object, maximum 16 KiB in this draft). The actor is always derived from auth.uid(); no actor/user/owner ID is accepted from the browser.

## 3. Initial command catalog

| Command | Payload | Stale-revision policy |
|---|---|---|
| object.create | { object } | Reject |
| object.delete | { target_id } | Reject |
| object.rename | { target_id, name } | Reject |
| object.transform.set | { target_id, transform } | Reject |
| object.visibility.set | { target_id, visible } | Reject |
| object.material.set | { target_id, material } | Reject |
| scene.settings.set | { settings } | Reject |

**MVP policy:** all stale revisions are rejected. Independent edits are not automatically rebased until their semantics and UX have been tested. The client fetches the latest snapshot and explicitly reapplies intent with a new command ID and current revision.

## 4. Payload contract

A created object contains exactly id, type, name, visible, transform, and material. ID is 1–64 characters and unique in the scene; type is box, sphere, or plane; trimmed name is 1–80 characters; visible is boolean; transform contains position, rotation, and scale vectors; material contains a #RRGGBB color.

Transform bounds in this draft: position axes -10,000..10,000; rotation axes -100,000..100,000 degrees; scale axes 0.001..1,000. Zero/negative scale is rejected. These are initial server bounds, not a substitute for renderer profiling.

Other payloads: target_id must identify an existing object; rename name is trimmed 1–80 characters; visibility is boolean; transform contains exactly three vectors; material contains exactly color; settings contains exactly background (#RRGGBB) and gridVisible (boolean). Unknown/missing fields, malformed shapes, oversized payloads, and invalid values are rejected.

## 5. Atomic transaction

1. Reject unauthenticated callers and invalid envelope values.
2. Lock the target scene row.
3. Confirm caller is owner or current editor.
4. Check the scene/command receipt. Same actor, command type, expected revision, and canonical JSONB payload fingerprint returns the original committed revision without another mutation. Reuse with a different actor or request fingerprint is rejected.
5. Compare expected revision with the locked current revision; mismatch changes nothing.
6. Validate and apply one allowlisted command.
7. Increment revision exactly once.
8. Update scene and insert receipt in the same PostgreSQL transaction.
9. Return command ID, resulting revision, and duplicate flag.

Any exception rolls back both document change and receipt. The row lock serializes accepted commands for one scene.

## 6. Error contract

| Error | Meaning | Client behavior |
|---|---|---|
| FORMA_UNAUTHENTICATED | No valid user | Re-authenticate |
| FORMA_NOT_FOUND | Scene unavailable | Do not reveal private existence |
| FORMA_FORBIDDEN | Not owner/editor | Read-only/request access |
| FORMA_INVALID_COMMAND | Unsupported or malformed | Preserve draft and explain |
| FORMA_REVISION_CONFLICT | Stale revision | Fetch snapshot and ask to reapply |
| FORMA_LIMIT_EXCEEDED | Payload/object/document budget | Preserve draft and explain |
| FORMA_IDEMPOTENCY_MISMATCH | Command ID reused with different actor/type | Treat as client bug; do not retry same ID |

Next.js must map stable database identifiers to typed application errors; raw database internals must not reach users.

## 7. Collaboration UX states

- **Saved:** latest local command has a committed receipt/revision.
- **Saving:** command sent, awaiting authoritative result.
- **Conflict:** revision mismatch; local intent remains available for explicit reapply.
- **Offline:** transport unavailable; local edits are visibly local, not cloud-saved.
- **Reconnecting:** restore session/channel, fetch authoritative snapshot, then reconcile pending IDs.
- **Read-only:** viewer or revoked access; disable mutation and clear private data after revocation.
- **Error:** command rejected; explain whether correction or retry is possible.

Never label a command saved before the RPC commits. Optimistic viewport feedback must remain visibly pending.

## 8. Realtime event

After commit, publish only minimal metadata (scene ID, revision, command ID, actor ID, command type) to authorized private subscribers. Do not treat broadcast as durable or send the full scene. Ignore duplicate/older revisions and fetch an authoritative snapshot on a gap.

## 9. Required tests

- Owner/editor accepted; viewer/non-member/anonymous denied.
- Client-supplied actor identity cannot influence authorization or receipts.
- Direct REST UPDATE to scene document/revision denied.
- Valid command payloads accepted; unknown/malformed fields rejected.
- Duplicate retry returns original revision without second mutation.
- Reused command ID with different actor/type rejected.
- Stale revision rejected without partial update.
- Concurrent commands serialize and produce sequential revisions.
- Failure before receipt insertion rolls back scene update.
- Object count, payload bytes, transform bounds, and color syntax enforced.
- Revoked editor cannot submit later commands.
- Error mapping does not leak private existence or database internals.

**Status:** Contract and SQL draft only. No migration, RPC, integration test, or concurrency test is claimed as executed.