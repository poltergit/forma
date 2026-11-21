# FORMA — Phase 07: Landing Page & Immersive Experience

**Version:** 0.2  
**Status:** In progress  
**Owner authorization:** Product owner directed progression on 2026-11-21  
**Implementation branch:** `phase-07/immersive-experience`

## 1. Mission

Transform the restrained Phase 06 foundation route into FORMA's signature first encounter: a cinematic, responsive, spatial introduction that communicates the product's creative-technology identity through authored composition, meaningful motion, and deliberate interaction.

This is not a generic SaaS landing page and not a pile of decorative 3D effects. It should feel like entering a living design instrument: expressive at first glance, coherent as the visitor explores, and precise in how it responds.

## 2. Experience concept — FORM IN MOTION

The landing experience is built around a central proposition:

**Make room for the unexpected.**

A modular form becomes a spatial object. Typography, geometry, and interface elements behave as parts of one composition rather than unrelated page sections. The experience unfolds from a bold opening statement into tangible creative disciplines and a clear invitation to explore.

Art direction:
- Editorial precision with controlled chaos: asymmetry, deliberate overlap, scale contrast, cropping, and changing density.
- A distinct FORMA visual signature using the approved Obsidian, Soft Canvas, Electric Lime, Signal Coral, Digital Blue, and Stone Gray palette.
- Space Grotesk for display, Inter for body/interface, and JetBrains Mono for technical labels.
- Strong negative space and a small number of high-impact compositions; no generic gradient wallpaper or random particle fog.
- The modular-frame logo direction informs framing and transitions, without treating the exploration sketch as final trademark artwork.

## 3. Landing-page narrative

### Act I — Arrival / The form appears
- Immediate brand recognition and one unmistakable hero statement.
- A custom dimensional object or modular composition is the visual anchor.
- Typography and geometry have distinct spatial layers and responsive composition.
- The first viewport communicates what FORMA is without requiring animation to reveal essential copy.
- A restrained navigation and clear exploration cue.

### Act II — Material / Play with the system
- The central form responds to pointer, touch, or keyboard input with a meaningful, bounded interaction.
- A small set of authored parameters may influence geometry, orientation, color accent, or density.
- Interactions should be discoverable, reversible, and usable without a mouse.
- Any generative variation is seeded/reproducible where a saved or shareable result is implied.

### Act III — Disciplines / The world expands
- Introduce Playground, Motion Lab, Scene Studio, and Archive as distinct creative territories.
- Use an editorial, non-uniform layout rather than identical marketing cards.
- Each territory receives a meaningful visual preview and clear navigation destination.
- Scene Studio is presented honestly as an in-development product area until the real editor is delivered.

### Act IV — Invitation / Continue exploring
- Close with a clear next action into the product and an authored creator/about connection.
- Footer and navigation remain accessible and predictable.
- No fake account, save, publish, or collaboration controls.

## 4. Motion and interaction language

Use the established motion families as a coherent grammar:
- **Reveal:** staged appearance of type and forms.
- **Frame:** geometry and layout elements assemble or define a viewport.
- **Shift:** controlled positional and depth changes.
- **Parallax:** subtle depth separation tied to scroll, never scroll hijacking.
- **Morph:** one authored shape transitions into another with continuity.
- **Mask:** typography or geometry reveals content through spatial clipping.
- **Tactile:** pointer/touch response with clear bounds and a stable resting state.
- **Transition:** consistent movement between page sections and navigation states.

Requirements:
- Native document scrolling; no scroll-jacking or forced waiting.
- Scroll-linked effects must be progressive enhancement and must not hide essential content.
- Reduced-motion mode must preserve the complete experience without spatial animation.
- Keyboard and touch alternatives for pointer-driven interactions.
- Avoid layout shift; animate transform/opacity where practical.
- Keep animation frame work bounded and avoid continuous GPU-heavy effects when the page is idle.
- Provide graceful fallback when WebGL is unavailable or context creation fails.

## 5. Technical implementation boundaries

- Next.js App Router; Server Components by default.
- Isolate browser-only rendering in focused Client Components.
- Three.js / React Three Fiber must be lazy-loaded and kept out of the initial critical path unless measurement proves the hero requires it.
- Prefer CSS transforms and authored SVG/CSS geometry for simpler elements; use WebGL only when it materially improves the experience.
- Do not introduce a large animation framework without a demonstrated need.
- Keep design tokens canonical and use CSS Modules for page-specific art direction.
- Avoid global state for local hero interactions; keep state close to the interactive feature.
- No backend or Supabase dependency for the public landing experience.
- Track WebGL capability, reduced-motion preference, viewport size, and pointer capability without making unsupported assumptions.
- No external asset dependency that can silently break the hero. Prefer authored code-based geometry and locally managed assets.

## 6. Responsive behavior

- Desktop: expansive editorial composition with layered geometry and deliberate asymmetry.
- Tablet: recompose the visual hierarchy; do not merely shrink desktop spacing.
- Mobile: typography-first, touch-safe composition with reduced geometry complexity and no horizontal overflow.
- Small screens must not depend on hover, precise pointer movement, or large GPU budgets.
- Test at 320, 375, 768, 1024, and 1440 CSS-pixel viewport widths.

## 7. Accessibility and performance

- Semantic landmarks and heading hierarchy.
- Skip navigation, visible focus, accessible labels, and keyboard-complete interactions.
- Reduced-motion alternative and no flashing/strobing effects.
- Maintain readable contrast across dark/light surfaces and interactive states.
- Respect touch target sizing and avoid hover-only information.
- Measure LCP, CLS, INP, JS transfer, and WebGL cost on representative devices.
- Load the hero's expensive code only when needed; provide static fallback and meaningful content before hydration.
- No autoplay audio, forced cursor replacement, or inaccessible custom scrolling.

## 8. Deliverables

1. Approved hero composition and responsive art direction implemented in the App Router.
2. Original spatial visual centerpiece with WebGL/CSS/SVG approach chosen by measured value.
3. Meaningful interaction model with pointer, touch, and keyboard paths.
4. Scroll narrative connecting hero, disciplines, and final invitation.
5. Distinct editorial previews for product territories.
6. Reduced-motion and WebGL fallback behavior.
7. Responsive, accessibility, and performance test coverage.
8. Phase 07 implementation log and owner review package.

## 9. Implementation sequence

1. **Started.** Audited the existing shell, tokens, and foundation route; retained the shared shell and replaced the placeholder home content with the first authored narrative slice.
2. **Initial implementation committed.** Established the four-part page narrative: hero, manifesto, territories, and invitation.
3. **Initial implementation committed; visual QA pending.** Added a layered CSS 3D sculpture with three selectable arrangements.
4. **Initial implementation committed; browser validation pending.** Added a semantic recompose button and polite live state announcement.
5. **Implemented; owner-reported automated checks passing.** Added progressive CSS view-timeline depth to decorative territory previews and the invitation orb. The effect is gated by browser support and the reduced-motion preference; it does not hide content or replace native scrolling.
6. Introduce WebGL/R3F only if the hero benefits from real 3D; lazy-load and provide fallback.
7. Build editorial discipline previews and navigation.
8. Add automated interaction, accessibility, responsive, and performance checks.
9. Run supported-runtime install/check/build and browser review; document results.
10. Present Phase 07 for explicit owner approval before Phase 08.

## 10. Acceptance criteria

- [ ] First viewport clearly identifies FORMA and its creative-technology purpose.
- [ ] Hero composition is original, art-directed, and recognizably FORMA.
- [ ] Motion communicates structure or interaction rather than acting as decoration.
- [ ] Main interaction supports pointer, keyboard, and touch where relevant.
- [ ] Essential content remains available with reduced motion and without WebGL.
- [ ] Native scrolling remains intact and no content is gated behind animation.
- [ ] Desktop/tablet/mobile compositions are deliberately designed and overflow-free.
- [ ] Navigation and all destinations are real; no fake controls or placeholder links.
- [ ] Automated accessibility and responsive tests pass.
- [ ] Performance is measured and documented on representative viewports/devices.
- [ ] Owner reviews and approves Phase 07 before Phase 08.

## 11. Out of scope

- Full Playground and Motion Lab implementation (Phase 08).
- Real Scene Studio editor (Phase 09).
- Full Archive/About content architecture (Phase 10), except a concise landing-page introduction and working links.
- Authentication, persistence, collaboration, and Supabase integration.
- Billing, public publishing, user-generated code execution, and arbitrary shaders.
