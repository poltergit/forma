# FORMA — Phase 05 Architecture Review

**Version:** 0.2  
**Phase:** 05 — Technical Architecture  
**Status:** Owner decisions recorded; technical validation and final approval remain open  
**Purpose:** Consolidate the approved direction, supporting architecture, collaboration requirements, and Phase 05 acceptance criteria before Phase 06.

---

## 1. Approved product and technology decisions

### Core stack — D-014
- Next.js App Router and TypeScript.
- Supabase.
- Three.js + React Three Fiber.
- Vercel.
- CSS design tokens + CSS Modules.
- Zustand for editor-local state.
- Zod for runtime validation.
- Drei selectively.
- Vitest, React Testing Library, Playwright, and axe-core.
- Start with server components/actions and focused server queries; defer TanStack Query until justified.

### Experiential ambition — D-015
Spatial, generative, performative, expressive, intentionally art-directed, and meaningfully interactive. No generic AI-like filler or decorative complexity without purpose.

### Generative scope — D-016
Ambitious first-release creative scope: a distinctive spatial Home, isolated Playground studies, richer Motion Lab experiences, reproducible saved generative artifacts, and the constrained Scene Studio editor.

### Collaboration — D-017
Real-time collaboration is included in the Scene Studio MVP. The proposed baseline is invite-only rooms, owner/editor/viewer roles, presence, live committed changes, server-authoritative mutation ordering, and reconnect recovery. No public rooms, offline multi-user merge, chat/video, or CRDT in the first release.

References: [Experiential Direction](EXPERIENCE_DIRECTION.md), [Generative Artifact Model](GENERATIVE_ARTIFACT_MODEL.md), and [Real-Time Collaboration](REALTIME_COLLABORATION.md).

## 2. Approved supporting technology posture

| Concern | Approved choice | Boundary |
|---|---|---|
| Editor-local state | Zustand | Keep server records and ephemeral input state out of unnecessary global stores |
| Runtime validation | Zod | Validate untrusted data at every boundary |
| 3D helpers | Drei selectively | Use only where useful |
| Client server-state cache | Defer TanStack Query | Add only after a demonstrated requirement |
| Unit tests | Vitest | Pure logic, generator determinism, document commands |
| Component tests | React Testing Library | Observable user behavior |
| Browser tests | Playwright | Critical routes and multi-user journeys |
| Accessibility automation | axe-core | Supplement, not replace, manual checks |
| Supabase SSR | Official supported SSR integration for chosen versions | Verify package and Next.js conventions when implementing |

## 3. Application boundaries

- App Router owns route composition, server-rendered content, and route-level loading/error states.
- Server actions/route handlers validate mutation inputs, verify session and permissions, and call data operations.
- Feature modules own product behavior: experience, playground, generative, motion-lab, scene-studio, archive, and account.
- The generative registry is explicit and allowlisted; database records never select arbitrary modules or executable code.
- Scene Studio separates viewport, serializable document, editor-local state, command/history layer, persistence, and collaboration.
- Supabase clients and server-only credentials remain isolated in the platform layer.
- Shared abstractions should emerge from repeated real use cases, not speculation.

## 4. Ambitious first-release creative scope

1. A distinctive spatial Home composition with scroll-linked transformations and progressive fallback.
2. A curated Playground registry with multiple original, independently loadable studies.
3. Motion Lab with parameter-rich generative/motion studies, deterministic reset, and saved recipes where supported.
4. A reproducible artifact contract: generator ID/version, seed, validated parameters, and schema version.
5. A real Scene Studio MVP with primitives, transforms, materials, selection, history, cloud persistence, and collaboration.
6. Editorial Archive/About surfaces with selective spatial case-study moments.

Ambition is not permission for uncontrolled complexity. Do not include arbitrary code execution, user-uploaded generator plugins, unrestricted node graphs, prompt-to-scene generation, or an open-ended asset marketplace in the first release.

## 5. Real-time collaboration architecture

See [Real-Time Collaboration](REALTIME_COLLABORATION.md) for the detailed proposal.

The baseline is Supabase Realtime for presence/change notifications and PostgreSQL as durable source of truth. Scene mutations use a typed, server-authorized, revision-ordered command model. Notifications are not the event log; reconnecting clients recover from an authoritative snapshot/revision.

Before production implementation, validate private-channel authorization, membership RLS, invitation lifecycle, transaction/idempotency behavior, event delivery/recovery, and plan quotas in an isolated Supabase project. If this requires an unexpectedly complex custom synchronization layer, stop and bring a dedicated provider option back for approval rather than quietly adding a service.

## 6. Non-functional acceptance requirements

### Performance
- Server-render essential editorial content and controls.
- Load WebGL only where needed; isolate each experiment.
- Avoid multiple heavyweight canvases running simultaneously.
- Pause/reduce off-screen rendering and cap device pixel ratio.
- Provide low-power, reduced-motion, and WebGL fallback modes.
- Measure actual representative devices before setting numeric performance guarantees.

### Accessibility
- Native scrolling; no scroll hijacking.
- Keyboard/touch alternatives for pointer-led interactions.
- Reduced-motion behavior preserving meaning and task completion.
- Essential text/actions outside the canvas.
- Accessible collaborator names, role labels, connection state, and update announcements.

### Security
- RLS for all private scene, membership, invitation, and artifact data.
- Server-side role checks for every mutation.
- Private Realtime channels authorized by membership.
- No service-role credential in browser code.
- Runtime validation and payload/resource limits.
- Rate-limited invitation creation and acceptance.
- No arbitrary user-supplied code execution.

### Reliability
- Revision-aware durable scene writes.
- Idempotent commands and explicit conflict behavior.
- Reconnect snapshot recovery.
- Visible save/sync/offline/error states.
- Revoked collaborators lose access and have private state cleared.
- Generator versions and seeds retained for reproducibility.

## 7. Phase 05 completion checklist

- [x] Core stack recorded and approved (D-014).
- [x] Supporting dependencies and test stack approved (D-014).
- [x] Experiential ambition recorded (D-015).
- [x] Ambitious generative experience scope approved (D-016).
- [x] Real-time Scene Studio collaboration approved for MVP (D-017).
- [x] Scene Studio data model and initial RLS proposal documented.
- [x] Generative artifact data model documented.
- [x] Authentication and environment proposal documented.
- [x] Collaboration architecture and role model drafted.
- [ ] Validate schema/policies and collaboration synchronization in an isolated Supabase project.
- [ ] Finalize exact invitation delivery and token lifecycle.
- [ ] Confirm provider plan quotas, operational limits, and environment topology.
- [ ] Complete route/module boundaries and final threat-model review.
- [ ] Final Phase 05 approval from product owner.

## 8. Approval gate

**Owner decisions are recorded, but Phase 05 is not yet complete or approved.** The collaboration requirement materially changes the previous single-owner data model and must be reflected in tested migrations, RLS policies, invitation flow, and integration tests.

Phase 06 must not begin until the product owner explicitly approves the completed Phase 05 review after the isolated technical validation and remaining checklist items.

No production application code, Supabase project, Vercel configuration, or deployment has been started as part of this documentation update.
