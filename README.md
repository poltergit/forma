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

Phases 01–06 are approved for progression. Phase 07 — Landing Page & Immersive Experience is in progress on `phase-07/immersive-experience`. The foundation includes a committed npm lockfile and owner-reported successful local checks; Node 22 clean-install validation, CI, and manual rendered/accessibility review remain follow-up tasks. See [Project Status](PROJECT_STATUS.md), [Phase 06 Review](docs/PHASE_06_REVIEW.md), and [Phase 07 Plan](docs/PHASE_07_IMMERSIVE_EXPERIENCE_PLAN.md).

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
