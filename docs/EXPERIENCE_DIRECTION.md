# FORMA — Experiential Direction

**Version:** 0.2  
**Status:** Product-owner direction captured; execution details remain subject to design and implementation review  
**Scope:** Cross-product experience ambition and technical constraints

---

## 1. The ambition

FORMA must not feel like a conventional SaaS dashboard with decorative 3D added to its surface. It should feel like an interactive digital world shaped by form, motion, experimentation, and creation.

The experience should be:

- **Fancy, not ornamental:** expressive compositions, dimensional typography, spatial transitions, and purposeful visual spectacle.
- **Creative, not templated:** art-directed layouts, surprising compositions, and distinct visual identities for individual experiments.
- **Messy, not careless:** controlled chaos, overlap, asymmetry, distortion, irregular rhythm, and visual tension governed by a clear hierarchy.
- **Generative, not repetitive:** systems that produce meaningful variation from parameters, rules, seeds, user input, and interaction.
- **Performative, not passive:** the interface responds to scrolling, pointer movement, touch, keyboard input, time, and creative decisions.
- **Interactive, not simulated:** controls must cause real, understandable changes. If an element is a visual-only prototype, label it honestly.
- **Original, not AI slop:** no generic gradient wallpaper, random floating blobs, meaningless particles, default template layouts, or gratuitous effects.

**Creative thesis:** FORM IN MOTION becomes a spatial, generative playground—not a collection of pages decorated with animation.

## 2. Experience principles

### 2.1 Controlled chaos

Use asymmetric grids, broken alignment, cropped forms, overlapping layers, variable scale, unexpected negative space, and deliberate density shifts. Establish a strong underlying grid and hierarchy so the composition feels authored rather than accidental.

### 2.2 Spatial storytelling

Use depth to communicate relationships: foreground, working plane, background, focus, and transition. Camera movement and perspective should reveal, connect, or transform content—not simply make the page move.

### 2.3 Interaction has consequence

Every prominent interactive affordance must have a meaningful response: change geometry, reveal information, alter a parameter, affect a composition, change a state, or navigate with clear feedback. Avoid controls that only animate themselves.

### 2.4 Generative authorship

Generative systems should expose their rules. Let users influence parameters, constraints, seeds, palettes, density, timing, geometry, and output. Variation should be reproducible when a seed is saved or shared.

### 2.5 Spectacle with restraint

Not every screen needs to be loud. Discovery surfaces can be theatrical; creation tools must remain legible and precise. Use quiet zones to make expressive moments matter.

### 2.6 Accessibility is part of the art direction

The experience must remain understandable without pointer movement, high frame rates, sound, or motion. Provide keyboard and touch equivalents, reduced-motion behavior, semantic content, and static fallbacks.

## 3. Visual and spatial grammar

Use a small set of authored visual behaviors rather than one global effect applied everywhere.

| Grammar | Use |
|---|---|
| Frame | Bound, crop, reveal, or focus a form |
| Layer | Create foreground/background relationships |
| Shift | Offset, distort, or displace elements with intent |
| Morph | Transform one coherent shape or state into another |
| Orbit | Establish spatial relationships around a focal point |
| Scatter | Generate controlled distributions and compositions |
| Assemble | Build a form from parts or staged constraints |
| Mask | Reveal content through spatial or typographic boundaries |
| Tension | Use elastic, magnetic, or spring-like response with limits |
| Trace | Show a path, history, or motion trajectory |

Treat these as design primitives. Each implementation should have a clear reason, defined interaction, and reduced-motion alternative.

## 4. 3D experience strategy

3D should be a first-class design language, but not a universal requirement for every component.

### 4.1 Where 3D belongs

- **Home / Experience:** one memorable spatial composition that establishes the world of FORMA; scroll can alter the composition, camera framing, or assembly state.
- **Playground:** each experiment may have its own rendering technique and visual grammar. The gallery itself remains editorial and navigable.
- **Motion Lab:** live parameter-driven studies, timelines, curves, procedural patterns, and inspectable motion behavior.
- **Scene Studio:** real editable 3D objects, camera, lights, transforms, materials, selection, and scene persistence within a deliberately constrained MVP.
- **Archive:** selected work can use dimensional previews or spatial case-study transitions where they add context.
- **About:** spatial typography and authored forms may support the narrative, but reading remains effortless.

### 4.2 Camera and transition behaviors

Potential techniques include camera dolly, orbit, parallax, depth-based reveals, object-to-object transitions, geometry morphs, spatial masks, staged assembly, and scroll-linked camera paths.

Use them selectively:
- A transition must preserve orientation and context.
- Avoid disorienting camera spins and continuous motion without user intent.
- Do not hijack native scrolling or trap the user in a cinematic sequence.
- Scroll-linked motion must be progressive and must not hide essential content.
- Provide clear entry/exit states and allow users to continue without waiting for an animation to finish.

### 4.3 Rendering constraints

- Lazy-load Three.js and React Three Fiber only for experiences that need them.
- Keep public editorial content useful when WebGL is unavailable.
- Use adaptive quality: pixel-ratio caps, geometry budgets, instancing where appropriate, and reduced effects on constrained devices.
- Pause or reduce rendering when canvases are off-screen or the page is backgrounded.
- Dispose GPU resources and event listeners correctly.
- Avoid expensive post-processing as a default.
- Do not make a full-screen canvas the only way to access essential text or controls.

## 5. Generative design system

Generative output must be designed as a system with understandable inputs and outputs—not a random-number demo.

### 5.1 Generative primitives

Initial creative vocabulary:
- Parametric geometry and shape grammars.
- Rule-based layout and composition.
- Seeded procedural variation.
- Typographic distortion and spatial typesetting.
- Particle, trail, and field simulations when they communicate a concept.
- Noise and flow fields with constrained ranges.
- Color and material systems derived from approved tokens and experiment-specific palettes.
- Time-based and interaction-driven state changes.

### 5.2 User-facing controls

Where relevant, expose meaningful controls such as:
- Seed / regenerate.
- Density / complexity.
- Scale / proportion.
- Distribution / spacing.
- Palette / material.
- Speed / duration.
- Force / influence.
- Symmetry / asymmetry.
- Save / export / reset.

Do not expose every parameter by default. Use progressive disclosure and sensible presets; advanced controls should deepen the experience rather than overwhelm it.

### 5.3 Determinism and provenance

- Seeded outputs should be reproducible.
- Save the seed, parameters, generator version, and schema version when a user saves a generative artifact.
- Distinguish a saved output from a live simulation.
- Define export formats per experiment; do not imply universal export capability.
- Any AI-assisted generation, if introduced later, must be explicit, controllable, and optional. AI is not a substitute for authored design systems.

## 6. Scroll and motion behavior

Scroll should feel like movement through a designed composition, not a slideshow.

Approved guardrails:
- Native browser scrolling remains in control.
- Use scroll progress to reveal, frame, assemble, or transform elements where the relationship is clear.
- Prefer short, interruptible transitions over long blocking sequences.
- Avoid scroll-jacking, forced waits, and hidden content dependent on animation completion.
- Use IntersectionObserver or equivalent progressive enhancement for reveals; content remains visible if scripts fail.
- Respect `prefers-reduced-motion`; provide static or low-motion equivalents.
- Do not make pointer parallax essential to comprehension.
- Ensure focus indicators and focused controls are not clipped by transforms or overflow containers.

## 7. Interaction vocabulary

Potential interactions include:
- Pointer- and touch-responsive geometry.
- Magnetic attraction with bounded movement and a non-pointer equivalent.
- Drag-to-compose and direct manipulation.
- Scrubbed timelines and parameter curves.
- Click/keyboard-triggered morphs and assemblies.
- Generative regeneration with seed control.
- Contextual inspectors and object selection.
- Spatial navigation with conventional navigation fallback.

Every interaction specification must identify: trigger, visible response, state change, keyboard/touch equivalent, reduced-motion behavior, cancellation/undo behavior where relevant, and failure fallback.

## 8. Page-level expression

| Surface | Expression | Functional priority |
|---|---|---|
| Home | Spatial opening composition, dimensional type, scroll-linked transformation, bold editorial rhythm | Explain FORMA and lead to real experiments |
| Playground | Irregular editorial field of distinct experiment artifacts | Discover, filter, launch |
| Experiment detail | Immersive stage with controls, parameters, and contextual notes | Play, inspect, reset, share/export only where supported |
| Motion Lab | Instrument-like workspace with live motion studies and parameter controls | Change behavior and understand the result |
| Scene Studio | Calm, precise editor around a powerful real 3D viewport | Create, edit, validate, save, recover |
| Archive | Curated visual index with selective spatial case studies | Browse and understand completed work |
| About | Expressive spatial narrative with readable editorial content | Communicate creator and philosophy |
| Account | Restrained, accessible, low-distraction forms | Authenticate reliably |

## 9. Performance and device behavior

- Treat 60 fps as a target for capable devices, not a promise across all hardware.
- Measure frame time and GPU cost on representative desktop, tablet, and mobile devices.
- Provide quality tiers and a stable low-power mode.
- Avoid loading multiple heavyweight canvases simultaneously.
- Prefer CSS transforms for simple interface motion; use WebGL for genuinely spatial or generative work.
- Keep interaction latency low and avoid blocking input during regeneration.
- Use deterministic static previews where live rendering is unnecessary.
- Ensure the Scene Studio remains usable on touch devices with its simplified mobile model.

## 10. Anti-patterns — explicit rejection

- Generic gradient backgrounds used as a substitute for art direction.
- Random blobs, particles, or noise with no conceptual role.
- Repeating the same 3D object in every section.
- Scroll hijacking, forced cinematic waits, or transitions that prevent navigation.
- Cursor effects that obscure controls or make the experience inaccessible.
- Fake editor controls, fake save states, and decorative controls without behavior.
- 3D canvases that bury text, navigation, or accessibility semantics.
- Generative output that cannot be controlled, reset, or reproduced when reproducibility is promised.
- Motion that consumes battery or GPU resources without adding meaning.
- AI-generated visual filler or generic AI-themed motifs.

## 11. Validation checklist

For each major experience, review:
1. Does the visual idea feel authored and specific to FORMA?
2. Does depth or motion communicate something that a static layout cannot?
3. Can users discover and understand the interaction?
4. Does the interaction cause a meaningful state or output change?
5. Can the experience be used with keyboard and touch?
6. Does reduced-motion mode preserve meaning and navigation?
7. Does it remain useful without WebGL or under low-performance conditions?
8. Is the output reproducible when it is presented as generative and saveable?
9. Does the composition preserve legibility and hierarchy?
10. Have real devices and browsers been inspected before calling it complete?

## 12. Scope and status

This document captures the product owner's explicit experiential ambition. It strengthens the approved FORM IN MOTION direction without authorizing unlimited technical scope or replacing the Phase 03 UX, Phase 04 design system, or Phase 05 architecture.

Specific scenes, effects, generator types, and interaction implementations must be prototyped and reviewed. The production application has not started. No browser performance, WebGL compatibility, or device validation is claimed by this document.

## 13. Cross-product experience contract — reaffirmed 2026-11-21

The product owner explicitly reaffirmed that this ambition applies **from the first page through every feature**, not only to the landing page or showcase experiments.

FORMA should create a memorable, brain-stopping first impression and continue rewarding exploration at every depth. The experience should be interactive, fancy, creative, intentionally messy, generative, and performative. Each surface must feel authored rather than assembled from a generic component template.

### The creative bar

- **Surprise through composition:** asymmetry, collision, scale shifts, overlap, cropping, unexpected rhythm, and expressive type.
- **Surprise through space:** dimensional forms, spatial navigation cues, purposeful 3D, camera movement, morphing, and transitions with continuity.
- **Surprise through participation:** direct manipulation, pointer/touch response, keyboard interaction, scroll-linked changes, and controls that produce visible, meaningful outcomes.
- **Surprise through systems:** procedural composition, adjustable parameters, constrained randomness, seeds, and reproducible results where saving or sharing is offered.
- **Surprise through contrast:** alternate theatrical discovery moments with calm, focused workspaces so that intensity remains impactful.

### The usability contract

The interface may be visually chaotic, but the experience must never be confusing. Users must always be able to understand where they are, what can be interacted with, what changed, and how to recover or continue. Essential content cannot depend on animation, hover, pointer precision, audio, or WebGL.

Every feature brief must define its visual thesis, interaction consequences, responsive composition, keyboard/touch path, reduced-motion equivalent, fallback behavior, and performance budget before implementation is considered complete.

This direction raises the creative quality bar; it does not authorize unlimited scope, gratuitous 3D, inaccessible spectacle, arbitrary executable user code, or unverified functionality.
