# FORMA — Project Status

**Last updated:** 2026-11-25

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

### Phase 08 — In progress; automated validation passed

The [Phase 08 branch](https://github.com/poltergit/forma/tree/phase-08/playground-motion-lab) contains the existing Playground and Motion Lab feature work plus a creative refoundation of Home:
- Playground with a deterministic, pointer/keyboard-responsive Displacement Field, editorial experiment index, and Elastic Matter typography study.
- Motion Lab with four behaviors, parameter controls, scrub/freeze timeline, easing visualization, presets, and copyable validated motion recipes.
- A five-chapter Home experience (Ignite, Disturb, Compose, Direct, Build) with a lazy-loaded React Three Fiber orbital scene.
- A central FORMA core and five meaningful orbit specimens (Form, Motion, Type, Space, Field), with pointer influence, selection, GSAP/ScrollTrigger choreography, and local deterministic recomposition controls.
- GSAP 3.15.1, @gsap/react 2.1.2, Three.js 0.187.0, React Three Fiber 9.8.2, and Drei 10.7.9 locked in the package manifest and lockfile.

Latest automated validation passed on Node 22: clean `npm ci`, lint, typecheck, 6 Vitest files / 17 tests, 30 Chromium Playwright tests including Home width checks, and optimized Next.js production build. The temporary validation workflow removed itself after success. See [the Actions run](https://github.com/poltergit/forma/actions/runs/45112076858), [Phase 08 Plan](docs/PHASE_08_PLAYGROUND_MOTION_LAB_PLAN.md), and [Phase 08 Implementation Log](docs/PHASE_08_IMPLEMENTATION_LOG.md).

**Not yet owner-approved:** real-device visual inspection, screen-reader/manual accessibility review, WebGL/static fallback review, performance profiling, investigation of the earlier React `use()` warning, and the new Three.js `THREE.Clock` deprecation warning remain open. Phase 08 remains in progress and unapproved.

### Generative instrument system and local recipes (2026-11-24)

Playground now exposes three allowlisted deterministic instruments: Displacement Field, Orbital Bloom, and Woven Lattice. Each has distinct point-generation and canvas-rendering logic, shares bounded density/influence/seed controls, and exports editable Scene Studio objects with generator ID/version and parameter provenance. Users can save, restore, and delete up to 24 named recipes in browser-local storage. Recipe storage is device/browser-local, not cloud-synced or cross-device.

The registry is explicit; no dynamic code execution, plugin loading, or database migration is involved. Automated tests cover distinct outputs, seed reproducibility, bounds, and Scene Studio export. Visual and real-device review remains outstanding.

### Playground → Scene Studio bridge (2026-11-24)

The Displacement Field now produces a reproducible, bounded scene document from its seed and controls. The Playground action hands that document to Scene Studio through a one-time browser-local handoff. Scene Studio validates it with the existing versioned scene parser, adds it to the active local/account-scoped library, and lets the existing autosave/cloud-sync path persist it when cloud auth is configured.

The bridge requires no database migration, executes no user-supplied code, and promises logical rather than pixel-identical reproducibility. Generator provenance is included in the handoff payload; Scene Studio currently imports the editable object document and ignores the extra provenance metadata.

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

The owner approved an orbit-centered Home identity: the FORMA core is central, surrounded by meaningful orbiting specimens for Form, Motion, Type, Space, and generative Field. The supplied Otsuka screenshots inform structure and atmosphere only; FORMA keeps its own brand and visual signature.

The first implementation is now committed: a five-chapter Home experience, lazy-loaded R3F orbital scene, five distinct specimen types, selectable territory controls, pointer/touch influence, parameter-driven recomposition, GSAP entrance choreography, and ScrollTrigger-linked scene progress. Existing Playground and Motion Lab routes remain intact.

The creative runtime was installed and peer-resolved on a Node 22 GitHub Actions runner; exact versions are locked in both package manifest and lockfile: GSAP 3.15.1, @gsap/react 2.1.2, Three.js 0.187.0, React Three Fiber 9.8.2, and Drei 10.7.9. The temporary bootstrap workflow removed itself after committing the dependency files.

**Still open:** application lint/typecheck/unit/Playwright/build verification, real browser visual inspection, WebGL fallback and mobile profiling, reduced-motion and assistive-technology review, and investigation of the reported React use() suspension warning. Phase 08 remains in progress and unapproved.


### Portable generative recipe engine (2026-11-24)

Playground now includes four curated remix presets and four named color systems (Atelier, Citrus, Nocturne, Mineral). Palette selection affects the live canvas and the exported Scene Studio object colors. Presets load a complete instrument/density/influence/palette starting point while leaving seed and pointer interaction editable.

Recipes can be exported as versioned `forma-playground-recipe` JSON files and imported on another device. Import validates format/version, generator and palette allowlists, field bounds, density/influence increments, name length, and a 16 KB input ceiling before applying values. The format carries only declarative settings; it cannot execute code. Local saved recipes remain device-local; portable JSON is the cross-device transfer mechanism. No cloud sync or migration was added.


### Playground temporal instrument (2026-11-25)

Added three explicit animation modes: Still, Drift, and Pulse. Motion uses bounded deterministic transforms derived from an elapsed-time phase; the selected mode is included in local and portable recipes, with older recipe files defaulting to Still. The canvas redraw loop is capped at approximately 30 FPS, pauses while the document is hidden, and respects the user's reduced-motion preference. Canvas backing dimensions are only reset when the measured size changes. Automated tests cover motion bounds, recipe round-trip, legacy defaults, and invalid mode rejection. Real-device performance and visual review remain outstanding.

### Playground Material Lab (2026-11-25)

Added six renderer-native surface treatments: Paper, Ink, Metal, Glass, Liquid, and Ceramic. Treatments use bounded Canvas 2D gradients, opacity, highlight, stroke, and deterministic low-alpha grain; they do not introduce WebGL or per-pixel shader work into the Playground. Material selection is saved in local recipes and portable JSON, with legacy recipes defaulting to Paper and unknown imported materials rejected. Scene Studio handoff remains an editable geometry export; the current scene schema does not claim to preserve Playground surface treatment. Device-level visual/performance review remains outstanding.
