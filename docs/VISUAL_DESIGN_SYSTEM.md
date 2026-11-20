# FORMA — Visual Design System

**Version:** 1.0  
**Phase:** 04 — Visual Design System  
**Status:** Proposed for product-owner approval  
**Inputs:** Approved PRD v1.1, Brand Guidelines v1.1, and UX Specification v1.0

---

## 1. Design objective

Translate FORMA's approved identity—editorial precision meets interactive experimentation—into a consistent, implementable interface system.

The system must support two related but distinct visual environments:

- **Discovery surfaces:** expressive, editorial, content-led, and immersive where useful.
- **Creation surfaces:** precise, quiet, information-dense, and optimized for sustained interaction.

The product should feel art-directed without sacrificing usability. Visual effects are subordinate to hierarchy, clarity, accessibility, and performance.

## 2. Approved brand foundations

The following values are inherited from the approved Brand Guidelines and are not reopened by this specification:

### Color palette

| Token | Color | HEX | Intended role |
|---|---|---|---|
| color.obsidian | Obsidian | #111214 | Primary dark surface |
| color.canvas | Soft Canvas | #F2F0EA | Primary light surface |
| color.lime | Electric Lime | #C7F36B | Signature accent |
| color.coral | Signal Coral | #FF765E | Supporting expressive accent |
| color.blue | Digital Blue | #647BFF | Supporting expressive accent |
| color.stone | Stone Gray | #92938F | Secondary text |

### Typography

| Token | Typeface | Intended role |
|---|---|---|
| font.display | Space Grotesk | Display, headlines, prominent statements |
| font.body | Inter | Body, navigation, labels, interface |
| font.mono | JetBrains Mono | Technical metadata, values, code references |

Use font fallbacks and avoid blocking page rendering while web fonts load.

## 3. Color system and semantic roles

Brand colors are raw palette values. Components should consume semantic tokens so themes and contrast can be adjusted without rewriting component styles.

### Core semantic tokens

| Semantic token | Dark theme | Light theme |
|---|---|---|
| surface.page | Obsidian | Soft Canvas |
| surface.raised | #191A1D | #FFFFFF |
| surface.sunken | #0B0C0E | #E8E6DF |
| surface.overlay | #202226 | #FFFFFF |
| text.primary | #F2F0EA | #111214 |
| text.secondary | #B0B0AA | #555650 |
| text.muted | #92938F | #6E7069 |
| border.subtle | #303236 | #D7D5CD |
| border.strong | #55585D | #A6A49B |
| accent.primary | #C7F36B | #526D16 |
| accent.secondary | #FF765E | #C54835 |
| accent.tertiary | #8294FF | #4658D6 |
| state.success | #A7D977 | #426D24 |
| state.warning | #F0C36A | #8A5A08 |
| state.danger | #FF806F | #B52F28 |
| state.info | #8CA6FF | #344FB7 |

These semantic mappings are proposals for implementation, not claims of completed contrast validation. Exact foreground/background pairs must be measured and adjusted during implementation to meet WCAG 2.2 AA. Do not use a raw brand accent for small text unless its contrast passes.

### Color behavior

- Obsidian and Soft Canvas remain the principal brand surfaces.
- Dark is the default visual direction for the flagship experience; light surfaces are used deliberately for editorial contrast and content variation.
- Electric Lime is the primary action and emphasis color, not a universal decoration.
- Coral and Blue identify selected content or states, not every section.
- State colors must be accompanied by text or iconography; never communicate state through color alone.
- Avoid large gradient backgrounds and excessive colored glow.

## 4. Typography scale

Use a fluid scale with a small number of named roles. The values below are starting specifications and should be tuned against actual page compositions.

| Role | Desktop target | Mobile target | Typeface | Usage |
|---|---:|---:|---|---|
| Display XL | 88–112 px | 48–64 px | Space Grotesk | Home hero, rare statement |
| Display L | 64–80 px | 40–52 px | Space Grotesk | Major page statement |
| Heading 1 | 48–56 px | 36–42 px | Space Grotesk | Page title |
| Heading 2 | 32–40 px | 28–32 px | Space Grotesk | Section title |
| Heading 3 | 24–28 px | 22–24 px | Space Grotesk | Subsection title |
| Heading 4 | 18–20 px | 18–20 px | Inter | Panel/utility heading |
| Body L | 18–20 px | 17–18 px | Inter | Introductory copy |
| Body | 16 px | 16 px | Inter | Default body |
| Body S | 14 px | 14 px | Inter | Secondary content |
| Label | 12–13 px | 12–13 px | Inter | Controls and metadata |
| Technical | 11–13 px | 11–13 px | JetBrains Mono | Parameters and annotations |

Rules:
- Body copy uses comfortable line height (approximately 1.5–1.7).
- Display text uses tighter line height (approximately 0.95–1.1).
- Avoid long all-caps headings.
- Use letter spacing sparingly and intentionally.
- Maintain readable line lengths; long-form content should not span the full viewport.
- Do not use monospace for ordinary paragraphs.

## 5. Spacing and layout

Adopt a consistent 4 px base unit.

| Token | Value |
|---|---:|
| space.1 | 4 px |
| space.2 | 8 px |
| space.3 | 12 px |
| space.4 | 16 px |
| space.5 | 20 px |
| space.6 | 24 px |
| space.8 | 32 px |
| space.10 | 40 px |
| space.12 | 48 px |
| space.16 | 64 px |
| space.20 | 80 px |
| space.24 | 96 px |
| space.32 | 128 px |

### Layout grid

Proposed responsive grid:
- Desktop: 12 columns.
- Tablet: 8 columns.
- Mobile: 4 columns.
- Use fluid gutters and consistent alignment.
- Keep text blocks narrower than visual canvases.
- Let selected hero and project compositions break the grid intentionally, not randomly.

### Container guidance

| Context | Maximum width guidance |
|---|---:|
| Reading content | 720 px |
| Standard page content | 1200 px |
| Wide editorial/experiment content | 1440 px |
| Scene Studio workspace | Available viewport width |

These are starting constraints; final measurements should be tuned in page compositions.

## 6. Shape, borders, and elevation

FORMA should use a restrained geometry system.

### Radius

| Token | Value | Use |
|---|---:|---|
| radius.none | 0 px | Editorial edges, structural dividers |
| radius.sm | 4 px | Compact controls |
| radius.md | 8 px | Inputs, buttons, small surfaces |
| radius.lg | 12 px | Selected panels and media |
| radius.xl | 18 px | Large feature surfaces when justified |
| radius.pill | 999 px | Pills and compact status indicators |

Do not round every surface. Sharp corners are valid and often preferable for editorial composition.

### Borders

- Use 1 px borders for structural separation.
- Prefer subtle neutral borders over shadows for panels.
- Use stronger borders for selected, focused, or active states.
- Avoid nested bordered containers that create visual noise.

### Elevation

Use elevation sparingly:
- Menus and popovers may use a restrained shadow.
- Dialogs should separate clearly from their backdrop.
- Most page sections should rely on spacing and surface contrast rather than shadows.
- No default glassmorphism.

## 7. Component visual specifications

### Navigation

- Wordmark is the strongest brand element in the header.
- Navigation labels use the body/interface typeface.
- Active state uses a clear indicator (underline, marker, or tonal change), not color alone.
- Header may adapt to page context but must preserve predictable placement and behavior.
- Mobile navigation uses a dedicated menu treatment with focus management.

### Buttons

Three primary variants:
1. **Primary:** high-contrast filled action; Electric Lime on dark surfaces where contrast passes.
2. **Secondary:** neutral surface or outlined treatment.
3. **Tertiary:** text action for low-emphasis navigation.

States:
- Default, hover, focus-visible, active, disabled, and loading.
- Loading buttons must prevent duplicate submission and expose progress.
- Icon-only buttons require accessible names and clear hit areas.

Avoid oversized pill buttons as the default. Shape should suit the context.

### Links

- Distinguish links from body text through underline, color, or another persistent affordance.
- Hover must not be the only indication.
- External links should be identified where that context matters.

### Inputs

- Persistent labels, not placeholder-only labels.
- Clear focus ring and error state.
- Inline validation where useful.
- Error text associated with its input.
- Password visibility control must have an accessible name.
- Disabled and read-only states must be distinguishable.

### Filters and tabs

- Use clear selected states.
- Keep filter controls compact and understandable.
- Provide a reset/clear action when filters can produce an empty result.
- Do not use tabs for unrelated destinations that deserve routes.

### Experiment previews

- Preview imagery is the primary visual content.
- Name, concise description, and technique metadata form the text hierarchy.
- Use a varied editorial layout with consistent metadata placement.
- Hover effects should preview interaction subtly, not hide essential information.
- Never fabricate live previews or screenshots.

### Status and feedback

- Use concise text plus optional icon.
- Distinguish neutral, success, warning, and error states.
- Use inline feedback for save status and form errors.
- Reserve dialogs for consequential decisions.

## 8. Page-level art direction

### Home

- Strong typographic opening.
- Asymmetric editorial layout.
- One purposeful hero composition with restrained depth and interaction.
- Featured work presented as curated visual studies, not a repetitive card wall.
- Clear paths into Playground and Scene Studio.
- Hero must remain understandable and useful without WebGL.

### Playground

- Editorial index with varied preview proportions and deliberate rhythm.
- Filters remain easy to locate.
- Metadata is consistent even when preview layouts vary.
- Prioritize actual experiments and visual evidence.

### Experiment detail

- Give the interactive work a large, uninterrupted stage.
- Place controls in a distinct, accessible region.
- Keep technical context available without competing with the experiment.
- Provide a clear exit/back path.

### Motion Lab

- Treat each study as a focused visual composition.
- Parameter controls should feel like an instrument panel, not a generic settings form.
- Clearly identify which values are adjustable and what they affect.

### Scene Studio

**Approved layout direction:** professional creative editor.

Desktop:
- Compact top toolbar.
- Left scene hierarchy.
- Dominant central viewport.
- Right contextual properties inspector.
- Optional restrained bottom status/help strip.

Visual behavior:
- Dark, low-distraction workspace.
- Neutral panels and dividers.
- Lime reserved for primary actions or meaningful active states.
- Technical values use JetBrains Mono.
- Selected object and active tool must be visually obvious.
- Properties update based on selection; irrelevant controls remain hidden.
- Save status remains visible without becoming a distracting notification.

Tablet:
- Viewport remains central.
- Hierarchy and properties panels become collapsible or contextual.
- Avoid displaying every panel simultaneously if the workspace becomes cramped.

Mobile:
- **Approved direction:** simplified mobile editor.
- Viewport first; tools and properties open through clear bottom sheets or dedicated panels.
- Support only controls that can be used accurately with touch.
- Do not shrink the desktop panel layout into unreadable columns.

### Archive and case studies

- Editorial project storytelling.
- Strong title, project metadata, and real imagery.
- Use whitespace and typographic hierarchy to separate problem, process, implementation, and outcome.
- Avoid fabricated performance metrics or testimonials.

### About

- Human, concise, and editorial.
- Clear personal introduction and capabilities.
- Contact action should be easy to find.
- Avoid generic résumé dashboard patterns.

## 9. Motion and interaction design

Motion must express state, cause-and-effect, hierarchy, or transformation.

### Timing guidance

| Interaction | Initial duration guidance |
|---|---:|
| Hover/focus feedback | 120–180 ms |
| Button press | 100–160 ms |
| Small UI transition | 160–240 ms |
| Panel/dialog transition | 200–320 ms |
| Editorial reveal | 350–650 ms |
| Large scene transition | Context-dependent; avoid delaying access |

Use easing that feels deliberate and responsive. Avoid bounce by default for ordinary interface controls.

### Motion rules

- Provide immediate feedback for user input.
- Avoid scroll hijacking.
- Avoid blocking content behind animation sequences.
- Do not animate every element into view.
- Use transform and opacity for common transitions where practical.
- Respect prefers-reduced-motion; provide static or greatly simplified alternatives.
- Keep 3D camera movement purposeful and user-controllable where appropriate.

## 10. Responsive system

Proposed CSS breakpoint starting points:
- Small: below 640 px.
- Medium: 640–1023 px.
- Large: 1024–1439 px.
- Extra large: 1440 px and above.

These are layout thresholds, not device categories. Components should respond to available space and content, not named devices.

Acceptance:
- No horizontal overflow at supported viewport widths.
- Type remains readable without awkward wrapping.
- Controls remain touch-usable.
- Navigation does not collide.
- 3D scenes have an appropriate fallback or reduced rendering mode.
- Scene Studio mobile interactions are intentionally simplified.

## 11. Accessibility and contrast requirements

Target WCAG 2.2 AA.

- Normal text contrast ratio: at least 4.5:1.
- Large text contrast ratio: at least 3:1.
- Meaningful UI boundaries and graphical controls: at least 3:1 where required.
- Visible keyboard focus.
- Focus must not be obscured by sticky headers or overlays.
- Do not rely on color alone for active, error, or saved states.
- Honor reduced motion.
- Controls need labels, accessible names, and usable target sizes.
- Test text and interactive states on both dark and light surfaces.

The proposed semantic colors in this document must be contrast-tested before being frozen as implementation tokens.

## 12. Design token implementation contract

When Phase 04 is approved, implement tokens as centralized CSS custom properties (or the equivalent chosen in Phase 05).

Expected token groups:
- Color palette and semantic roles.
- Typography families, sizes, line heights, and weights.
- Spacing.
- Layout containers and grid.
- Radius.
- Borders and elevation.
- Motion durations and easing.
- Breakpoints where needed by tooling.

Components should reference semantic tokens rather than hard-coded repeated values. Avoid creating a token for every one-off value.

## 13. Phase 04 acceptance criteria

1. Approved brand palette and typography are preserved.
2. Raw palette values are mapped to semantic surface, text, border, accent, and state roles.
3. Typography scale is defined for desktop and mobile.
4. Spacing, grid, container, radius, and border conventions are documented.
5. Core component states and behaviors are specified.
6. Page-level art direction is consistent with approved UX.
7. Scene Studio desktop, tablet, and mobile treatments are defined.
8. Motion principles and timing guidance are documented.
9. WCAG 2.2 AA contrast validation is part of implementation readiness.
10. Token implementation contract is clear and avoids unnecessary complexity.

**Phase 04 status: Proposed. Awaiting product-owner approval.**

On approval, Phase 05 will finalize the application architecture, framework/tooling, data model, authentication, authorization, scene persistence, security, deployment, and free-tier constraints before frontend implementation begins.
