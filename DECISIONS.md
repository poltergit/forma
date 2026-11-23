# FORMA — Decision Log

This file records decisions that have been explicitly approved. Proposed ideas do not become project constraints until approved.

## D-001 — Product identity

**Status:** Accepted  
**Decision:** Use FORMA as the working product name.  
**Tagline:** Where form meets function.

## D-002 — Product ownership

**Status:** Accepted  
**Decision:** FORMA serves both as a personal creative flagship and as an independent product direction.

## D-003 — Initial platform

**Status:** Accepted  
**Decision:** Launch as a web application first, responsive across desktop, tablet, and mobile browsers.

## D-004 — Infrastructure budget

**Status:** Accepted  
**Decision:** Prefer free-tier infrastructure wherever practical. Paid services require a concrete justification.

## D-005 — Scene Studio persistence

**Status:** Accepted  
**Decision:** Cloud persistence and user accounts are required from the beginning of Scene Studio implementation.

## D-006 — Brand palette

**Status:** Accepted  
**Decision:** Obsidian `#111214`, Soft Canvas `#F2F0EA`, Electric Lime `#C7F36B`, Signal Coral `#FF765E`, Digital Blue `#647BFF`, and Stone Gray `#92938F`.

## D-007 — Typography

**Status:** Accepted  
**Decision:** Space Grotesk for display, Inter for interface/body, and JetBrains Mono for technical annotations.

## D-008 — Creative direction

**Status:** Accepted  
**Decision:** Editorial precision meets interactive experimentation, combining purposeful 2D and 3D experiences.

## D-009 — Phase gates

**Status:** Accepted  
**Decision:** Work phase by phase. Require explicit product-owner approval before advancing beyond major phases.

## D-010 — Scene Studio UX layout

**Status:** Accepted  
**Decision:** Use a professional creative-editor layout: compact top toolbar, left scene hierarchy, dominant central 3D viewport, and right contextual properties inspector. On smaller screens, panels become contextual or collapsible.

## D-011 — Playground presentation

**Status:** Accepted  
**Decision:** Use an editorial experiment gallery with varied preview compositions and consistent metadata, not a repetitive uniform card grid.

## D-012 — Mobile Scene Studio

**Status:** Accepted  
**Decision:** Build a simplified mobile editing experience with viewport-first interaction and touch-appropriate controls. Do not compress the full desktop editor into a narrow screen.

## D-013 — Phase 04 visual design system

**Status:** Accepted  
**Decision:** The product owner approved the Phase 04 Visual Design System and FORM IN MOTION direction on 2026-11-20. Outstanding browser, assistive-technology, and direct reference-site validation remain follow-up tasks; approval does not imply those checks have passed.

## D-014 — Phase 05 application technology stack and supporting libraries

**Status:** Accepted  
**Decision date:** 2026-11-21  
**Decision:** The product owner approved:
- Next.js App Router.
- TypeScript.
- Supabase.
- Three.js + React Three Fiber.
- Vercel.
- CSS design tokens + CSS Modules.
- Zustand for editor-local state.
- Zod for runtime validation.
- Drei selectively for useful React Three Fiber helpers.
- Vitest for unit tests.
- React Testing Library for component tests.
- Playwright for browser/end-to-end tests.
- axe-core for automated accessibility checks.
- Start with Next.js server components/actions and focused server queries; defer TanStack Query unless a demonstrated client cache requirement emerges.

**Implementation note:** Exact package versions and compatibility must be checked at implementation time. This does not imply packages have been installed or tests configured.

## D-015 — Experiential ambition: spatial, generative, performative FORMA

**Status:** Accepted as a product-direction requirement  
**Decision date:** 2026-11-21  
**Decision:** FORMA must be fancy, creative, intentionally messy, generative, performative, and deeply interactive. It must use dimensional design, meaningful 3D experiences, spatial transitions, expressive motion, scroll-linked storytelling, and generative systems where they strengthen the concept.

**Quality bar:** No AI slop, generic visual filler, meaningless particles, repetitive decorative 3D, scroll hijacking, or fake interactions. Visual complexity must be art-directed; controls must have meaningful consequences; generative outputs should be controllable and reproducible where saving or sharing is offered.

**Guardrails:** Accessibility, native scrolling, reduced-motion alternatives, keyboard/touch support, WebGL fallbacks, and performance budgets remain mandatory. This decision does not authorize unlimited scope or make every page a 3D canvas. Discovery surfaces may be theatrical; creation tools must remain precise and usable.

**Reference:** `docs/EXPERIENCE_DIRECTION.md`.

## D-016 — Ambitious generative experience scope

**Status:** Accepted  
**Decision date:** 2026-11-21  
**Decision:** Prioritize a richer generative playground and more elaborate spatial experiences in the first release. This includes a distinctive spatial Home experience, isolated Playground studies, parameter-rich Motion Lab work, reproducible saved generative artifacts, and the constrained Scene Studio MVP.

**Scope discipline:** Ambitious refers to creative quality and breadth of authored experiences, not unbounded feature complexity. Each experience must have a clear concept, real interaction, bounded rendering cost, keyboard/touch behavior, reduced-motion alternative, and WebGL fallback. No arbitrary user code execution or generic AI prompt-to-scene feature is implied.

## D-017 — Real-time collaboration in Scene Studio MVP

**Status:** Accepted  
**Decision date:** 2026-11-21  
**Decision:** Include invite-only, multi-user real-time collaboration in the first release of Scene Studio.

**MVP behavior:** Scene owners can invite collaborators and assign owner/editor/viewer permissions; multiple authenticated users can join a private scene, see presence, and receive committed scene changes without refreshing. Mutations are authorized and ordered by a server/database authority, with explicit conflict handling and reconnect recovery.

**Boundaries:** No public rooms, anonymous editing, voice/video, chat, offline multi-user merge, team workspaces, or CRDT-based conflict-free editing in the MVP. The first implementation uses Supabase Auth, PostgreSQL/RLS, and Supabase Realtime subject to a technical spike validating authorization, quotas, and synchronization behavior. A dedicated collaboration service requires a separate approval and cost/security review.

**Reference:** `docs/REALTIME_COLLABORATION.md`.

## D-018 — Phase 05 approval and Phase 06 authorization

**Status:** Accepted  
**Decision date:** 2026-11-21  
**Decision:** The product owner confirmed “Validated and Approved” for the Phase 05 technical architecture review. Phase 05 is accepted and Phase 06 — Frontend Foundation is authorized to begin.

**Verification boundary:** This approval records the owner's phase-gate decision. It does not assert that proposed Supabase migrations, RLS policies, invitation email delivery, Realtime revocation, provider quotas, backup/restore, or deployment behavior have been executed or verified. Those remain implementation and release-validation requirements.

**Reference:** `docs/PHASE_05_REVIEW.md`, `docs/PHASE_06_FOUNDATION_PLAN.md`.

## D-019 — Phase 06 approval and Phase 07 authorization

**Status:** Accepted  
**Decision date:** 2026-11-21  
**Decision:** The product owner stated “Done. Let's proceed to Phase 07” after reporting that the Phase 06 local checks and production build succeeded and confirming that the generated npm lockfile had been committed. This is recorded as owner approval to advance from Phase 06 and begin Phase 07 — Landing Page & Immersive Experience.

**Verification boundary:** The reported local results were ESLint, TypeScript, eight Vitest tests, six Playwright tests, and a Next.js production build. They were not independently rerun in this environment. The install used Node.js 26 with `--engine-strict=false`, outside the declared Node range. A clean Node 22 `npm ci`, CI workflow, and manual rendered/assistive-technology review remain follow-up requirements; no deployment or Supabase integration is implied.

**Reference:** `docs/PHASE_06_REVIEW.md`, `docs/PHASE_07_IMMERSIVE_EXPERIENCE_PLAN.md`.
## D-020 — Cross-product creative experience mandate

**Status:** Accepted as a product-wide experience requirement  
**Decision date:** 2026-11-21  
**Decision:** The product owner reaffirmed that the experience must be interactive, fancy, creative, intentionally messy, generative, performative, and memorable from the first page through every product feature. FORMA should aim to surprise and delight both its audience and its creator—not merely present a polished interface.

**Experience bar:**
- Art-directed controlled chaos: asymmetric composition, bold scale, overlap, distortion, unexpected rhythm, and expressive typography, all governed by clear hierarchy.
- Meaningful dimensionality: purposeful 3D, spatial layouts, object transformations, camera movement, and transitions when they strengthen the concept.
- Interaction throughout: real responses to pointer, touch, keyboard, scrolling, dragging, and user decisions; no decorative controls pretending to work.
- Generative authorship: procedural variation shaped by understandable parameters, constraints, and reproducible seeds where persistence or sharing is promised.
- A coherent experiential language across Home, Playground, Motion Lab, Scene Studio, Archive, About, and Account, while each surface retains its own character.

**Non-negotiable distinction:** messy in art direction, never messy in usability. Navigation, reading, editing, and task completion must remain understandable. Spectacle must not compromise accessibility, responsive behavior, performance, reduced-motion support, keyboard/touch operation, or WebGL fallbacks.

**Rejections:** generic AI-looking filler, template layouts, meaningless particles, repetitive 3D decoration, gratuitous effects, fake functionality, scroll hijacking, and complexity without a concept.

**Reference:** `docs/EXPERIENCE_DIRECTION.md`.
## D-021 — Phase 07 approval and Phase 08 authorization

**Status:** Accepted  
**Decision date:** 2026-11-21  
**Decision:** The product owner confirmed “validated and succeeded” for Phase 07 and explicitly directed the project to continue with Phase 08. Phase 07 — Landing Page & Immersive Experience is approved for progression, and Phase 08 — Playground & Motion Lab is authorized to begin on `phase-08/playground-motion-lab`.

**Verification boundary:** This records the owner's validation report and phase-gate approval. The exact command output and detailed browser/device results were not included in the approval message and were not independently rerun in this environment. No specific test count, performance benchmark, deployment, or provider integration is implied.

**References:** `docs/PHASE_07_REVIEW.md`, `docs/PHASE_08_PLAYGROUND_MOTION_LAB_PLAN.md`.

## D-022 — Orbit-centered FORMA identity

**Status:** Accepted as a creative-direction requirement  
**Decision date:** 2026-11-23  
**Decision:** The Home experience should center the FORMA identity/core inside a living orbital composition. Meaningful orbiting specimens represent the product's creative territories and systems: form/geometry, motion/trace, typography, space/frames, and generative fields. Objects should use distinct orbital planes, trajectories, scales, and behaviors rather than rotating as a uniform decorative ring.

**Interaction contract:** Pointer/touch influence, selectable territories, deterministic recomposition, and scroll-linked chapter progression must create observable changes. The orbit should evolve into the wider Home narrative and lead into real product destinations. Semantic navigation and copy remain outside the canvas.

**Guardrails:** This does not authorize a particle-heavy or WebGL-only page. The composition must have a stable reduced-motion/static fallback, keyboard-accessible controls, touch support, a non-WebGL fallback, bounded GPU budgets, and no scroll hijacking.

## D-023 — GSAP as FORMA's motion choreography layer

**Status:** Accepted  
**Decision date:** 2026-11-23  
**Decision:** Add GSAP as the primary orchestration layer for authored timelines, scene choreography, scroll-triggered chapter progress, and coordinated DOM/3D transitions. Use the React integration package where appropriate. Use ScrollTrigger for progressive scroll-linked choreography while retaining native browser scrolling.

**Implementation boundary:** GSAP coordinates motion; Three.js / React Three Fiber own actual 3D geometry, materials, cameras, and rendering. CSS remains preferred for simple interface transitions and reduced-motion states. Do not introduce multiple competing animation frameworks for the same responsibility.

**Dependencies and verification:** Install exact compatible package versions only after checking the existing Next.js/React runtime and updating the npm lockfile. This decision does not mean GSAP has already been installed or that build/tests have passed.

## D-024 — Curated 3D runtime, not indiscriminate library accumulation

**Status:** Accepted  
**Decision date:** 2026-11-23  
**Decision:** Use a curated 3D toolchain: Three.js + React Three Fiber as the core, Drei selectively for scene helpers, and post-processing/physics libraries only when a specific implemented experience demonstrates the need. Do not install every available 3D library or duplicate rendering, animation, physics, and scroll systems.

**Candidate additions subject to feature-level review:** React Three Postprocessing for measured visual effects; Rapier for scenes that need real collision/rigid-body simulation; Theatre.js only if authored scene timelines require a separate visual authoring workflow that GSAP cannot reasonably provide. These are candidates, not approved installed dependencies.

**Quality rule:** Every dependency must earn its place through a concrete user-visible feature, bundle/runtime cost review, compatibility check, accessibility/fallback plan, and maintainability rationale.
