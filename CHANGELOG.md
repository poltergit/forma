# Changelog

All notable project changes are recorded here.

## [Unreleased]

### Added
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
- Maintained the Phase 04 approval gate; Phase 05 and production implementation remain unstarted.

### Project phase
- Phase 01 approved.
- Phase 02 approved.
- Phase 03 approved.
- Phase 04 in progress; awaiting consolidated product-owner review.
- Phase 05 not started.
- Production application implementation not started.

### Notes
- Work remains configuration-independent: no database, authentication provider, hosting, or external service has been configured.
- All page prototypes are separate from production application code.
- Interactive controls in prototypes demonstrate local UI behavior only; they do not imply production services or persistent data.
- Account forms do not authenticate, create accounts, send recovery emails, or transmit/store user information.
- Page layouts, component specifications, and identity assets remain proposals for review.
- The Modular Frame hybrid identity is not final approved artwork or trademark clearance.
- Contrast measurements are preliminary; full component-level validation requires rendered UI testing.
