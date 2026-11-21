# FORMA — Phase 08: Playground & Motion Lab

**Version:** 0.1  
**Status:** In progress  
**Owner authorization:** Product owner authorized Phase 08 on 2026-11-21  
**Implementation branch:** `phase-08/playground-motion-lab`

## 1. Mission

Turn FORMA's two most expressive product pillars into real, deeply interactive creative environments.

The Playground is not a catalogue of thumbnails. It is an editorial field of distinct experiments that invite exploration. Motion Lab is not a dashboard full of toggles. It is a creative instrument where users can shape, inspect, and perform motion systems.

Apply the cross-product experience mandate in [Experiential Direction](EXPERIENCE_DIRECTION.md): memorable, dimensional, generative, performative, intentionally messy in art direction, and precise in usability.

## 2. Experience thesis — PLAY IS THE INTERFACE

The Playground should feel like entering a collection of strange, beautiful, tactile digital objects. Every experiment has its own visual thesis, behavior, and composition. The gallery's layout should be irregular and expressive, while its information architecture stays consistent and discoverable.

Motion Lab should feel like stepping behind the curtain and touching the forces that animate those objects: timing, easing, velocity, direction, paths, repetition, and transformation. The result should be visible immediately and be understandable through direct manipulation.

The two surfaces share a visual grammar but must not look like the same page with different headings.

## 3. Playground — experience requirements

### 3.1 Editorial discovery field

- Build an irregular, responsive composition rather than a uniform card grid.
- Vary scale, aspect ratio, cropping, density, and spatial placement with a deliberate visual rhythm.
- Give each experiment a unique art direction and a clear title, short premise, interaction cue, and availability/status label.
- Use motion and dimensional previews as invitations, not as autoplay noise.
- Provide useful category/filter controls with immediate, keyboard-accessible state changes.
- Preserve visible labels and essential information without hover.
- Support direct links and browser history for experiment detail states/routes.
- Include a deliberate empty state and a useful reset for filters.

### 3.2 First experiment set

Create a small, high-quality set of original experiments rather than a large collection of shallow demos. Candidate studies to prototype and select during implementation:

1. **FORM / Displacement** — a tactile field of modular forms responding to pointer/touch influence and bounded force.
2. **TYPE / Elastic Matter** — expressive type or typographic forms responding to controlled distortion, spacing, and tension.
3. **FIELD / Particles with purpose** — a seeded flow or particle field where density, force, and trajectory are understandable and controllable.
4. **SPACE / Orbital Assembly** — a spatial composition that assembles, separates, and recombines around user-controlled parameters.

These are proposed creative directions, not pre-approved final experiment names or a commitment to ship all four. Select the strongest concepts after prototyping; avoid repeating one visual trick across every study.

### 3.3 Experiment interaction contract

Every experiment must define:
- Its central visual idea and what makes it distinct.
- Inputs and controls, with bounded and understandable effects.
- Pointer, keyboard, and touch interaction paths as appropriate.
- Reset/recompose behavior and a stable resting state.
- Reduced-motion and static/fallback behavior.
- Resource limits, off-screen behavior, and cleanup.
- Whether its output is ephemeral, reproducible, exportable, or saveable. Do not imply capabilities that are not implemented.

## 4. Motion Lab — experience requirements

### 4.1 Creative instrument

Build a focused workspace with:
- A dominant live stage for the motion study.
- A compact, contextual control surface.
- Clear play, pause, reset, and step/scrub behavior where relevant.
- Parameter controls with immediate feedback and sensible ranges.
- A timeline/curve representation that communicates timing and easing rather than decorative waveform imagery.
- Presets as authored starting points, not opaque magic values.
- A clear distinction between the live preview and the editable motion recipe.

### 4.2 Initial motion vocabulary

Prototype a coherent set of motion primitives:
- Transform and spatial offset.
- Duration, delay, and repeat.
- Easing curves and spring-like response.
- Path/orbit and directional movement.
- Stagger and sequencing.
- Morph/assembly where the underlying form supports continuity.

Expose a small number of useful controls first; advanced controls should appear progressively rather than overwhelming the stage. Parameter changes must cause immediate, observable differences.

### 4.3 Reproducibility and output

- Represent a motion study as validated, serializable parameters.
- Provide reset and reproducible presets.
- Keep generator/version and parameter provenance available where an output is saved.
- Define export only when the chosen format and behavior are implemented and tested.
- Cloud artifact persistence depends on the approved data model and later provider validation; do not present cloud save as working before Supabase is configured and tested.

## 5. Visual and interaction direction

- Use controlled chaos: asymmetric composition, oversized labels, layered frames, cropped previews, varied scale, and unexpected but legible rhythm.
- Give each experiment a unique visual identity; do not reuse the same generic 3D blob, gradient, or particle treatment.
- Make the stage feel physical through depth, perspective, material, lighting, and responsive transformation when appropriate.
- Use 3D when true geometry or spatial interaction improves the experiment. Use CSS/SVG/canvas for lighter studies where those are the better tools.
- Use transitions to preserve continuity between gallery, experiment, and Motion Lab contexts.
- Ensure controls are tactile, discoverable, keyboard accessible, touch safe, and honest about their effect.
- Keep navigation, labels, instructions, and recovery actions obvious even when the composition is deliberately unconventional.

## 6. Technical boundaries

- Next.js App Router; Server Components by default.
- Isolate interactive renderers in focused Client Components.
- Lazy-load Three.js/React Three Fiber only for studies that need real 3D.
- Avoid loading multiple heavyweight canvases at once; pause or reduce rendering when inactive/off-screen.
- Use bounded geometry, particle, simulation, and frame budgets with adaptive quality.
- Validate all user-controlled parameters with Zod and clamp numerical ranges.
- Use deterministic seeded randomness for reproducible generative studies.
- Keep experiment definitions in an explicit registry; never dynamically execute user-supplied code, shader source, or modules.
- Keep state local to the experience unless a shared state requirement is demonstrated.
- Preserve the canonical design tokens and CSS Modules.
- Do not add dependencies without a concrete implementation need and compatibility check.

## 7. Persistence and account boundaries

- Phase 08 may deliver reproducible local recipes, presets, and explicitly supported exports.
- Cloud-saved generative artifacts must use the documented artifact model and authenticated server-side authorization once the Supabase environment and policies have been validated.
- Until that provider work is complete, do not fake sign-in, cloud save, sharing, or publishing. Label unavailable capabilities clearly.
- Public sharing, arbitrary user code, arbitrary shaders, and collaborative Playground editing remain out of scope.

## 8. Accessibility, responsive behavior, and performance

- Native scrolling and browser navigation remain intact.
- Full keyboard operation for gallery navigation, filters, controls, dialogs, and timeline interactions.
- Touch equivalents for all pointer-dependent experiment interactions.
- Reduced-motion alternatives that preserve the meaning and core functionality of each study.
- Static or low-cost fallbacks when WebGL is unavailable or device capability is constrained.
- No hover-only information, flashing/strobing effects, or autoplay audio.
- Test at 320, 375, 768, 1024, and 1440 CSS-pixel widths.
- Measure interaction responsiveness, layout stability, JS transfer, frame time, and GPU cost on representative devices before release.
- Dispose listeners, animation loops, and GPU resources correctly.

## 9. Implementation sequence

1. **Completed.** Audited the Phase 07 shell, route structure, canonical tokens, and existing test setup.
2. **Initial index established.** Added a filterable editorial index with direct anchors for the two live studies.
3. **Two distinct studies implemented.** Displacement Field uses seeded canvas geometry and pointer/keyboard influence; Elastic Matter uses typographic deformation with independent tension, release, and inversion controls.
4. **Initial gallery implemented.** Added asymmetric experiment entries and functional ALL / FORM / TYPE filters with reset. More experiment categories and studies remain.
5. **Initial studies implemented.** Both studies expose real parameter controls and reset behavior; browser validation and further touch/reduced-motion review remain.
6. Establish reusable experiment lifecycle, renderer boundaries, deterministic random utilities, and parameter validation.
7. **Instrument expanded.** Added scrub/freeze timeline, easing-curve visualization, three authored presets, and copyable JSON motion recipes.
8. **Second visual grammar implemented.** Elastic Matter is a typographic study rather than another geometry field. Further studies require their own interaction and resource contracts.
9. **Coverage expanded; execution pending.** Added Playwright cases for filters, direct anchors, Elastic Matter controls, timeline scrubbing, presets, recipe output, and narrow mobile overflow, plus unit tests for deterministic generators and validated motion recipes. Browser-history coverage is included; broad accessibility and performance coverage still need expansion.
10. Run supported-runtime install, lint, typecheck, unit, browser, and production-build checks; document actual results.
11. Present Phase 08 for explicit owner review before Phase 09.

## 10. Deliverables

- Playground route and responsive editorial gallery.
- Real category/filter behavior and experiment navigation.
- A small, polished set of distinct, original interactive experiments.
- Motion Lab route with a live stage and meaningful parameter controls.
- Serializable motion recipes and reproducible presets.
- Shared experiment lifecycle and validation conventions.
- Reduced-motion, keyboard/touch, and WebGL fallback behavior.
- Automated tests and a Phase 08 implementation/review log.

## 11. Acceptance criteria

- [ ] Playground is visually distinctive and not a uniform template grid.
- [ ] Every published experiment has a distinct concept and real interaction.
- [ ] Filters, navigation, reset, and direct links work.
- [ ] Motion Lab controls visibly and predictably change the stage.
- [ ] Motion recipes are serializable and reproducible.
- [ ] No fake cloud persistence, sharing, publishing, or authentication.
- [ ] Keyboard, touch, reduced-motion, and WebGL fallback paths work.
- [ ] Responsive layouts are inspected at the required widths.
- [ ] Automated checks pass and actual performance observations are documented.
- [ ] Owner reviews and approves Phase 08 before Phase 09.

## 12. Out of scope

- Real Scene Studio editor and collaboration UI (Phase 09).
- Full Archive/About implementation (Phase 10).
- Cloud artifact persistence until Supabase provider setup and policy validation are complete.
- Public publishing, social feeds, arbitrary user code/shaders, and user-authored plugin execution.
- Billing, teams, and public multiplayer.
