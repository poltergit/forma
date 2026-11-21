# FORMA — Phase 05 Architecture Review

**Version:** 0.3  
**Phase:** 05 — Technical Architecture  
**Status:** Owner decisions recorded; technical validation and final approval remain open  
**Purpose:** Consolidate the approved direction, supporting architecture, collaboration requirements, and Phase 05 acceptance criteria before Phase 06.

---

## 1. Approved decisions

- **D-014:** Next.js App Router, TypeScript, Supabase, Three.js + React Three Fiber, Vercel, CSS tokens + CSS Modules; Zustand, Zod, selective Drei, Vitest, React Testing Library, Playwright, axe-core; defer TanStack Query.
- **D-015:** Spatial, generative, performative, expressive, intentionally art-directed experience.
- **D-016:** Ambitious first-release creative scope: spatial Home, original Playground studies, parameter-rich Motion Lab, reproducible generative artifacts, and Scene Studio.
- **D-017:** Invite-only real-time collaboration in Scene Studio MVP, with owner/editor/viewer roles, presence, committed changes, conflict handling, and reconnect recovery.

## 2. Architecture baseline

- App Router owns route composition and server-rendered content.
- Server actions/route handlers are validation/session boundaries.
- PostgreSQL RPC is the atomic boundary for collaborative scene commands; a Next.js action alone is not a transaction.
- RLS and database privileges enforce private data and role access.
- Supabase Realtime transports private presence and committed revision notifications; it is not the durable event log.
- Scene documents are versioned JSON, never serialized Three.js runtime objects.
- Generative registry is compile-time allowlisted; parameters are validated and bounded.
- Local, preview, and production environments use separate backend resources and secrets.

Detailed references: [Technical Architecture](TECHNICAL_ARCHITECTURE.md), [Scene Studio Data Model](SCENE_STUDIO_DATA_MODEL.md), [Real-Time Collaboration](REALTIME_COLLABORATION.md), [Generative Artifact Model](GENERATIVE_ARTIFACT_MODEL.md), [Authentication & Environment](AUTH_AND_ENVIRONMENT.md).

## 3. Creative scope

1. Spatial Home composition with scroll-linked transformations and progressive fallback.
2. Curated Playground with multiple original independently loadable studies.
3. Motion Lab with parameter-rich motion/generative studies, reset, seed, and reproducibility.
4. Saved generative artifacts with generator ID/version, seed, validated parameters, and schema version.
5. Scene Studio with primitives, transforms, materials, selection, history, cloud persistence, and real-time collaboration.
6. Editorial Archive/About with selective spatial moments.

Ambition does not authorize arbitrary user code, shader execution, dynamic module paths, unrestricted node graphs, prompt-to-scene generation, or a public asset marketplace.

## 4. Security and reliability posture

- RLS protects every private table.
- Browser clients cannot bypass the typed scene command/RPC path with direct document writes.
- The database transaction checks identity, role, revision, and idempotency atomically.
- Invitation tokens are random, hashed at rest, single-use, expiring, and identity-bound.
- Realtime authorization is tested on join, reconnect, and revocation.
- Missed/duplicate/out-of-order notifications recover from authoritative database revision/snapshot.
- Generator parameters and resource consumption are bounded.
- No service-role credential in browser code or logs.

See [Security Threat Model](SECURITY_THREAT_MODEL.md) and [Phase 05 Technical Validation Plan](PHASE_05_VALIDATION_PLAN.md).

## 5. Non-functional acceptance

### Performance
Server-render essential content; lazy-load WebGL; isolate experiments; pause off-screen rendering; cap pixel ratio and geometry; measure real devices before committing numeric budgets.

### Accessibility
Native scroll; keyboard/touch alternatives; reduced-motion modes; semantic content outside canvas; accessible collaborator, role, connection, and conflict announcements.

### Reliability
Revision-aware atomic writes; idempotency; explicit conflicts; snapshot recovery; visible save/sync/offline states; revoked users lose access to subsequent reads/mutations.

### Operations
Separate local/preview/production resources; verify current provider quotas, email deliverability, backup/restore, and deployment configuration; redact secrets and private content from logs.

## 6. Phase 05 completion checklist

- [x] Core and supporting stack approved and recorded (D-014).
- [x] Experiential direction approved (D-015).
- [x] Ambitious generative scope approved (D-016).
- [x] Real-time collaboration in MVP approved (D-017).
- [x] Collaboration-aware scene data model documented.
- [x] Generative artifact model documented.
- [x] Authentication and invitation proposal documented.
- [x] Collaboration architecture documented.
- [x] Security threat model drafted.
- [x] Technical validation plan drafted.
- [ ] Confirm isolated Supabase environment and current provider capabilities/quotas.
- [ ] Implement and apply migrations in isolated development only; verify fresh-database apply.
- [ ] Execute RLS and database privilege tests for owner/editor/viewer/revoked/non-member/anonymous.
- [ ] Validate atomic command RPC, idempotency, concurrency, and rollback.
- [ ] Validate invitation email delivery, identity binding, expiry, replay, and revocation.
- [ ] Validate Realtime private join, revocation, reconnect, and snapshot recovery.
- [ ] Verify environment separation, backups/restore, and Vercel constraints.
- [ ] Complete accessibility/performance/security evidence package.
- [ ] Final Phase 05 approval from product owner.

## 7. Approval gate

**Phase 05 is not complete or approved.** Architecture and validation specifications are documented, but provider-specific behavior and database security must be tested in an isolated environment. No migrations, invitation flow, realtime implementation, or production application code are claimed as built.

Phase 06 must not begin until the validation blockers are resolved or explicitly revised and the product owner approves the final Phase 05 review.
