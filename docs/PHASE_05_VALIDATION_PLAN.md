# FORMA — Phase 05 Technical Validation Plan

**Version:** 0.1  
**Phase:** 05 — Technical Architecture  
**Status:** Proposed execution plan; no tests in this document are claimed as run  
**Purpose:** Define evidence required before Phase 05 approval and before production implementation.

---

## 1. Validation principles

- Use an isolated development Supabase project or local Supabase stack. Never run destructive tests against production.
- Use synthetic accounts and data only.
- Validate the exact approved architecture: Next.js App Router, TypeScript, Supabase, R3F, Zustand, Zod, Vitest, React Testing Library, Playwright, and axe-core.
- Treat database transactions and RLS as authoritative; UI restrictions are not security controls.
- Record tool versions, project region/plan, test date, reproducible steps, and evidence.
- Any failed security or data-integrity test blocks the affected feature; do not waive failures silently.

## 2. Environment and provider spike

### Required setup
- Confirm current Next.js and Supabase SSR integration compatibility.
- Confirm Supabase Auth redirect, confirmation, recovery, and email delivery behavior.
- Confirm Realtime private-channel authorization and membership-based access behavior.
- Confirm PostgreSQL function/RPC transaction support for the scene command protocol.
- Confirm current plan limits for database, Realtime concurrent connections/messages, Auth email, storage, backups, and project inactivity.
- Confirm Vercel Preview/Production environment-variable separation.

### Evidence
- Provider/plan and region recorded.
- Separate development/preview/production resource map.
- Verified redirect URL list.
- Realtime quota notes with headroom assumptions.
- A real invitation email delivered and accepted in development, or a documented blocker/provider decision.

Do not assume free-tier quotas are sufficient until tested against expected simultaneous collaborators and update frequency.

## 3. Database and authorization tests

Create synthetic identities:
- Alice: scene owner.
- Bob: editor.
- Casey: viewer.
- Dana: previously authorized, then revoked.
- Erin: unrelated authenticated user.
- Anonymous: no session.

| Test | Action | Expected result |
|---|---|---|
| DB-01 | Alice creates a scene | Owner is derived from authenticated identity |
| DB-02 | Bob reads after accepted membership | Allowed |
| DB-03 | Casey reads after viewer membership | Allowed |
| DB-04 | Erin/anonymous read by guessed UUID | Denied/no private data |
| DB-05 | Bob attempts to invite or change role | Denied |
| DB-06 | Casey attempts any edit command | Denied |
| DB-07 | Bob attempts scene deletion | Denied |
| DB-08 | Alice changes role/revokes member | Allowed and effective |
| DB-09 | Dana accesses after revocation | Denied on new reads and mutations |
| DB-10 | Direct table update bypasses command RPC | Denied |
| DB-11 | User attempts to insert membership for self | Denied |
| DB-12 | Artifact owner isolation | Other users cannot read or modify private recipes |

Run tests through actual authenticated user contexts and direct data APIs, not only mocked server functions.

## 4. Invitation lifecycle tests

| Test | Action | Expected result |
|---|---|---|
| INV-01 | Owner invites verified recipient | Pending invitation created |
| INV-02 | Open invitation while signed out | Authentication required; no membership yet |
| INV-03 | Intended verified recipient accepts | Membership created exactly once |
| INV-04 | Different account accepts forwarded link | Denied |
| INV-05 | Reuse accepted token | Denied |
| INV-06 | Accept expired/revoked token | Denied |
| INV-07 | Owner revokes pending invitation | Cannot be accepted |
| INV-08 | Non-owner creates invitation | Denied |
| INV-09 | Burst invitation requests | Rate-limited |
| INV-10 | Compare existing/non-existing recipient response | No account enumeration |
| INV-11 | Simulate email provider failure | UI reports failure; no false success |
| INV-12 | Race two acceptance requests | Exactly one membership and one successful consumption |

## 5. Scene command and concurrency tests

### Command contract
Every command includes an idempotency ID, scene ID, expected revision, allowlisted command type, and bounded payload. Actor ID comes from the verified session, never from client input.

| Test | Action | Expected result |
|---|---|---|
| CMD-01 | Valid editor command | One committed revision |
| CMD-02 | Viewer submits command | Denied |
| CMD-03 | Non-member submits command | Denied |
| CMD-04 | Duplicate command ID retried | Original result returned; no duplicate edit |
| CMD-05 | Malformed or unknown command | Rejected before mutation |
| CMD-06 | Target object does not exist | Rejected or safe no-op by explicit contract |
| CMD-07 | Stale revision, safe independent edit | Rebase only if command semantics prove safe |
| CMD-08 | Stale revision, conflicting property edit | Explicit conflict; no silent overwrite |
| CMD-09 | Two clients edit different objects concurrently | Both durable outcomes preserved in serial order |
| CMD-10 | Two clients edit same property concurrently | Deterministic committed order and visible winner |
| CMD-11 | DB transaction fails mid-operation | Neither scene update nor command receipt partially commits |
| CMD-12 | Oversized document/object count | Rejected within documented limits |
| CMD-13 | Client spoofs actor ID | Ignored; actor derived from auth context |

Do not promise automatic rebase for arbitrary commands. Define the safe-rebase rules command by command.

## 6. Realtime and recovery tests

| Test | Action | Expected result |
|---|---|---|
| RT-01 | Owner/editor/viewer join private room | Authorized presence only |
| RT-02 | Non-member joins guessed channel | Denied |
| RT-03 | Two editors commit changes | Other authorized clients converge to authoritative revision |
| RT-04 | Duplicate/out-of-order notification | Older/duplicate revision ignored |
| RT-05 | Client disconnects during edit | Pending intent preserved and state visible |
| RT-06 | Client reconnects after missed events | Snapshot + revision restores authoritative state |
| RT-07 | Member revoked while connected | Subsequent reads/commands denied; channel and local private state cleared |
| RT-08 | Realtime service unavailable | Editor displays degraded/offline state; durable writes remain explicit |
| RT-09 | Presence payload contains oversized/private data | Rejected or omitted by schema |
| RT-10 | High-frequency cursor movement | Throttled; not written as durable scene revisions |

Measure convergence time and connection/message use with a realistic number of synthetic clients before choosing production limits.

## 7. Generative determinism and safety tests

- Same generator ID/version, seed, and normalized parameters produce the same output where determinism is promised.
- Invalid, unknown, NaN, infinite, or out-of-range parameters are rejected.
- Unknown generator versions fail safely with an understandable compatibility state.
- Malicious generator IDs cannot load arbitrary modules.
- High-complexity parameter combinations are bounded by per-generator resource limits.
- Artifact ownership is enforced by RLS.
- Exported recipe contains sufficient provenance to reproduce the intended versioned result.
- Reduced-motion and no-WebGL fallbacks preserve the core task.

## 8. Application and UX tests

### Unit — Vitest
- Zod schemas and normalization.
- Scene command reducers and invariants.
- Revision comparison and idempotency behavior.
- Generator determinism and bounds.
- Invitation token/expiry logic where testable without real secrets.

### Component — React Testing Library
- Owner/editor/viewer affordances.
- Pending/saved/conflict/offline/reconnecting states.
- Invite, accept, revoke, and error flows.
- Reduced-motion and fallback content.

### Browser — Playwright
- Public browsing without login.
- Registration, confirmation, sign-in, recovery, sign-out.
- Owner creates and shares a scene.
- Separate browser contexts for editor and viewer.
- Two editors concurrently change different objects.
- Viewer mutation attempts are blocked.
- Revocation during an open session.
- Reconnect after network interruption.
- Mobile viewport and keyboard-only journeys.

### Accessibility — axe-core + manual
- Automated checks on all primary routes and dialogs.
- Keyboard navigation and focus management.
- Live region announcements for sync/conflict/presence changes without excessive chatter.
- Touch alternatives for viewport actions.
- Reduced motion and non-WebGL flows.

## 9. Operational, performance, and deployment checks

- Confirm Preview never uses Production Supabase keys or data.
- Scan repository history and build output for secrets.
- Confirm structured logs redact tokens, emails, and scene contents.
- Profile representative low/mid-range devices.
- Verify WebGL failure/context-loss fallback and resource cleanup.
- Measure public route Core Web Vitals and Scene Studio frame time.
- Load-test collaboration with expected MVP concurrency and an agreed safety margin.
- Test database backup/export and a documented restore rehearsal before production launch.

## 10. Required evidence package

Before Phase 05 is approved, attach or summarize:
1. Approved environment and service/plan matrix.
2. Versioned migration files and successful fresh-database apply result.
3. RLS test results for all roles and anonymous access.
4. Invitation lifecycle and email-delivery test results.
5. Atomic command/idempotency/concurrency test results.
6. Realtime join, revocation, disconnect, and recovery results.
7. Generative determinism/resource-bound results.
8. Threat-model review and resolved blockers.
9. Accessibility, fallback, and performance validation notes.
10. Explicit list of accepted residual risks.

## 11. Stop/go criteria

**Stop:** Any unauthorized private read/write, privilege escalation, invitation replay, silent committed-data loss, unbounded generator path, leaked secret, or false-success UI.

**Go to Phase 06:** All architecture-critical choices are validated or explicitly revised and approved; schema/RLS design is stable; invitation and collaboration approach is viable within approved cost constraints; implementation boundaries and threat model are accepted; product owner explicitly approves Phase 05.

This plan is a specification only. No provider configuration, migration, test, load test, or deployment is claimed as completed.
