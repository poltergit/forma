# FORMA — Realtime Authorization & Recovery

**Version:** 0.1  
**Phase:** 05 — Technical Architecture  
**Status:** Review specification and SQL draft; provider behavior remains unverified

## 1. Objective

Define private scene-scoped Realtime authorization and a deterministic recovery path for missed, duplicate, delayed, or out-of-order notifications. PostgreSQL remains the durable authority. Realtime only transports presence and hints that a new revision may exist.

## 2. Channel contract

- Canonical topic: forma:scene:<lowercase-scene-uuid>:v1.
- Every client channel must be private; public channels are forbidden for scene collaboration.
- Supabase Realtime authorization uses RLS on realtime.messages.
- Authenticated owner, editor, and viewer members may receive and send ephemeral channel messages. Non-members and anonymous sessions are denied.
- Authorization is based on the current membership helper, not a role or user ID supplied in the channel payload.
- The channel is versioned so future payload contracts can coexist without silently interpreting incompatible messages.

The policy migration is a provider-specific review draft. Confirm the current Realtime schema, topic helper, private-channel configuration, and policy evaluation behavior in an isolated Supabase project before applying it.

## 3. Presence contract

Presence is ephemeral and intentionally low sensitivity. Suggested payload:
- authenticated user ID (derived client-side for display correlation, not trusted for authorization);
- selected object ID, if any;
- coarse viewport mode (for example, editing or viewing);
- optional throttled cursor/selection coordinates only if the UX requires them.

Never include scene documents, invitation links/tokens, email addresses, session data, access tokens, full object properties, or privileged roles. Treat every presence field as attacker-controlled. A displayed role must come from the authorized membership query, not the presence payload.

## 4. Broadcast contract

Only send a minimal revision hint after the database command RPC has committed:
- event type: scene.revision;
- scene ID;
- resulting revision;
- command ID;
- actor ID, if needed for attribution.

Do not broadcast a full scene document or assume a broadcast proves a commit. A malicious member can forge a client-originated event; receiving clients must verify by reading the authoritative scene revision and, where relevant, command receipt. UI must never show a change as saved based only on a broadcast.

## 5. Authorization and revocation

- Database RLS and the scene command RPC remain authoritative for every durable read/write.
- Private-channel policy checks membership on channel authorization. Verify whether the deployed Realtime service re-evaluates policy for an already-open channel after membership deletion; do not assume immediate socket revocation.
- Member removal is serialized against scene commands by the scene-row lock in the membership RPC and command RPC.
- If a removed user retains an open socket, their subsequent scene reads and writes must still fail at PostgreSQL/RPC boundaries. Realtime payloads must therefore contain no private scene content.
- Test whether the provider supports an explicit server-side channel kick/termination mechanism. If it does, evaluate a server-only implementation; never expose the service-role key to the browser.
- On access loss, the client clears scene state, stops rendering private content, unsubscribes, and returns to a no-access state.
- Rejoin/reconnect always reauthorizes against current membership.

## 6. Reconnect and recovery protocol

1. Pause command dispatch and mark the editor reconnecting.
2. Restore the authenticated Supabase session.
3. Rejoin the private channel and wait for an explicit successful subscription state.
4. Fetch the authoritative scene snapshot and revision through the membership-protected database read.
5. Submit the client's pending command IDs to get_scene_command_receipts (maximum 100 IDs per request).
6. Match receipts by command ID. Mark confirmed commands committed at their returned revisions.
7. Retry only commands with no receipt, using the original command ID and original expected revision. The atomic command RPC makes a late retry idempotent if the original request committed concurrently.
8. If the retry returns a revision conflict, do not blindly rebase. Re-evaluate command semantics and surface a conflict where independence cannot be proven.
9. Resume normal dispatch and revision notifications.

Only commands already submitted to the server are recoverable through receipts. Unsubmitted local edits are volatile in the MVP; do not promise offline multi-user editing or durable offline queues until separately designed.

## 7. Receipt lookup

The command receipt table is not directly readable by browser clients. get_scene_command_receipts is a narrow authenticated RPC:
- caller must be a current scene member;
- request contains 1–100 command UUIDs;
- results are limited to receipts created by the caller;
- request fingerprint and full command payload are never returned.

## 8. Failure states

- Connecting / subscribing: do not claim presence or sync is ready.
- Connected: channel authorization succeeded; database operations still independently enforce access.
- Reconnecting: pause new command dispatch and preserve pending IDs in memory.
- Offline: no new command is reported as saved.
- Access revoked: clear private scene state and unsubscribe.
- Recovery conflict: preserve the user's intent visibly; require explicit resolution.

## 9. Required validation

- Anonymous and non-member channel join denied.
- Owner/editor/viewer join and presence publication allowed only on private channels.
- Public-channel attempt rejected or never created by application code.
- Forged revision broadcast cannot make the UI claim a durable save.
- Duplicate and out-of-order hints converge to the authoritative snapshot.
- Reconnect after a committed-but-unacknowledged command resolves via receipt lookup.
- Same command ID retry is idempotent; stale revision conflict is visible.
- Receipt RPC rejects non-members, anonymous users, null/empty/oversized ID arrays, and does not return another actor's receipts.
- Remove member while connected; verify database reads/mutations fail immediately and measure Realtime socket revocation behavior. Record whether explicit channel termination is available.
- Verify no scene document, email, token, or secret appears in presence, broadcast, browser logs, or provider logs.

This specification and SQL migration are not implemented or provider-tested. Realtime policy semantics, channel revocation, and quotas remain Phase 05 validation blockers.
