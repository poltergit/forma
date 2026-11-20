# FORMA — Page Layout Specifications

**Phase:** 04 — Visual Design System  
**Status:** Proposed; pending product-owner approval  
**Scope:** Configuration-independent visual and interaction planning. These are layout specifications, not implemented pages.

## 1. Shared application frame

### Desktop
- A restrained top navigation anchors the experience: wordmark at left, primary destinations centered or grouped, and one clear account/action area at right.
- Keep navigation visually quiet; the active destination uses a clear text/indicator treatment rather than a large filled tab.
- Content aligns to the shared container and grid tokens in `design/tokens.css`.
- Use a consistent footer on content-led pages. Immersive/editor surfaces may use a compact utility footer or omit the global footer where it interrupts the task.

### Mobile
- Preserve the wordmark and a compact menu trigger in the top bar.
- Navigation becomes a clear sheet or drawer with large touch targets.
- Avoid shrinking desktop multi-column layouts into unreadable stacks. Re-compose each page for a narrow viewport.
- Keep persistent actions reachable without covering important content.

### Global visual rules
- Canvas and surface colors come from semantic tokens, not hard-coded brand colors.
- Large editorial typography is balanced with compact mono labels for metadata.
- Use lime, coral, and blue as purposeful signals, not as simultaneous decoration.
- Every interactive control needs visible hover, focus-visible, pressed, disabled, and (where relevant) loading states.
- Motion must communicate navigation, hierarchy, or state; honor reduced-motion preferences.

## 2. Home / Experience — `/`

**Purpose:** Establish FORMA's identity immediately and invite exploration.

### Desktop composition
1. Shared navigation.
2. Hero: oversized editorial statement, short supporting sentence, and one primary route into the Playground.
3. Signature visual: one distinctive interactive composition or motion-led study, with a static fallback that still communicates the concept.
4. Selected experiments: an intentionally varied editorial arrangement, not a uniform card grid.
5. Studio invitation: introduce Scene Studio as a place to create, with a clear preview of its workflow.
6. Short brand statement and footer navigation.

### Mobile composition
- Hero headline reflows into a deliberate 3–5 line composition.
- Signature visual becomes a contained, performant interaction with a static fallback.
- Selected experiments become a vertical editorial sequence; preserve varied image ratios and hierarchy.

### Content hierarchy
- One primary headline.
- One primary CTA; secondary links remain visually quieter.
- Featured work previews communicate what can be explored before asking users to open them.

## 3. Playground — `/playground`

**Purpose:** Browse and launch interactive experiments.

### Desktop composition
1. Page intro with title, concise explanation, and experiment count only when real data exists.
2. Lightweight category/filter row; filters should never dominate the page.
3. Editorial experiment field with varied preview sizes and aspect ratios.
4. Each preview includes title, one-line premise, category, and a clear open affordance.
5. Optional featured experiment receives more visual weight without hiding the rest.

### Mobile composition
- Filters become horizontally scrollable chips or a compact filter control.
- Previews form a single-column editorial sequence with deliberate rhythm.
- Avoid hover-only discovery; every action is visible or discoverable by touch.

### Empty and loading states
- Loading uses stable skeleton geometry to prevent layout shift.
- Empty filter results explain the state and provide a reset action.
- A missing experiment route offers a useful return to the Playground.

## 4. Experiment detail — `/playground/:slug`

**Purpose:** Put the interactive work first and its explanation second.

### Desktop composition
1. Compact breadcrumb/back link and experiment metadata.
2. Main interactive stage with a clear boundary and stable dimensions.
3. Minimal controls placed adjacent to the stage, not scattered around the page.
4. Editorial explanation: concept, interaction instructions, and technical notes.
5. Related experiments as a quiet next step.

### Mobile composition
- Stage occupies the available width and keeps controls reachable.
- Controls wrap into a compact toolbar or move below the stage.
- Instructions appear before complex interactions when needed.
- Provide a clear reset/replay action for experiments with state.

## 5. Motion Lab — `/motion-lab`

**Purpose:** Explore motion principles and small interaction studies.

### Desktop composition
1. Intro explaining the purpose of the lab.
2. A set of motion studies grouped by concept (e.g. timing, easing, transitions, feedback).
3. Each study presents a live example, a short label, and concise parameter/context notes.
4. A focused detail view may expand one study without navigating away, if it remains accessible.

### Mobile composition
- Studies stack vertically.
- Interactive examples use touch-friendly controls and avoid hover dependencies.
- Motion is reduced or replaced with immediate state changes when reduced motion is enabled.

## 6. Scene Studio — `/scene-studio`

**Purpose:** Create and edit scenes in a focused professional workspace.

### Desktop editor layout
- **Top bar:** product mark, document/scene name, save status, undo/redo, preview/share actions when supported, and account menu.
- **Left rail/panel:** scene hierarchy and object list; supports selection and clear nesting.
- **Center:** dominant 3D viewport with visible scene bounds, camera controls, and contextual transform affordances.
- **Right inspector:** contextual properties for the selected object; sections are grouped and collapsible.
- **Bottom/status area:** contextual tool hints, selection information, and nonintrusive status messages.

### Layout proportions
- Viewport is the dominant region.
- Side panels have predictable widths and can collapse; they must not permanently starve the viewport.
- The inspector changes with selection rather than showing every possible setting at once.
- Avoid placing critical actions exclusively in hidden menus.

### Mobile simplified editor
- Not a scaled-down desktop layout.
- Viewport takes priority.
- A compact bottom tool dock exposes the primary actions.
- Scene hierarchy and properties open as dedicated sheets or full-height panels.
- Selection and transform controls use touch-sized targets and forgiving hit areas.
- Advanced settings may be deferred to a secondary panel; do not overload the first screen.

### Important states to design
- No scene yet / create first scene.
- Scene loading.
- Empty scene.
- Object selected / no object selected.
- Unsaved changes / saving / saved / save failed.
- Unsupported device capability or unavailable rendering context.
- Offline or interrupted persistence (once persistence is implemented).
- Recoverable editor error with a clear retry or exit path.

**Boundary:** Account, cloud persistence, and provider integration are product requirements, but their configuration and implementation belong to later technical phases.

## 7. Archive — `/archive`

**Purpose:** Present completed work as considered case studies.

### Desktop composition
- Editorial intro followed by a curated project index.
- Projects use varied but consistent preview treatments.
- Each entry surfaces project title, type, year, and a concise premise.
- Optional filters stay secondary to the curated presentation.

### Mobile composition
- One-column list with strong title and metadata hierarchy.
- Preview media retains intentional crop and aspect ratio.
- Do not rely on side-by-side metadata that becomes cramped.

## 8. Case study — `/archive/:slug`

**Purpose:** Explain the thinking, process, and outcome behind a project.

### Recommended sequence
1. Project title, type, year, and concise summary.
2. Hero image or media.
3. Challenge / context.
4. Approach and key decisions.
5. Selected process visuals or interaction captures.
6. Outcome, role, and technology details where accurate.
7. Next/previous project navigation.

### Rules
- Never fabricate metrics, client names, roles, or outcomes.
- Media needs descriptive alt text or an equivalent caption.
- Keep long-form reading width comfortable and use a clear heading hierarchy.

## 9. About — `/about`

**Purpose:** Explain the philosophy behind FORMA and the people/work behind it.

### Composition
- Short editorial introduction.
- Product philosophy and principles.
- A concise maker/studio statement, with attribution only when approved.
- Selected links and contact route.
- Footer.

Avoid turning this page into a generic startup manifesto or an oversized résumé.

## 10. Authentication and account surfaces

**Purpose:** Support secure entry and account management without distracting from the creative product.

### Sign in / sign up
- Focused single-column form with clear labels, inline validation, and visible password requirements where applicable.
- Provide accessible error and success feedback.
- Keep legal and recovery links visible but secondary.
- No social-login provider buttons until providers are selected and configured.

### Account settings
- Group profile, security, and session controls.
- Destructive actions require explicit confirmation and clear consequences.
- Account and persistence behavior must be finalized in Phase 05 before implementation.

## 11. Responsive checkpoints

Design and validate at these conceptual widths (not as rigid device targets):
- Narrow mobile: 320–374 px
- Standard mobile: 375–430 px
- Large mobile / small tablet: 431–767 px
- Tablet: 768–1023 px
- Desktop: 1024–1439 px
- Wide desktop: 1440 px and above

At each width, check navigation, reading measure, overflow, interactive target size, viewport priority, and content order.

## 12. Review checklist

- [ ] Every page has one clear primary purpose and action.
- [ ] Shared navigation and page frame feel consistent without making every page identical.
- [ ] Playground and Archive retain editorial variation without sacrificing scanability.
- [ ] Scene Studio remains viewport-first on desktop and touch-first on mobile.
- [ ] Empty, loading, error, and success states are accounted for.
- [ ] No core interaction depends on hover.
- [ ] Focus visibility and keyboard order are defined.
- [ ] Reduced-motion behavior is considered.
- [ ] No external service or backend setup is required to review these layouts.

---
These specifications are proposals for Phase 04 review. They do not authorize application implementation or advance the project to Phase 05.
