# FORMA — UX Specification

**Version:** 1.0  
**Phase:** 03 — UX and Information Architecture  
**Status:** Proposed for product-owner approval  
**Inputs:** Approved Product Requirements Document v1.1 and Brand Guidelines v1.1

## 1. UX objective

FORMA must feel like one coherent creative technology product with several distinct destinations—not a generic marketing site, dashboard, or collection of identical cards.

The experience has two connected modes:

1. **Discovery:** visitors understand the product, explore experiments, read project stories, and learn about the creator.
2. **Creation:** users enter Scene Studio, work with a 3D scene, and save their work to their account.

The interface should make the transition between discovery and creation obvious without making authentication a barrier to exploring public content.

## 2. UX principles

- **Orient before impressing:** visitors should understand where they are and what they can do.
- **Let the work lead:** experiments and project evidence take priority over decorative interface chrome.
- **Distinct spaces, shared system:** Playground, Motion Lab, Archive, and Scene Studio may have different layouts while sharing typography, color, spacing, and interaction conventions.
- **Progressive disclosure:** advanced controls appear when relevant; first-time visitors are not overwhelmed.
- **Visible system status:** saving, loading, errors, authentication, and unsaved changes must be communicated clearly.
- **Responsive by design:** mobile is a deliberately adapted experience, not a compressed desktop layout.
- **Accessible by default:** keyboard use, visible focus, semantic structure, contrast, and reduced motion are required.
- **No dead affordances:** every visible control must perform its stated action.

## 3. Information architecture and sitemap

### Public routes

| Route | Page | Primary purpose |
|---|---|---|
| / | Home / Experience | Introduce FORMA and direct visitors to meaningful work |
| /playground | Playground | Discover and filter interactive experiments |
| /playground/:slug | Experiment detail | Experience one experiment and understand its implementation |
| /motion-lab | Motion Lab | Explore motion-focused interactive studies |
| /archive | Archive | Browse projects and case studies |
| /archive/:slug | Case study | Understand a project's context, process, and technical decisions |
| /about | About | Explain the creator, philosophy, skills, and contact |

### Account and application routes

| Route | Page | Access |
|---|---|---|
| /auth/sign-in | Sign in | Public |
| /auth/sign-up | Create account | Public |
| /scene-studio | Scene Studio | Public entry; editing and cloud saving require authentication |
| /account | Account settings | Authenticated |

Account settings are intentionally narrow for the MVP: profile basics, sign-out, and account-related status. No social profile or community system is implied.

### Route principles

- Public experiments and case studies must be viewable without an account.
- Scene Studio should explain its purpose before requesting sign-in.
- After successful authentication, return users to their intended destination.
- Unknown routes show a designed not-found page with useful navigation.
- Do not expose private scene identifiers or private scene data in public routes.
- Public scene sharing is deferred; private scenes are not addressable by unauthenticated visitors.

## 4. Global navigation

### Desktop

Primary navigation:
- FORMA wordmark → Home.
- Playground.
- Motion Lab.
- Scene Studio.
- Archive.
- About.

Account action:
- Signed out: Sign in (secondary) and an optional Open Studio action where contextually appropriate.
- Signed in: account menu with account settings and sign out.

Navigation behavior:
- Current destination is visibly indicated.
- Hover is supplementary; keyboard focus and click must work.
- Navigation remains visually quiet and must not compete with page content.
- Avoid adding a large persistent sidebar to public-facing pages.

### Mobile

- Use a compact header with wordmark and menu control.
- Menu opens a clearly labeled navigation panel or full-height overlay.
- Each destination is a large, touch-friendly link.
- The menu closes after navigation and with Escape.
- Focus remains managed inside an open modal-style menu and returns to its trigger when closed.
- Do not shrink the desktop navigation until labels become cramped.

### Footer

A consistent footer provides:
- FORMA wordmark and short positioning statement.
- Primary destination links.
- Creator/contact links when configured.
- Copyright information.

Do not invent social profiles, contact addresses, or company details.

## 5. Page responsibilities and structural direction

These are structural wireframe descriptions, not final visual designs.

### 5.1 Home — /

**Goal:** communicate what FORMA is, show evidence of craft, and invite exploration.

Recommended content order:

1. **Header:** wordmark, primary navigation, account action.
2. **Hero:** concise positioning statement, one primary action to explore the Playground, one secondary action to open Scene Studio.
3. **Interactive visual:** one distinctive 2D/3D composition that supports the message. It must not block the main content or navigation.
4. **Featured experiments:** a small curated selection with meaningful visual previews and clear labels.
5. **Creative statement:** a concise explanation of the form/function philosophy.
6. **Selected archive work:** a small number of real projects or case studies.
7. **Studio invitation:** introduce Scene Studio and explain what visitors can do there.
8. **Footer:** navigation and contact.

UX rules:
- The primary value proposition must be understandable without interacting with the hero.
- Do not put essential copy inside a canvas.
- Avoid a long intro animation or forced loading sequence.
- The page must remain complete if WebGL is unavailable.
- Featured content must be real, curated, and linked to working destinations.

### 5.2 Playground — /playground

**Goal:** make experiments easy to discover and understand.

Structure:
1. Page title and short explanation.
2. Category/filter controls.
3. Optional search when the experiment collection is large enough to justify it.
4. Experiment results.
5. Empty state when no experiments match.
6. Footer.

Each experiment preview should communicate:
- Name.
- One-line purpose or description.
- Category or technique.
- Whether it is interactive.
- A meaningful preview image or live preview when performance permits.

Do not force all experiments into identical cards. Layout may vary by editorial importance, but navigation and metadata should remain consistent.

Initial category model:
- All.
- 3D.
- Motion.
- Generative.
- Interaction.

Categories are metadata, not separate top-level destinations by default. Motion Lab remains a distinct curated destination.

### 5.3 Experiment detail — /playground/:slug

**Goal:** provide an uninterrupted experiment with enough context to appreciate its craft.

Structure:
1. Back link to Playground.
2. Experiment name, concise description, and technique metadata.
3. Main interactive canvas or composition.
4. Controls and parameter explanations where applicable.
5. Reset action when the experiment has mutable state.
6. Technical notes: intent, implementation approach, and relevant technologies.
7. Related experiments.
8. Return-to-Playground link.

Behavior:
- Provide a clear loading and unsupported-device fallback.
- Keep controls keyboard-accessible and labeled.
- Reset returns the experiment to its documented initial state.
- Do not imply settings are saved unless persistence exists.

### 5.4 Motion Lab — /motion-lab

**Goal:** present motion and generative interaction as a coherent collection of studies.

Structure:
1. Introduction explaining the focus of the lab.
2. Featured motion study.
3. Browseable set of motion experiments.
4. Optional controls for live parameters within each study.
5. Short technical context.

Motion Lab should feel like a curated laboratory, not a second copy of the Playground. The Playground is the general discovery index; Motion Lab is a focused destination for motion-led work.

### 5.5 Scene Studio — /scene-studio

**Goal:** let a user create, edit, and manage a personal 3D scene.

#### Entry experience

Before authentication, explain:
- What Scene Studio does.
- What can be edited in the initial release.
- That saving scenes requires an account.
- What happens after signing in.

Provide actions:
- Sign in.
- Create account.
- Explore a non-persistent preview only if a genuinely functional preview mode is implemented.

Do not present a fake editor or nonfunctional controls to signed-out visitors.

#### Authenticated editor structure

**Desktop layout:**
- Top bar: Studio identity, scene name, save status, save action, account menu.
- Main viewport: central 3D scene.
- Left panel: scene objects/hierarchy and selection.
- Right panel: contextual properties for the selected object.
- Optional compact bottom/status region: viewport hints and feedback.

The viewport receives the greatest visual priority. Panels should remain restrained and avoid dashboard-like clutter.

**Initial editing capabilities:**
- Load the default starter scene.
- Select supported objects.
- Transform supported objects (position, rotation, scale).
- Change a defined set of material properties.
- Adjust a bounded set of lighting and camera settings.
- Change scene background from approved options.
- Reset to the starter scene.
- Save and load private scenes from the authenticated account.
- Export a screenshot.

Do not imply arbitrary mesh modeling, advanced sculpting, physics simulation, or professional DCC functionality.

#### Scene lifecycle

1. User opens Scene Studio.
2. If signed out, user sees the entry explanation and authentication actions.
3. After authentication, user can create a scene or open an existing saved scene.
4. The editor loads a starter scene or selected saved scene.
5. Changes update the local editing state.
6. Save action persists the scene configuration to the authenticated user's cloud data.
7. UI reports saving, saved, or failed state.
8. User can reopen the saved scene later.

#### Save behavior

- Display explicit states: Unsaved changes, Saving, Saved, and Save failed.
- Do not display Saved until the server confirms persistence.
- Prevent accidental loss when navigating away with unsaved changes; use a clear confirmation when needed.
- Handle expired sessions and network failures without silently discarding the current in-memory scene.
- Scene ownership must be enforced server-side, not trusted from client-supplied user IDs.
- Scene schema and provider implementation are deferred to Phase 05.

#### Mobile behavior

The initial mobile experience should prioritize safe viewing and a simplified supported control set. Do not force the full desktop multi-panel editor into a narrow screen.

If editing on a particular device is unsupported or materially degraded, explain the limitation and provide a usable view-only or guided experience rather than shipping broken controls.

### 5.6 Archive — /archive

**Goal:** show the quality and reasoning behind real projects.

Structure:
1. Archive introduction.
2. Selected work / project list.
3. Filters only if the collection size warrants them.
4. Project metadata: name, type, year, technologies, and status where factual.
5. Footer.

Use editorial composition and varied project previews. Do not fabricate projects or metrics to fill the page.

### 5.7 Case study — /archive/:slug

**Goal:** explain what was built and demonstrate engineering judgment.

Recommended content:
1. Project title and concise summary.
2. Project role, year, type, and technology.
3. Live project link where one exists.
4. Problem or objective.
5. Constraints and decisions.
6. Selected interface or implementation visuals.
7. Technical approach.
8. Outcome and honest limitations.
9. Related work.

Only publish verifiable claims and real project assets.

### 5.8 About — /about

**Goal:** establish the creator's identity and motivation without turning the page into a generic résumé template.

Structure:
1. Personal introduction.
2. Creative and engineering philosophy.
3. Relevant capabilities and tools.
4. Selected work links.
5. Contact action.
6. Footer.

Use actual creator information and configured contact links. Do not invent biography, experience, client lists, or credentials.

### 5.9 Authentication

**Sign in:**
- Email and password initially, subject to provider and security decisions in Phase 05.
- Clear validation and error feedback.
- Link to account creation.
- Return to the intended destination after success.

**Sign up:**
- Minimal required fields.
- Password requirements communicated before submission.
- Clear success, verification, and failure states according to the chosen auth provider.
- No unnecessary profile questionnaire.

**Account:**
- Basic account identity.
- Sign out.
- Account status and relevant session feedback.
- No public profile or social functionality in the MVP.

## 6. Core user flows

### Flow A — Recruiter exploring FORMA

Home → Featured experiment → Experiment detail → Technical notes → Archive case study → About/contact.

Success condition: the visitor can quickly identify the creator's capabilities and inspect real evidence.

### Flow B — Visitor exploring experiments

Home or navigation → Playground → Select category → Experiment detail → Interact → Reset or explore related work.

Success condition: the visitor can discover, operate, and understand an experiment without an account.

### Flow C — Visitor exploring Motion Lab

Navigation → Motion Lab → Select study → Interact with parameters → Read technical context → Explore another study.

Success condition: motion-led work is easy to explore without duplicating the general Playground experience.

### Flow D — New Scene Studio user

Scene Studio → Read entry explanation → Create account → Complete required verification if configured → Return to Studio → Create starter scene → Edit → Save → Receive server-confirmed saved state.

Success condition: the user creates an account and successfully saves a private scene.

### Flow E — Returning Scene Studio user

Scene Studio → Sign in → View saved scenes → Open scene → Edit → Save changes → Export screenshot.

Success condition: the previously saved scene is retrieved and updated without losing ownership or data.

### Flow F — Save failure

Edit scene → Save → Network/session/server error → Preserve current local editor state → Show clear error → Retry or reauthenticate → Confirm saved only after server success.

Success condition: failure is visible and does not silently destroy work.

## 7. Interaction and system states

Every data-driven page and control must account for the relevant states.

| State | UX requirement |
|---|---|
| Initial loading | Use restrained skeletons or progress feedback appropriate to the content |
| Empty collection | Explain why it is empty and provide a useful next action |
| No filter results | Offer a clear way to reset filters |
| Error | Explain what failed and whether retry is possible |
| Offline/network issue | Preserve local work where feasible and communicate sync status |
| Authentication required | Explain why sign-in is needed and preserve intended destination |
| Unsaved changes | Make unsaved state visible |
| Saving | Show progress and prevent misleading duplicate success feedback |
| Saved | Show only after server confirmation |
| Save failed | Preserve current work and offer retry/recovery |
| Unsupported WebGL | Provide meaningful non-WebGL content or fallback |
| Reduced motion | Remove or simplify nonessential movement |

## 8. Responsive behavior

### Desktop

- Use editorial multi-column compositions where content benefits.
- Preserve generous whitespace and readable line lengths.
- Scene Studio uses a multi-panel editor with a dominant viewport.
- Navigation remains visible and uncluttered.

### Tablet

- Reflow editorial layouts rather than simply scaling them.
- Reduce simultaneous panel visibility in Scene Studio.
- Use collapsible or contextual property panels.
- Preserve touch-friendly controls.

### Mobile

- Single-column reading and browsing where appropriate.
- Navigation becomes a compact menu.
- Experiment controls stack logically.
- Avoid hover-only information.
- Scene Studio uses a simplified layout and supported editing scope.
- Respect safe areas and touch target sizing.

Responsive breakpoints and exact layout measurements will be specified in Phase 04 design tokens and implementation specs, not guessed prematurely here.

## 9. Accessibility requirements

- Semantic landmarks and heading hierarchy.
- Keyboard-accessible navigation, dialogs, menus, and controls.
- Visible focus indicators.
- Labels and instructions for all form fields.
- Accessible names for icon-only buttons.
- Sufficient text and control contrast.
- No color-only status communication.
- Reduced-motion support.
- Canvas experiences must have explanatory text and accessible surrounding controls.
- Avoid trapping keyboard users in WebGL experiences.
- Touch targets must be comfortably usable.
- Errors must be associated with the relevant input or action.

## 10. Content and interaction rules

- Do not invent projects, testimonials, ratings, usage statistics, or credentials.
- Do not display a control until its action is implemented.
- Do not claim a scene is saved until persistence is confirmed.
- Do not require authentication for public experiments and case studies.
- Do not expose private scene content.
- Avoid unnecessary modals; use inline contextual feedback when possible.
- Keep copy concise and specific.
- Do not use animation to conceal slow loading or missing content.

## 11. MVP scope boundaries

Included:
- Public discovery and project pages.
- Experiment browsing and individual experiment experiences.
- Motion Lab as a curated motion-focused destination.
- Authentication for Scene Studio.
- Private cloud-backed scene creation, retrieval, and saving.
- Basic account settings.

Deferred:
- Public scene sharing.
- Community submissions and comments.
- Multiplayer and collaboration.
- Marketplace and monetization.
- Advanced professional 3D modeling.
- Native mobile apps.
- Complex social profiles and follower systems.

## 12. Phase 03 acceptance criteria

Phase 03 is ready for approval when the product owner agrees that:

1. The sitemap and route responsibilities represent the intended product.
2. Public discovery is separated clearly from authenticated creation.
3. Global navigation works across desktop and mobile.
4. Home, Playground, Motion Lab, Archive, About, and Scene Studio have clear responsibilities.
5. The Scene Studio entry, authentication, editing, and cloud-save journeys are coherent.
6. Loading, empty, error, saving, and unsupported-device states are accounted for.
7. Accessibility and responsive requirements are explicit.
8. MVP boundaries and deferred features are respected.

**Phase 03 status: Proposed. Awaiting product-owner approval.**

On approval, Phase 04 will translate this UX structure and the approved brand guidelines into a visual design system: design tokens, grids, spacing, typography scales, component behavior, and page-level visual specifications.
