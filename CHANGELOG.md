# Changelog

All notable project changes are recorded here.

## [Unreleased]

### Added
- Added three deterministic Playground instruments: Displacement Field, Orbital Bloom, and Woven Lattice, each with distinct geometry logic and Scene Studio export.
- Added a local recipe library with named save, restore, and delete actions, plus editable seed control.
- Added generator-registry, deterministic-output, resource-bound, and Scene Studio export tests.
- Added a deterministic Playground-to-Scene-Studio handoff: the Displacement Field can be carried into the 3D editor as an editable composition, with generated objects and generator provenance preserved in the scene payload.
- Extracted the Displacement Field generator into a bounded pure module with reproducibility and Scene Studio compatibility tests.

### Updated
- Scene Studio now validates and receives one-time Playground handoffs into the active composition library before autosave and optional cloud sync.

### Added
- Added docs/AUTH_AND_ENVIRONMENT.md covering Supabase session architecture, auth flows, route access, environment variables, environment separation, and deployment security.
- Added docs/SCENE_STUDIO_DATA_MODEL.md with the initial scenes table migration, ownership-focused RLS policies, versioned scene document contract, optimistic concurrency protocol, and security test matrix.
- Added `docs/REFERENCE_LED_ART_DIRECTION.md`, a proposed reference-led creative direction and motion system for FORMA.
- Initialized the FORMA repository documentation.
- Added approved Product Requirements Document, Brand Guidelines, and Phase 03 UX Specification.
- Added proposed Phase 04 Visual Design System and framework-independent design tokens.
- Added page layout and component design specifications.
- Added three monochrome logo explorations and a proposed hybrid Modular Frame identity system.
- Added brand application guidelines, proposed logo lockups, favicon draft, and supporting SVG graphics.
- Added `design/prototypes/home-preview.html`, a responsive Home page visual prototype.
- Added `design/prototypes/playground-preview.html`, an editorial experiment gallery with local category filters.
- Added `design/prototypes/motion-lab-preview.html`, an interactive motion study with behavior, duration, intensity, easing, playback, and reset controls.
- Added `design/prototypes/scene-studio-preview.html`, a responsive editor-shell prototype with local object controls and mobile panel sheets.
- Added `design/prototypes/archive-preview.html`, a responsive editorial archive with category filters and keyboard-accessible project detail dialogs.
- Added `design/prototypes/about-preview.html`, an editorial About page with brand philosophy, principles, and creator context.
- Added `design/prototypes/account-preview.html`, responsive sign-in, account creation, and recovery views with local navigation and explicit prototype-only feedback.

### Updated
- Recorded the product owner's six approved Phase 05 technology choices (Next.js App Router, TypeScript, Supabase, Three.js + React Three Fiber, Vercel, and CSS tokens + CSS Modules) as D-014.
- Updated the technical architecture to distinguish approved stack choices from supporting recommendations that remain under review.
- Recorded product-owner approval of Phase 04 and opened Phase 05.
- Added `docs/TECHNICAL_ARCHITECTURE.md` with proposed application stack, route/rendering strategy, Scene Studio architecture, persistence/security model, testing, and deployment recommendations. All technical choices remain subject to owner approval.
- Added `docs/PHASE_04_REVIEW.md` as the consolidated Phase 04 review package, including seven-prototype inventory, source-level QA results, preliminary semantic contrast calculations, limitations, and the approval gate.
- Added a cross-page prototype consistency review and explicit Phase 04 validation checklist to `docs/VISUAL_DESIGN_SYSTEM.md`. The review distinguishes source inspection from browser, assistive-technology, and WCAG validation.
- Applied restrained FORM IN MOTION feedback to Scene Studio while preserving its task-focused editor hierarchy and simplified mobile layout.
- Applied progressive editorial reveals, geometric form response, and reduced-motion-safe fallbacks to the About prototype.
- Refined Account with compact view transitions, tactile form controls, restrained geometric feedback, and reduced-motion-safe behavior.
- Applied progressive reveals and responsive hover/focus artwork treatment to Archive, with a reduced-motion fallback.
- Applied FORM IN MOTION to the Playground with progressive editorial reveals, restrained hover light-sweep, artwork response, and reduced-motion fallback.
- Refined Motion Lab with tactile control feedback, behavior-switch transition cues, live playback status announcements, and reduced-motion-safe static presentation.
- Updated README with all current design-preview links.
- Updated project status and changelog to record the Account prototype and clarify its non-production scope.
- Updated About and Account to complete the first FORM IN MOTION pass across all seven page prototypes.
- Recorded Phase 04 approval and continued Phase 05 architecture work; production implementation remains gated on Phase 05 approval.

### Project phase
- Phase 01 approved.
- Phase 02 approved.
- Phase 03 approved.
- Phase 04 approved.
- Phase 05 in progress; core stack approved, detailed architecture specifications under review.
- Production application implementation not started.

### Notes
- Work remains configuration-independent: no database, authentication, hosting, or external service has been configured.
- All page prototypes are separate from production application code.
- Interactive controls in prototypes demonstrate local UI behavior only; they do not imply production services or persistent data.
- Account forms do not authenticate, create accounts, send recovery emails, or transmit/store user information.
- Page layouts, component specifications, and identity assets remain proposals for review.
- The Modular Frame hybrid identity is not final approved artwork or trademark clearance.
- Contrast measurements are preliminary; full component-level validation requires rendered UI testing.
