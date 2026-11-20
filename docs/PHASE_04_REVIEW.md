# FORMA — Phase 04 Review Package

**Phase:** 04 — Visual Design System  
**Status:** Review package prepared; owner approval pending  
**Scope:** Brand-to-interface translation, seven page prototypes, motion direction, responsive and accessibility source review  
**Repository:** `poltergit/forma`

---

## 1. Phase 04 outcome

The proposed visual system translates FORMA's approved identity into two connected interface modes:

- **Discovery:** expressive editorial layouts, visual experimentation, and purposeful motion.
- **Creation:** quiet, precise, information-dense tools that support sustained work.

The shared art direction is **FORM IN MOTION**: modular geometry, expressive typography, tactile interaction, editorial pacing, and movement that communicates state or transformation.

All seven page prototypes have received the first motion-direction pass. These remain design prototypes, not production application pages.

## 2. Page prototype inventory

| Surface | Design intent | Prototype behavior | Scope limitation |
|---|---|---|---|
| Home | Editorial flagship introduction | Responsive navigation and visual interaction feedback | Featured experiments and editor preview are illustrative |
| Playground | Asymmetric experiment index | Category filters, result count, progressive reveals | Preview artwork is not a live experiment runtime |
| Motion Lab | Motion instrument | Orbit, Pulse, Shift, Stagger studies; adjustable controls; play/pause/reset | Local CSS demonstration, not a production animation engine |
| Scene Studio | Professional editor shell | Local object add/select/delete, transforms, color, visibility, undo/redo, grid and mobile panels | DOM/CSS illustration; no 3D engine, authentication, or cloud save |
| Archive | Editorial project index | Filters, result count, project detail dialogs | Illustrative project entries; no live archive data |
| About | Human, editorial introduction | Progressive reveals and restrained geometric response | External portfolio link; no contact backend |
| Account | Clear account-entry flow | Local sign-in/create/recovery view changes and field validation | No authentication, account creation, or recovery email service |

## 3. Source-level QA results

Checks were performed against the current GitHub source for all seven prototypes.

| Check | Result |
|---|---:|
| Reduced-motion media query present | 7/7 |
| Visible keyboard-focus styling present | 7/7 |
| Responsive breakpoint declarations present | 7/7 |
| Local interaction script present | 7/7 |
| Duplicate HTML IDs found | 0 |
| Unresolved local hash-link targets found | 0 |
| Script opening/closing tag counts balanced | 7/7 |

These are source-presence and structural checks. They do not prove that interactions work correctly in every browser, that focus order is ideal, or that assistive technology announces each state correctly.

## 4. Preliminary semantic contrast calculations

Contrast ratios below were calculated from the proposed token values using the WCAG relative-luminance formula. Ratios are rounded to two decimals.

### Dark surface

| Foreground | Background | Ratio | Text threshold |
|---|---|---:|---|
| Soft Canvas `#F2F0EA` | Obsidian `#111214` | 16.45:1 | Pass |
| Electric Lime `#C7F36B` | Obsidian `#111214` | 14.69:1 | Pass |
| Stone Gray `#92938F` | Obsidian `#111214` | 6.06:1 | Pass |
| Secondary text `#B0B0AA` | Obsidian `#111214` | 8.60:1 | Pass |
| Signal Coral `#FF765E` | Obsidian `#111214` | 7.14:1 | Pass |
| Digital Blue `#647BFF` | Obsidian `#111214` | 5.19:1 | Pass |

### Light surface

| Foreground | Background | Ratio | Text threshold |
|---|---|---:|---|
| Dark green accent `#526D16` | Soft Canvas `#F2F0EA` | 5.18:1 | Pass |
| Dark coral accent `#B13E2E` | Soft Canvas `#F2F0EA` | 5.12:1 | Pass |
| Dark blue accent `#4658D6` | Soft Canvas `#F2F0EA` | 5.08:1 | Pass |
| Muted text `#696B64` | Soft Canvas `#F2F0EA` | 4.74:1 | Pass |
| Secondary text `#555650` | Soft Canvas `#F2F0EA` | 6.50:1 | Pass |

**Important:** These results cover the listed semantic color pairings only. They are not a complete WCAG 2.2 AA audit of every prototype. Borders, selected states, hover states, overlays, disabled controls, error states, and real text/background combinations still require rendered inspection.

## 5. Shared design-system implementation notes

- `design/tokens.css` is the framework-agnostic semantic token source.
- The standalone HTML prototypes retain local styles so they can be opened independently.
- Production components should map their local values to shared semantic tokens rather than allowing color, typography, spacing, and motion values to drift.
- The selected typefaces remain Space Grotesk, Inter, and JetBrains Mono, with system fallbacks.
- Production font loading strategy remains a technical implementation decision for a later phase.
- Discovery surfaces may use expressive reveals and artwork response; Scene Studio and account flows should prioritize clarity and control.
- Native scrolling remains the default. Do not introduce scroll hijacking or motion that blocks access to content.
- Reduced-motion behavior must remain a first-class implementation requirement.

## 6. Validation still required

The following items have not been verified in a real browser or assistive-technology environment:

1. Render all seven pages at representative desktop, tablet, and mobile viewport sizes.
2. Check for horizontal overflow, clipped content, navigation collisions, and obstructed focus.
3. Exercise keyboard-only navigation, dialogs, filters, forms, mobile navigation, and Scene Studio panels.
4. Test screen-reader announcements, labels, errors, and state changes.
5. Verify reduced-motion behavior in browser settings, including reveal fallbacks.
6. Test font loading and layout stability with the intended font files.
7. Measure actual rendered control boundaries and state contrast.
8. Inspect the four owner-supplied reference sites directly before documenting specific observed techniques:
   - https://damngoodbrands.com/
   - https://ci.funtech.inc/en/brand-message
   - https://benorth.studio/es
   - https://workbyw.com/

No claim of browser rendering, automated browser testing, screen-reader testing, or direct reference-site inspection is made in this review.

## 7. Approval gate

Phase 04 is ready for product-owner design review, but is **not approved yet**.

Approval should confirm:
- The FORM IN MOTION direction.
- The visual system and semantic token foundations.
- The seven page compositions and their responsive intent.
- The distinction between expressive discovery surfaces and focused creation tools.
- The proposed motion and accessibility guardrails.

Any remaining browser, accessibility, or reference-site validation limitations must stay visible as follow-up work rather than being represented as completed.

**Phase 05 — Technical Architecture must not begin until the owner explicitly approves Phase 04.**
