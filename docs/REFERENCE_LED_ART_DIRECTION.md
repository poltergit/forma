# FORMA — Reference-led Art Direction & Motion Direction

**Phase:** 04 — Visual Design System  
**Status:** Proposed creative direction; pending product-owner review

## 1. Creative brief

FORMA should feel like an independent creative-technology world: part experimental design studio, part interactive playground, part precise creative tool.

The four supplied websites are creative references, not templates. The goal is to synthesize high-level principles into FORMA's own visual language—not reproduce layouts, copy, proprietary graphics, or distinctive choreography.

**Proposed creative territory: FORM IN MOTION.**

A world built from modular geometry, expressive typography, tactile interactions, editorial pacing, and purposeful movement. Discovery surfaces can be theatrical; creation surfaces must remain calm, precise, and focused.

## 2. Reference study

| Reference | Study focus |
|---|---|
| https://damngoodbrands.com/ | Brand expression, identity confidence, typography, graphic devices, brand-to-digital translation |
| https://ci.funtech.inc/en/brand-message | Brand storytelling, message hierarchy, narrative pacing, visual metaphors |
| https://benorth.studio/es | Studio art direction, composition, image treatment, editorial rhythm, interaction details |
| https://workbyw.com/ | Portfolio staging, scroll rhythm, navigation, transitions, hover and reveal behavior |

These are the intended inspection areas, not claims that the live sites have already been fully audited. The final reference matrix must distinguish observed behavior from interpretation and record desktop and mobile states before assigning specific techniques to individual sites.

## 3. FORMA's original visual concept

### Core idea: a form is never static

The approved Modular Frame proposal becomes a living identity system: frames open, split, repeat, shift, align, and transform. This links the brand mark to the product's interactive nature.

Preserve the approved foundation:
- Obsidian (#111214) and Soft Canvas (#F2F0EA) as principal environments.
- Electric Lime (#C7F36B) as a deliberate signal for action, selection, and transformation.
- Signal Coral and Digital Blue as occasional expressive counterpoints.
- Space Grotesk for display, Inter for interface and reading, JetBrains Mono for technical metadata.

Do not turn every section into a dark neon scene. Contrast dark immersive stages with warm editorial surfaces to create rhythm.

### Signature graphic language

1. **Open frame:** cropped or interrupted rectangular structures that imply a viewport, boundary, or work area.
2. **Form shift:** repeated geometry with controlled offsets, scale changes, or alignment changes.
3. **Live grid:** subtle grids used as spatial structure, not wallpaper on every section.
4. **Object studies:** abstract forms that demonstrate material, motion, depth, or interaction.
5. **Technical annotations:** small monospaced labels, coordinates, indexes, and captions used sparingly.

The mark stays simple. The broader identity system carries the expressive behavior.

## 4. Experience principles

- **Expressive entry, useful depth:** first impressions can be theatrical; navigation and task completion remain obvious.
- **Scroll as editorial pacing:** scrolling reveals a considered sequence, not a forced animation ride.
- **Motion communicates change:** movement explains hierarchy, state, cause-and-effect, or transformation.
- **Interaction feels tactile:** controls respond immediately and predictably.
- **Composition over decoration:** typography, negative space, scale, and alignment do more work than ornamental effects.
- **Tools stay calm:** Scene Studio prioritizes precision and sustained focus over spectacle.
- **Content remains accessible:** essential content is never hidden behind hover, scroll position, animation completion, or pointer-only gestures.

## 5. Motion direction

Create a shared motion grammar rather than a collection of unrelated effects.

| Motion family | Purpose | FORMA application |
|---|---|---|
| Reveal | Establish reading order | Headline, copy, and media enter in a short sequence |
| Frame | Establish spatial context | A frame draws, opens, crops, or expands around an object |
| Shift | Show transformation | A form changes position, scale, or alignment |
| Parallax | Suggest depth | Foreground and background move at restrained different rates |
| Morph | Demonstrate state change | Abstract geometry transitions between related forms |
| Mask | Stage media and type | A viewport reveals an image or title |
| Tactile | Confirm user input | Buttons, chips, toggles, and editor controls respond to press/focus |
| Transition | Connect spaces | Shared geometry, color, or object placement carries continuity |

### Timing and easing

Use the visual system's timing as the starting point:
- Micro feedback: 100–180 ms.
- Small interface transitions: 160–240 ms.
- Panel and modal transitions: 200–320 ms.
- Editorial reveals: 350–650 ms.
- Large scene changes: content-dependent; never block access.

Use a restrained set of easing curves: quick ease-out for feedback, smooth ease-in-out for spatial transitions, and a tuned editorial curve for large reveals. Avoid default bounce, elastic overshoot, and long ornamental delays.

### Scroll behavior

- Native document scrolling remains the default.
- Never hijack wheel, touch scrolling, browser history, or keyboard navigation.
- Use sticky sections only when they improve a clear narrative or comparison.
- Keep pinned sequences short, escapable, and responsive to viewport height.
- Scroll-linked animation is progressive enhancement; content remains complete with motion disabled or scripting unavailable.
- Avoid scroll-jacking, forced snap on long-form pages, and animations that make users wait.
- Use discrete reveal triggers; avoid expensive continuous scroll handlers where possible.
- Keep parallax subtle and disable it for reduced-motion preferences and constrained devices.

### Transition behavior

- Route transitions are brief, consistent, and skippable by immediate interaction.
- Prefer continuity through shared geometry, color, or object placement over elaborate wipes.
- Never delay navigation while an animation completes.
- Browser back/forward and direct deep links remain predictable.
- Focus moves to the new page's main heading or main region after client-side navigation.
- Loading and error states are not disguised as transitions.

### Accessibility and performance

- Honor prefers-reduced-motion with a meaningful low-motion presentation, not merely a slower version.
- Provide pause/stop controls for persistent automatically moving content where required.
- Never flash content or use rapid high-contrast motion.
- Keep text stable; avoid animation-driven layout shifts.
- Prefer transform and opacity; profile expensive properties before using them.
- Avoid continuously running WebGL as a prerequisite for understanding the page.
- Provide touch and keyboard alternatives for interactive motion.
- Motion is never the sole carrier of meaning.

## 6. Page-by-page direction

### Home — the world opens
Start with a strong typographic statement and one unmistakable form-based visual. Let the frame system establish the world; avoid a generic hero split with stock imagery. Introduce the pillars as a paced sequence—discover, experiment, create. Use one memorable scroll-led transformation rather than a new effect in every section. Feature real or clearly labeled prototype work. End with a confident invitation into Playground or Scene Studio.

### Playground — an editorial index
Treat each experiment as a distinct visual study. Vary media proportions, scale, and placement while keeping metadata and open affordances consistent. Hover/focus previews remain restrained; essential information stays visible without hover. Filters feel immediate and preserve scroll context.

### Motion Lab — motion as instrument
Make the stage the focus and the control surface a compact instrument panel. Motion studies demonstrate direct cause-and-effect. Provide play, pause, reset, and reduced-motion/static alternatives. Avoid decorative page motion competing with the experiment.

### Scene Studio — spectacle stops at the editor boundary
Preserve the approved professional editor layout. Keep the viewport dominant and panels calm. Use subtle transitions for selection, tool changes, inspector updates, and mobile sheets. Do not add scroll choreography inside the workspace. Mobile remains viewport-first with touch-oriented sheets and a compact dock.

### Archive — work is the story
Present projects as editorial case studies with strong media and clear context. Transitions connect index and detail without obscuring content. Distinguish illustrative entries from real work until the archive is data-backed.

### About — a point of view
Use typographic statements, concise principles, and a clear maker's perspective. Let the graphic identity punctuate the narrative. Keep contact and external links direct.

### Account — utility with brand character
Keep authentication flows calm, clear, and trustworthy. Use the brand typography, spacing, and restrained graphic details. Avoid elaborate transitions between sign-in, registration, and recovery; preserve form context and focus.

## 7. Interaction inventory

The Phase 04 redesign must account for navigation open/close and active state; page entry and section reveals; sticky/pinned narrative sections; hover, focus, pressed, selected, disabled, and loading states; gallery previews and filters; experiment start/pause/reset and parameter changes; Scene Studio selection, object creation, visibility, transforms, undo/redo, and mobile sheets; dialogs and focus return; form validation and recovery; route changes and browser history; reduced-motion and static fallbacks.

Each interaction needs a purpose, default state, keyboard path, touch path where relevant, and reduced-motion behavior.

## 8. Reference study and validation protocol

1. Review each supplied reference at desktop and mobile widths.
2. Record opening viewport, navigation, page rhythm, typography, media composition, hover/focus behavior, scroll effects, route transitions, and footer.
3. Distinguish observed behavior from interpretation.
4. Identify transferable principles without copying distinctive expression.
5. Create a reference matrix with screenshots/notes and the corresponding FORMA design decision.
6. Prototype key motion moments and inspect reduced-motion settings.
7. Validate keyboard use, touch use, performance, and consistency with the approved UX specification.

## 9. Guardrails

- No pixel-for-pixel recreation or copied source, assets, illustrations, copy, or signature choreography.
- No animation added solely to imitate a reference.
- No forced scrolling, cursor gimmicks, sound-on-by-default, or hover-only content.
- No WebGL dependency for basic navigation or reading.
- No production implementation or framework/provider selection in Phase 04.
- No claims of full WCAG conformance based on a design document or static source review alone.

## 10. Approval criteria

The direction is ready for review when FORMA's modular-frame/form-shift identity remains recognizable; all four references have been visually inspected and accurately documented; each page has distinct but coherent art direction; motion, scroll, transitions, and reduced-motion behavior are specified; Scene Studio remains a focused tool; essential interactions have non-motion paths; and the result aligns with the approved PRD, brand guidelines, and UX specification.

**Status:** Proposed. This extends Phase 04; it does not approve Phase 04 or authorize Phase 05.
