# FORMA — Database Migration Design Review

**Version:** 0.1  
**Phase:** 05 — Technical Architecture  
**Status:** Draft for review; not applied, executed, or security-tested  
**Migration draft:** supabase/migrations/20261121000100_forma_core_schema.sql

## 1. Purpose

Translate the approved Phase 05 data model into a concrete Supabase/PostgreSQL baseline for scenes, memberships, invitations, idempotent command receipts, and private reproducible generative artifacts.

This is a reviewable migration artifact, not evidence that a Supabase project exists or that the SQL has been applied.

## 2. Included

- public.scenes with owner, versioned JSON document, revision, timestamps, and immutable ownership.
- public.scene_members with editor/viewer roles and owner represented by scenes.owner_id.
- public.scene_invitations with normalized recipient identity, SHA-256 token hash shape, expiry, accepted/revoked timestamps, and unique token hash.
- public.scene_command_receipts with unique per-scene idempotency key, request fingerprint, and resulting revision.
- public.generative_artifacts with owner, generator ID/version, seed, parameters, and schema version.
- Timestamp triggers and immutable owner guards.
- Narrow SECURITY DEFINER membership helpers with empty search path and minimal execute grants.
- RLS policies for private scene reads, owner-only scene creation/deletion, member list reads, and owner-only artifact CRUD.
- Explicit table grants; no direct client update to scene documents and no direct client access to invitation/receipt tables.

## 3. Deliberate restrictions

The migration intentionally does not provide:
- Direct client scene document updates.
- Direct membership or invitation writes.
- Direct command receipt reads/writes.
- A scene mutation RPC.
- Invitation creation/acceptance RPC or email delivery.
- Realtime channel authorization policies.
- Public sharing, public artifacts, storage buckets, or arbitrary generator execution.

These are separate security-sensitive operations and must be added only after their contracts and provider behavior are reviewed. Until the corresponding RPCs exist, collaboration editing and invitations are not operational.

## 4. Important implementation review points

1. **Supabase environment:** Confirm the target PostgreSQL version, extensions, migration role, and default grants. The draft uses gen_random_uuid() and Supabase auth.uid().
2. **RLS helper ownership:** Confirm the migration owner and table ownership semantics so the two narrowly scoped SECURITY DEFINER helper functions bypass table RLS as intended. Keep their empty search path, fully qualified objects, and limited execute grants.
3. **Owner checks:** The owner ID defaults to auth.uid(), has a check constraint against the session, and cannot be changed by ordinary updates. Confirm behavior for privileged migrations/service operations.
4. **Privileges:** Verify effective privileges after Supabase default grants and project-level default privileges. No authenticated UPDATE grant exists on scenes by design.
5. **Scene document validation:** The database checks that the document is a JSON object; full schema, object count, finite transforms, and byte limits remain application/RPC validation responsibilities.
6. **Invitation identity:** Email normalization and identity binding must use the verified Supabase Auth identity at acceptance; a normalized email string alone is not authorization.
7. **Token hashing:** Generate a cryptographically random token in a trusted server operation and store only its SHA-256 hex digest. Never log or persist the raw token.
8. **Command receipts:** Unique (scene_id, command_id) is the database idempotency constraint. A future RPC must insert the scene mutation and receipt in the same transaction.
9. **Realtime:** This migration does not create channel policies. Private channel topic authorization, realtime.messages policies, and revocation semantics require a provider-specific isolated test.
10. **Delete semantics:** Scene deletion cascades memberships, invitations, and receipts. Confirm this aligns with future retention and recovery requirements.

## 5. Follow-up migrations required

- Scene command RPC draft: typed allowlist, actor from auth.uid(), role checks, row lock/revision protocol, request-fingerprint idempotency, transaction rollback behavior, and no arbitrary document replacement. See SCENE_COMMAND_ENGINE.md and 20261121000200_forma_scene_command_rpc.sql.
- Invitation RPCs: owner-only creation/revocation, token-hash verification, intended verified identity check, atomic one-time acceptance, expiry, and rate limiting.
- Membership management RPC: owner-only role changes and revocation.
- Realtime authorization: private scene channel access for current members only, with tested reauthorization/revocation.
- Optional operational policies: rate limits, cleanup/retention, and audit requirements after concrete service constraints are known.

## 6. Validation sequence

In an isolated Supabase project only:
1. Apply to a fresh database and confirm clean migration.
2. Inspect table owners, grants, policies, indexes, triggers, and function definitions.
3. Run owner/editor/viewer/non-member/anonymous RLS tests.
4. Attempt direct REST updates to scene document/revision and direct invitation/member/receipt writes; all must be denied.
5. Test artifact ownership isolation and immutable owner fields.
6. Add and test command/invitation/realtime migrations separately.
7. Test rollback and repeatability using the project's migration workflow.

No SQL execution, migration application, database test, or security test is claimed as completed.

## 7. Stop/go

Do not connect this draft to production. Do not begin application feature implementation on the assumption that command and invitation RPCs already exist. Phase 05 remains open until the migration is applied and tested in an isolated environment, the missing security-sensitive operations are specified and verified, provider limits are confirmed, and the product owner approves the final architecture review.
