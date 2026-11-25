# FORMA — Creative Atelier Direction

**Product principle:** FORMA is a digital atelier, not a conventional website with a 3D feature bolted onto it.

**Manifesto:** Form is a verb.

This direction applies to every route, component, interaction, transition, and creative tool. The goal is not to make the interface randomly messy. The goal is to make creative intent visible in the way the product is composed and used.

## 1. The central distinction

FORMA should feel like a creative world people enter to experiment, discover, compose, and make things. Its interface can be expressive, asymmetrical, layered, tactile, kinetic, and occasionally unruly. But the underlying experience must remain legible and dependable.

**Controlled chaos is a compositional tool, not an excuse for confusing UX.**

Every expressive choice must do at least one useful job:
- communicate hierarchy, rhythm, depth, material, or creative intent;
- reveal a capability or invite a meaningful experiment;
- make an action, state, or relationship easier to understand;
- provide feedback that makes the tool feel responsive and alive;
- help the user create, compare, save, remix, or export work.

If a flourish does none of these, it is decoration to reconsider.

## 2. The visual language

### Composition
- Prefer deliberate asymmetry, overlapping planes, unexpected scale shifts, cropped forms, and interrupted grids over generic centered card layouts.
- Use negative space as an active compositional element.
- Let important creative output occupy the stage; interface chrome should support it rather than compete with it.
- Use controlled collisions between editorial typography, specimen imagery, annotations, geometry, and functional controls.
- Allow each route to have a distinct composition while retaining a shared FORMA identity.

### Material and texture
- Treat the interface like a working studio: paper, ink, translucent overlays, technical marks, registration lines, color swatches, measurement notes, and material samples.
- Use the warm paper / near-black ink foundation with signal coral, electric blue, and acid-lime accents.
- Texture should establish tactility or context, not reduce text contrast or obscure controls.
- 3D forms should communicate an actual concept, material, tool, or state—not serve as interchangeable decoration.

### Typography and annotation
- Combine expressive display typography with highly legible interface typography.
- Use specimen numbers, coordinates, small technical labels, marginal notes, and annotations to give the atelier a sense of authorship and process.
- Keep labels concise and consistent. Do not let microtype become the only way to understand an action.

### Motion
- Motion should explain cause and effect: orbit, depth, focus, material response, transformation, progression, and navigation.
- Use GSAP/ScrollTrigger for authored narrative choreography; use React Three Fiber/Three.js for spatial interaction and rendering.
- Use pointer response only where it helps users understand that an object or field is interactive.
- Respect reduced-motion preferences and provide useful static alternatives.
- Avoid perpetual motion that competes with reading, editing, or precision work.

## 3. Route identities

| Territory | Creative character | What the creativity must accomplish |
|---|---|---|
| Home | The atelier's orbiting identity; expressive, spatial, cinematic | Introduce FORMA's creative territories and let users enter them with intent |
| Playground | An experimental worktable; generative, playful, visibly in-progress | Make parameters, seeds, palettes, and variations feel like instruments users can manipulate |
| Motion Lab | A kinetic typography and time laboratory | Make timing, easing, sequencing, and playback directly observable and editable |
| Scene Studio | A dimensional production atelier | Give camera, geometry, materials, lighting, and rendering the precision and feedback of real creative tools |
| Shared navigation and transitions | A spatial connective tissue | Preserve orientation while making movement between territories feel authored |

These are not five copies of one template. Each route should have its own visual rhythm, interaction model, and signature moment.

## 4. The working rules

1. **Meaning before ornament.** Every expressive detail has a purpose that can be stated.
2. **Stage before chrome.** The artwork, instrument, or result remains the primary focus.
3. **Legibility survives chaos.** Navigation, labels, focus states, and controls remain understandable.
4. **Interaction is discoverable.** Do not hide essential actions behind hover-only behavior or unexplained gestures.
5. **Responsive does not mean stripped.** Smaller screens retain the concept and hierarchy, with simplified interaction where necessary.
6. **Accessibility is part of art direction.** Contrast, keyboard access, focus visibility, reduced motion, and semantic controls are mandatory.
7. **Performance is part of craft.** Effects need sensible defaults, bounded quality options, cleanup, and a graceful path for weaker devices.
8. **Creation must be real.** Every advertised control must alter the result, state, saved document, or export in a verifiable way.

## 5. Review checklist for every feature

Before a feature is considered complete, review:
- What creative idea does its visual language express?
- What user action or understanding does each major flourish support?
- Is the primary creative output unmistakably dominant?
- Can a first-time user discover the important controls?
- Does the layout remain intentional on mobile and tablet?
- Does keyboard and reduced-motion use remain supported?
- Are rendering cost and failure states handled?
- Do save, restore, import, and export preserve the settings that users expect?

## 6. Direction of travel

The Camera & Render System advances Scene Studio toward a genuine creative production environment. The next product-wide effort is an **Atelier Expression Pass** across Home, Playground, Motion Lab, and Scene Studio: route-specific compositions, richer authored visual moments, meaningful micro-interactions, and stronger connections between the visual language and each feature's purpose.

The standard is not maximum visual noise. It is a memorable, expressive, usable creative environment where the mess has intention and the tools have substance.
