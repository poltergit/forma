# FORMA — Phase 05 Architecture Review

**Version:** 0.1  
**Phase:** 05 — Technical Architecture  
**Status:** Review package in progress; not approved  
**Purpose:** Consolidate the proposed implementation decisions and expose unresolved owner approvals before Phase 06.

---

## 1. What is already approved

### Core stack — D-014
- Next.js App Router.
- TypeScript.
- Supabase.
- Three.js + React Three Fiber.
- Vercel.
- CSS design tokens + CSS Modules.

### Product experience requirement — D-015
FORMA must be spatial, generative, performative, expressive, intentionally art-directed, and meaningfully interactive. It must avoid generic AI-like visual filler and decorative complexity without purpose.

See [Experiential Direction](EXPERIENCE_DIRECTION.md).

## 2. Supporting technology recommendations

These are recommendations for owner review, not approved dependencies. Exact versions and compatibility must be checked when implementation begins.

| Concern | Recommendation | Reason | Boundary |
|---|---|---|---|
| Editor-local state | Zustand | Shared selection, active tool, transient transforms, editor panels, undo/redo | Do not put every input or server record in a global store |
| Runtime validation | Zod | Validate forms, scene documents, generator parameters, and mutation inputs | Types alone do not validate untrusted runtime data |
| 3D helpers | Drei, selectively | Reduce boilerplate for common R3F camera, controls, and helpers | Use only where it adds value; do not make every helper a dependency |
| Server state | Next.js server components/actions and focused queries first | Keeps initial data flow simple and server-authoritative | Reconsider a client cache only when actual interaction needs justify it |
| Client server-state cache | Defer TanStack Query | Avoid a second state model before the product needs it | Add only for clear caching, optimistic update, polling, or synchronization requirements |
| Unit tests | Vitest | Fast tests for pure logic, generators, validation, and editor commands | Must run in CI |
| Component tests | React Testing Library | Test observable component behavior | Avoid implementation-detail tests |
| Browser tests | Playwright | Validate real routes, interactions, auth, persistence, and responsive journeys | Run against isolated test services |
| Accessibility automation | axe-core | Catch common accessibility regressions | Not a substitute for manual keyboard and assistive-technology checks |
| Supabase Next.js integration | Officially supported Supabase SSR package for chosen versions | Cookie-based server/browser session integration | Confirm current package guidance and Next.js conventions at implementation time |

### Recommended dependency posture

Adopt Zustand and Zod as the likely baseline. Use Drei selectively. Start without TanStack Query. Adopt the test stack above, with Playwright coverage for critical end-to-end flows. These remain proposals until explicitly accepted.

## 3. Proposed application boundaries

### Route layer
- App Router route files compose layouts and server-rendered content.
- Route handlers/server actions validate inputs and enforce authorization for mutations.
- Keep route components thin; feature behavior belongs in feature modules.

### Feature layer
- `experience`: home choreography and spatial opening composition.
- `playground`: experiment registry, metadata, and isolated experiment stages.
- `generative`: deterministic seed handling, parameter schemas, generator registry, and artifact serialization.
- `motion-lab`: motion studies and parameter controls.
- `scene-studio`: editor state, scene document, renderer, inspector, persistence, and history.
- `archive`: curated projects and case studies.
- `account`: auth and profile surfaces.

### Shared platform layer
- `components`: accessible, reusable interface components.
- `lib/supabase`: browser/server Supabase clients.
- `lib/auth`: session and access helpers.
- `lib/validation`: shared runtime schemas.
- `design/tokens.css`: source of truth for semantic design tokens.

Do not create a shared abstraction until at least two real use cases demonstrate the same need. Experiment stages should remain independently loadable and independently testable.

## 4. Proposed first implementation scope for the spatial/generative runtime

The ambition is high; the first implementation must still be bounded.

1. One spatial Home composition with progressive fallback and a small number of meaningful scroll-linked states.
2. A Playground registry capable of hosting isolated experiments with clear metadata and launch states.
3. A small initial set of original generative studies, each with its own authored rule set and parameter controls.
4. Motion Lab studies with live controls, deterministic reset behavior, and reduced-motion alternatives.
5. Scene Studio MVP with the already proposed constrained primitives, transforms, material color, selection, history, and cloud persistence.

Do not promise arbitrary node graphs, user-authored executable code, multiplayer editing, real-time collaboration, unrestricted geometry modeling, or an AI prompt-to-scene system in the first release.

### Generative artifact minimum contract

A saved artifact should store:
- stable generator ID;
- generator version;
- deterministic seed;
- validated parameter object;
- artifact schema version;
- optional preview/thumbnail reference.

The saved artifact stores parameters and provenance, not executable code or renderer runtime objects.

## 5. Non-functional acceptance requirements

### Performance
- Server-render the content and controls that must remain accessible.
- Load WebGL only for experiences that require it.
- Avoid multiple heavyweight canvases running simultaneously.
- Pause or reduce rendering for hidden/off-screen stages.
- Provide low-power and reduced-motion modes.
- Establish measured budgets from real device baselines before declaring performance targets.

### Accessibility
- Native scrolling; no scroll hijacking.
- Keyboard and touch alternatives for pointer-led interactions.
- Reduced-motion mode that preserves content and task completion.
- WebGL failure fallback.
- Semantic text and controls outside the canvas for essential actions.
- Focus visibility and announcements for meaningful state changes.

### Security
- Supabase RLS for all private user data.
- Server-side session validation for protected operations.
- Runtime validation for all client-supplied documents and parameters.
- Strict object-count, numeric-range, payload-size, and upload limits.
- No service-role key in client code.
- No execution of user-supplied generator code.

### Reliability
- Visible loading, save, error, offline, and recovery states.
- Revision-aware scene persistence.
- Reproducible generative artifacts where saving/reproduction is offered.
- Error reporting without leaking private scene content or credentials.

## 6. Outstanding owner decisions

The following are proposed defaults for review:

| Decision | Proposed default | Approval needed |
|---|---|---|
| Editor state | Zustand | Yes |
| Runtime validation | Zod | Yes |
| 3D helpers | Drei selectively | Yes |
| Client cache | Defer TanStack Query | Yes |
| Testing stack | Vitest + React Testing Library + Playwright + axe-core | Yes |
| Initial generative artifact model | Generator ID + version + seed + validated parameters | Yes |
| Initial spatial scope | One Home spatial composition; isolated Playground studies; constrained Scene Studio MVP | Yes |
| Collaboration / multiplayer | Excluded from first release | Confirm |
| User-authored executable code | Excluded from first release | Confirm |

## 7. Phase 05 completion checklist

- [x] Core stack recorded and approved (D-014).
- [x] Experiential ambition recorded (D-015).
- [x] Scene Studio data model and RLS proposal documented.
- [x] Authentication and environment proposal documented.
- [x] Spatial/generative runtime boundaries drafted.
- [ ] Supporting dependencies explicitly approved.
- [ ] Route, feature, and server/client boundaries approved.
- [ ] Auth/session integration and environment topology approved.
- [ ] Test, security, accessibility, performance, and deployment strategy approved.
- [ ] MVP inclusions and exclusions approved.
- [ ] Final Phase 05 approval from product owner.

## 8. Approval gate

**Phase 05 is not yet approved. Phase 06 must not begin until the product owner explicitly approves this review package and the remaining architecture decisions.**

No production app code, Supabase project, Vercel configuration, or deployment has been started as part of this documentation work.
