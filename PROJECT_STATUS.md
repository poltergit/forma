# FORMA — Project Status

**Last updated:** 2026-11-21

## Current position

- Phase 01 — Product Discovery and Definition: **Approved**
- Phase 02 — Brand Identity and Creative Direction: **Approved**
- Phase 03 — UX and Information Architecture: **Approved**
- Phase 04 — Visual Design System: **Approved**
- Phase 05 — Technical Architecture: **Approved by product owner (2026-11-21)**
- Phase 06 — Frontend Foundation: **Approved for progression by product owner (2026-11-21)**
- Phase 07 — Landing Page and Immersive Experience: **Approved by product owner (2026-11-21)**
- Phase 08 — Playground and Motion Lab: **In progress**
- Current implementation branch: [phase-08/playground-motion-lab](https://github.com/poltergit/forma/tree/phase-08/playground-motion-lab)
- Production application: **Foundation scaffold and lockfile committed; owner-reported local checks passed. Not deployed.**

## Approved decisions

- FORMA — Interactive Digital Playground / Creative Technology Platform.
- Tagline: Where form meets function.
- Web-first and responsive; free-tier infrastructure wherever practical.
- Scene Studio cloud persistence, accounts, and invite-only real-time collaboration.
- Collaboration roles: owner, editor, viewer.
- Approved core stack and supporting recommendations: D-014.
- Spatial/generative/performative direction: D-015.
- Ambitious generative first-release scope: D-016.
- Real-time collaboration in Scene Studio MVP: D-017.
- Phase 05 owner approval and Phase 06 authorization: D-018.
- Phase 06 owner approval and Phase 07 authorization: D-019.
- Cross-product creative experience mandate: D-020.
- Orbit-centered FORMA identity: D-022.
- GSAP motion choreography layer: D-023.
- Curated 3D runtime policy: D-024.
- Phase 07 approval and Phase 08 authorization: D-021.

## Phase summaries

### Phases 01–03 — Approved

See [Product Requirements](docs/PRODUCT_REQUIREMENTS.md), [Brand Guidelines](docs/BRAND_GUIDELINES.md), and [UX Specification](docs/UX_SPECIFICATION.md).

### Phase 04 — Approved

Seven standalone visual/interaction prototypes and the design token source are committed. Source-level checks were completed; no browser rendering, assistive-technology, or direct reference-site validation is claimed. See [Phase 04 Review](docs/PHASE_04_REVIEW.md).

### Phase 05 — Approved by owner

The architecture, collaboration contracts, proposed schema/RLS/RPC migrations, invitation design, Realtime authorization/recovery, and security model are documented. The SQL has not been applied or executed. Provider-specific migration/RLS/RPC execution, invitation delivery, Realtime revocation/recovery, quotas, backups, and deployment checks remain implementation/release requirements. See [Phase 05 Review](docs/PHASE_05_REVIEW.md).

### Phase 06 — Approved for progression by owner

The foundation branch contains the Next.js App Router/TypeScript scaffold, canonical token integration, responsive shell, route states, font loading, Supabase client boundaries, Zod validation, Zustand UI state, and test tooling. The npm lockfile is committed.

The owner reported successful local ESLint, TypeScript, eight Vitest tests, six Playwright tests, and production build. These results are owner-reported and were not independently re-run here. The local install used Node 26 with `--engine-strict=false`, outside the declared Node range. A clean Node 22 `npm ci`, CI workflow, rendered responsive review, and assistive-technology review remain follow-up validation. See [Phase 06 Review](docs/PHASE_06_REVIEW.md).

### Phase 07 — Approved by product owner

The [Phase 07 branch](https://github.com/poltergit/forma/tree/phase-07/immersive-experience) begins the cinematic landing-page and immersive experience work. The plan defines a four-act narrative, original spatial hero, meaningful interaction, scroll-linked storytelling, responsive art direction, reduced-motion and WebGL fallbacks, and performance/accessibility requirements. The owner confirmed validation succeeded and approved progression to Phase 08. The exact command output was not supplied and checks were not independently rerun here; this approval does not assert independent performance benchmarking or deployment. See [Phase 07 Review](docs/PHASE_07_REVIEW.md) and [Phase 07 Plan](docs/PHASE_07_IMMERSIVE_EXPERIENCE_PLAN.md).

### Phase 08 — In progress

The [Phase 08 branch](https://github.com/poltergit/forma/tree/phase-08/playground-motion-lab) now contains the first expanded feature slice:
- Playground with a deterministic, pointer/keyboard-responsive Displacement Field.
- A filterable editorial experiment index and a separate Elastic Matter typography study.
- Motion Lab with four behaviors, duration/intensity/easing controls, scrub/freeze timeline, response-curve visualization, presets, and Zod-validated copyable JSON recipes.
- Home hero pointer/touch-responsive sculpture with reduced-motion handling.
- Playwright and unit-test coverage for feature interactions, direct anchors/history, reduced motion, and required responsive widths.

These files and tests are committed to the branch, but this latest Phase 08 slice has **not** been run through lint, typecheck, unit tests, Playwright, or production build in this environment. Browser rendering, screen-reader review, and performance measurement remain open. See [Phase 08 Plan](docs/PHASE_08_PLAYGROUND_MOTION_LAB_PLAN.md) and [Phase 08 Implementation Log](docs/PHASE_08_IMPLEMENTATION_LOG.md).

## Project constraints

- Small, reviewable milestones; no unverified claims about tests, builds, deployment, or commits.
- Accessibility, performance, security, reduced motion, and WebGL fallbacks are mandatory.
- Collaboration remains private and role-based; no public rooms in MVP.
- No arbitrary user code execution in generative features.
- Avoid AI slop, fake functionality, generic templates, and meaningless decorative complexity.
- Apply the product-wide creative mandate (D-020): memorable, dimensional, generative, performative experiences with controlled chaos and clear usability.
- Explicit owner approval required before phase advancement.

## Known limitations

- Node 22 clean-install validation, CI, and manual rendered/assistive-technology review remain open Phase 06 follow-ups.
- No Supabase project or Vercel deployment has been configured.
- Proposed SQL, RLS, RPC, invitation, and Realtime behavior have not been applied or tested.
- Provider quotas, email delivery, backup/restore, and preview/production isolation remain to be verified.
- Trademark, domain, and social-handle availability have not been checked.
- Supabase provider setup and policy validation remain outstanding; Phase 08 must not imply cloud artifact persistence is operational.

### Creative refoundation — orbit identity and motion stack (2026-11-23)

The owner approved an orbit-centered Home identity: the FORMA core is central, surrounded by meaningful orbiting specimens for Form, Motion, Type, Space, and generative Field. The orbit evolves through a chapter narrative and offers real selection/recomposition interactions. The supplied Otsuka screenshots are used as structural/atmospheric inspiration only; FORMA keeps its own identity.

GSAP is approved as the primary motion orchestration layer, with @gsap/react integration and ScrollTrigger for progressive chapter choreography. Three.js + React Three Fiber remain the 3D rendering core; Drei is selective. Post-processing, physics, and Theatre.js remain feature-gated candidates, not approved blanket dependencies.

**Not yet implemented:** GSAP and R3F runtime packages are not yet installed on this branch. Package manifest and lockfile must be updated together after compatibility verification. The existing Home page still uses the previous editorial/CSS-cuboid implementation until the new orbital scene is built. The React use() console warning remains an open investigation. Phase 08 remains in progress and unapproved.
