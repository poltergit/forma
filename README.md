# FORMA

**Where form meets function.**

FORMA is an interactive digital playground for design, motion, creative coding, generative systems, and 3D experiences.

It is both a personal creative-technology flagship and an independent product direction: a place to explore digital experiences, build interactive experiments, and demonstrate the craft behind them.

## Product pillars

- **Experience** — a spatial, expressive introduction to FORMA.
- **Playground** — a curated gallery of distinct interactive experiments.
- **Motion Lab** — generative visuals, motion systems, parameter-driven studies, and interactive effects.
- **Scene Studio** — a constrained but real 3D scene editor with authenticated cloud persistence and invite-only collaboration.
- **Archive** — projects, case studies, and technical explorations.
- **About** — the creator, philosophy, and contact.

## Creative direction

FORMA is intended to feel like a spatial, generative playground—not a conventional SaaS interface decorated with 3D. Its visual language combines controlled chaos, dimensional typography, authored geometry, meaningful interaction, scroll-linked storytelling, and generative systems.

- [Experiential Direction](docs/EXPERIENCE_DIRECTION.md)
- [Reference-led Art Direction & Motion Direction](docs/REFERENCE_LED_ART_DIRECTION.md)
- [Brand Guidelines](docs/BRAND_GUIDELINES.md)
- [Visual Design System](docs/VISUAL_DESIGN_SYSTEM.md)

## Technical architecture

- [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md)
- [Security Threat Model](docs/SECURITY_THREAT_MODEL.md)
- [Scene Command Engine](docs/SCENE_COMMAND_ENGINE.md)
- [Invitation & Membership Engine](docs/INVITATION_MEMBERSHIP_ENGINE.md)
- [Realtime Collaboration](docs/REALTIME_COLLABORATION.md)
- [Scene Studio Data Model](docs/SCENE_STUDIO_DATA_MODEL.md)
- [Authentication & Environment Specification](docs/AUTH_AND_ENVIRONMENT.md)
- [Phase 05 Validation Plan](docs/PHASE_05_VALIDATION_PLAN.md)

## Project status

Phases 01–07 are approved for progression. Phase 08 — Playground & Motion Lab is in progress on `phase-08/playground-motion-lab`. The current branch adds two distinct Playground studies, a filterable editorial index, a parameter-driven Motion Lab with scrub and reproducible JSON recipes, and pointer/touch-responsive Home artwork. New Phase 08 tests are coverage only; they have not yet been executed in this environment. Browser rendering, accessibility, and performance review remain open. See [Project Status](PROJECT_STATUS.md), [Experiential Direction](docs/EXPERIENCE_DIRECTION.md), [Phase 07 Review](docs/PHASE_07_REVIEW.md), and [Phase 08 Plan](docs/PHASE_08_PLAYGROUND_MOTION_LAB_PLAN.md).

## Run locally

Requirements: Node.js 20.9 or newer and lower than 23 (Node 22 recommended).

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Supabase is optional for the public landing experience. To use Supabase-backed features, set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`. Never put a service-role key in a browser environment.

## Design previews

The following standalone files are earlier design prototypes, not production features:

- [Home](design/prototypes/home-preview.html)
- [Playground](design/prototypes/playground-preview.html)
- [Motion Lab](design/prototypes/motion-lab-preview.html)
- [Scene Studio](design/prototypes/scene-studio-preview.html)
- [Archive](design/prototypes/archive-preview.html)
- [About](design/prototypes/about-preview.html)
- [Account](design/prototypes/account-preview.html)

The Scene Studio preview is not a real 3D engine, and the account preview is not connected to authentication.

## Principles

- Experience over decoration.
- Originality over templates.
- Controlled chaos over generic polish.
- Meaningful interaction over visual simulation.
- Generative systems with authored rules and user control.
- Purposeful motion over motion for its own sake.
- Accessibility, performance, and security are product requirements.
- Small, verifiable milestones over oversized implementation bursts.

## Development approach

FORMA is developed in gated phases. Each phase has a defined scope, deliverables, acceptance criteria, and review. No phase is considered complete until its output is inspected and approved.

## License

Not yet selected. All rights reserved unless a license is added to this repository.
