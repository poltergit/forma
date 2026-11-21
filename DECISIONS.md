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
