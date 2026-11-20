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
**Decision:** The product owner approved the Phase 04 Visual Design System and FORM IN MOTION direction on 2026-11-20. The consolidated review package is recorded in `docs/PHASE_04_REVIEW.md`. Outstanding browser, assistive-technology, and direct reference-site validation remain follow-up tasks; approval does not imply those checks have passed.



## D-014 — Phase 05 application technology stack

**Status:** Accepted  
**Decision date:** 2026-11-20  
**Decision:** The product owner approved:
- Application framework: Next.js App Router.
- Language: TypeScript.
- Backend: Supabase.
- 3D engine: Three.js with React Three Fiber.
- Hosting: Vercel.
- Styling: framework-independent CSS design tokens with CSS Modules.

**Implementation note:** Exact dependency versions, service plan limits, environment configuration, and deployment settings must be verified at implementation time. Supporting recommendations such as Zustand, Zod, testing libraries, and specific server/client data-access patterns are not included in this approval and remain subject to review.

