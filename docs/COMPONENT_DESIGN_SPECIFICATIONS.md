# FORMA — Component Design Specifications

**Phase:** 04 — Visual Design System  
**Status:** Proposed; pending product-owner approval  
**Scope:** Visual and behavioral contracts for reusable interface components. No framework or implementation library is assumed.

## 1. Component principles

- Components should be consistent in behavior, not mechanically identical in appearance.
- Prefer semantic HTML patterns and native controls where practical.
- Every state must be legible in both dark and light themes.
- Color is never the only way to communicate status or selection.
- Keyboard access, visible focus, touch usability, and reduced motion are baseline requirements.
- Components must not imply functionality that is not implemented.

## 2. Navigation

### Global navigation
- Wordmark links to Home.
- Primary destinations: Playground, Motion Lab, Scene Studio, Archive, About.
- Current route is indicated through text/underline or a restrained surface treatment.
- Desktop navigation remains compact and does not compete with the page headline.
- Mobile navigation opens a labeled menu sheet with an obvious close action and logical focus order.

### Breadcrumbs and back links
- Use on nested experiment and case-study pages.
- Provide a clear parent destination.
- Avoid redundant breadcrumb trails on top-level pages.

## 3. Buttons and action hierarchy

| Variant | Intended use | Visual treatment |
|---|---|---|
| Primary | Main page or workflow action | High-contrast filled surface |
| Secondary | Supporting action | Quiet outlined or tonal surface |
| Tertiary / text | Low-emphasis navigation or utility | Text-first, clear hover/focus |
| Destructive | Irreversible or risky action | Explicit danger semantics and confirmation |

### Required states
- Default, hover, focus-visible, pressed, disabled, loading.
- Loading preserves button width and exposes a textual accessible name.
- Disabled controls remain understandable; do not use opacity alone if contrast becomes insufficient.
- Icon-only buttons require accessible names and a sufficiently large hit area.

## 4. Links

- Inline links are visually distinguishable without relying only on color.
- External links are identified where the destination context requires it.
- Navigation links and action buttons are not interchangeable: use links for navigation and buttons for actions.
- Visited state may be subtle but should remain distinguishable when useful.

## 5. Experiment preview

### Content
- Preview media, title, short premise, category/metadata, and open affordance.
- The whole preview may be clickable only if nested controls are absent and semantics remain clear.
- Use varied aspect ratios and editorial grouping; do not force all previews into identical cards.

### States
- Default, hover/focus, unavailable, loading, and missing-preview fallback.
- Hover may reveal supplementary detail on desktop, but title and open affordance must remain available without hover.
- Media failure must not collapse the layout.

## 6. Filter and category controls

- Use a small set of clear categories.
- Selected state requires more than a color shift (e.g. filled surface plus check/underline).
- Include an obvious “All” or reset state.
- On mobile, use horizontally scrollable chips or a compact filter sheet.
- Keyboard interaction follows expected button/group semantics.
- Avoid adding search or complex filtering until the content volume justifies it.

## 7. Interactive stage / canvas

- Provide a stable aspect ratio or minimum stage height to prevent layout shift.
- Keep controls adjacent to the stage and group them by task.
- Include reset/replay when the experiment can enter a non-obvious state.
- Provide a textual instruction or label for non-obvious interactions.
- Never make color, sound, or motion the only feedback channel.
- Provide a static or reduced-motion fallback when animation is not essential.
- Pointer/touch gestures must have an alternative where practical.

## 8. Scene Studio shell

### Top bar
- Scene/document identity and save state.
- Undo/redo with disabled states when unavailable.
- Actions are grouped by frequency and risk.
- Destructive actions are visually separated and confirmed.

### Scene hierarchy
- Clearly distinguish selected, hovered, hidden, and locked objects.
- Object names are readable and editable without requiring precision clicks.
- Nested structure uses indentation and disclosure controls.
- Include an empty state and a useful add-object entry point.

### Viewport
- Dominant visual region.
- Selection is visible through more than color alone (outline/handles/label).
- Gizmos and transform controls must be distinguishable from scene content.
- Provide camera/orbit guidance and a reset-view action.
- Rendering failure or unsupported capability produces a recoverable message, not a blank panel.

### Inspector
- Contextual to the current selection.
- Group properties by meaningful concepts.
- Labels remain visible; do not rely on placeholder-only form fields.
- Units and valid ranges are explicit where relevant.
- Changes have clear feedback and can be undone when undo is supported.

### Mobile editor controls
- Bottom dock with a small number of primary tools.
- Secondary panels open as sheets with a clear dismissal gesture and button.
- Minimum touch target: aim for 44 × 44 CSS px, with spacing that reduces accidental activation.
- Do not place essential controls underneath browser safe areas or system gestures.

## 9. Form controls

- Persistent visible labels.
- Help text and validation messages are associated with their fields.
- Errors explain how to recover, not merely that input is invalid.
- Required fields are identified in text.
- Focus remains predictable after validation.
- Prefer native input semantics; custom styling must preserve keyboard and assistive-technology behavior.

## 10. Feedback and status

| Pattern | Use |
|---|---|
| Inline message | Field-level or local context |
| Toast | Brief, noncritical confirmation |
| Persistent status | Save/sync state or ongoing process |
| Dialog | Confirmation or focused decision |
| Empty state | Explain why no content is present and what to do next |
| Skeleton | Temporary loading when final layout is known |

- Do not use toast messages for errors that require user action.
- Avoid stacking multiple notifications.
- Status must include text or an accessible equivalent, not color alone.
- Dialogs must manage focus, support Escape where safe, and return focus to the trigger.

## 11. Modal, sheet, and popover

- Use a modal only when the task requires focused attention.
- Use a sheet for mobile navigation, filters, hierarchy, or inspector panels.
- Use popovers for short contextual controls; do not place long forms in tiny popovers.
- Provide close controls and keyboard dismissal.
- Prevent background interaction while a true modal is active.

## 12. Data and content states

Every data-driven component should define:
- Loading.
- Populated.
- Empty.
- Error.
- Unavailable/permission-limited, when applicable.

Do not show fabricated project counts, saved timestamps, account data, or cloud-save success in static prototypes.

## 13. Accessibility and quality gate

- WCAG 2.2 AA target for text and interface contrast.
- Keyboard operation and visible focus for all interactive elements.
- Logical heading hierarchy and landmark structure.
- Accessible names for controls and meaningful alternative text for images.
- Touch target sizing appropriate for mobile.
- Reduced-motion support.
- Error identification and recovery guidance.
- Test semantic token combinations in actual components; preliminary palette ratios are not sufficient by themselves.

## 14. Implementation boundary

These specifications are framework-agnostic. They do not select React, a component library, a 3D engine, authentication provider, database, hosting platform, or persistence strategy. Those decisions remain in Phase 05. No application implementation is authorized by this document.

---
These specifications are proposals for Phase 04 review and require product-owner approval.
