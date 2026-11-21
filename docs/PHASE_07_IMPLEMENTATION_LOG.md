# FORMA — Phase 07 Implementation Log

**Branch:** `phase-07/immersive-experience`  
**Status:** In progress  
**Last updated:** 2026-11-21

## First implementation slice

The first Phase 07 slice replaces the Phase 06 placeholder home route with an authored landing narrative:

- **Arrival:** oversized editorial headline, product positioning, and a custom dimensional hero composition.
- **Interactive form study:** a layered CSS 3D sculpture with three authored arrangements — Origin, Displace, and Refract. A real button cycles between arrangements and announces the current state.
- **Manifesto:** a contrasting Soft Canvas section expressing the product's experience-first point of view.
- **Territories:** an asymmetric editorial introduction to Playground, Motion Lab, Scene Studio, and Archive. Each is honestly marked in development; no non-existent route is presented as functional.
- **Invitation:** a final branded close with a real link to the public repository.

Additional implementation:
- Header navigation now targets the actual landing-page sections.
- Hero sculpture depth is tuned across viewport sizes.
- The headline uses a smaller narrow-mobile clamp to reduce overflow risk.
- A Playwright test covers the hero recomposition interaction.

## Technical decisions in this slice

- The hero uses authored CSS 3D geometry first, not a WebGL canvas. This keeps the initial route light while validating the art direction and interaction model. Three.js/R3F remains available for experiences where real 3D geometry, camera control, or scene authoring materially improves the result.
- No external 3D asset, arbitrary runtime shader, or backend service is required.
- Motion is state-driven and bounded; native document scrolling remains intact.
- The interaction is keyboard-operable through a semantic button and exposes its current arrangement through a polite live region.
- Reduced-motion users receive near-instant state changes rather than a motion-dependent experience.

## Verification boundary

The new Phase 07 implementation has been committed to this branch, but it has **not yet been run through lint, typecheck, Vitest, Playwright, or a production build** in this environment. The earlier Phase 06 test results do not validate these new files. Responsive and visual behavior must be inspected in the owner's browser before this slice is accepted.

## Next steps

1. Run lint, typecheck, unit tests, Playwright, and production build on this branch.
2. Inspect desktop, tablet, and 320/375px mobile rendering; tune hero composition and section rhythm.
3. Check the recompose interaction with keyboard and touch, plus reduced-motion behavior.
4. Refine the hero with scroll-linked depth and section transitions only where they improve the narrative and remain progressive enhancements.
5. Review whether the hero benefits from lazy-loaded React Three Fiber or whether CSS 3D remains the better-performing authored solution.
6. Continue into the Phase 07 review only after the implementation is inspected and tested.
