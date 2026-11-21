# FORMA

**Where form meets function.**

FORMA is an interactive digital playground where design, motion, creative coding, generative systems, and 3D experiences come together.

It is both a personal creative-technology flagship and an independent product direction: a place to explore digital experiences, build interactive experiments, and demonstrate the craft behind them.

## Product pillars
- **Experience** — a spatial, expressive introduction to FORMA.
- **Playground** — a curated gallery of distinct interactive experiments.
- **Motion Lab** — generative visuals, motion systems, parameter-driven studies, and interactive effects.
- **Scene Studio** — a constrained but real 3D scene editor with authenticated cloud persistence.
- **Archive** — projects, case studies, and technical explorations.
- **About** — the creator, philosophy, and contact.

## Creative direction

FORMA's ambition is to feel like a spatial, generative playground—not a conventional SaaS interface with decorative 3D. Its visual language combines controlled chaos, dimensional typography, authored geometry, meaningful interaction, scroll-linked storytelling, and generative systems.

- [Experiential Direction](docs/EXPERIENCE_DIRECTION.md) — the creative ambition, 3D strategy, generative system, interaction vocabulary, scroll/motion guardrails, anti-patterns, and validation checklist.
- [Reference-led Art Direction & Motion Direction](docs/REFERENCE_LED_ART_DIRECTION.md) — FORM IN MOTION concept, motion grammar, scroll behavior, transitions, and page-specific art direction.

## Technical architecture

- [Security Threat Model](docs/SECURITY_THREAT_MODEL.md) — assets, trust boundaries, threats, mitigations, and release blockers.
- [Phase 05 Technical Validation Plan](docs/PHASE_05_VALIDATION_PLAN.md) — database, invitation, concurrency, Realtime, generative, and deployment test plan.
- [Scene Command Engine](docs/SCENE_COMMAND_ENGINE.md) — typed mutations, revision conflicts, idempotency, and collaboration UX states.\n- [Invitation & Membership Engine](docs/INVITATION_MEMBERSHIP_ENGINE.md) — hash-only invitation tokens, verified identity acceptance, revocation, and member removal.\n- [Draft Invitation & Membership RPC Migration](supabase/migrations/20261121000300_forma_invitation_membership_rpc.sql) — create, accept, revoke, and remove operations; not applied or tested.\n- [Real-Time Collaboration](docs/REALTIME_COLLABORATION.md) — proposed invite-only Scene Studio collaboration, roles, command ordering, presence, and recovery.
- [Database Migration Design Review](docs/DATABASE_MIGRATION_REVIEW.md) — review boundaries, privilege model, follow-up RPCs, and isolated validation sequence.
- [Draft Scene Command RPC Migration](supabase/migrations/20261121000200_forma_scene_command_rpc.sql) — atomic scene-editing RPC; not applied or tested.\n- [Draft Supabase Core Migration](supabase/migrations/20261121000100_forma_core_schema.sql) — schema/RLS baseline; not applied or tested.
- [Phase 05 Architecture Review](docs/PHASE_05_REVIEW.md) — supporting dependency recommendations, application boundaries, generative runtime scope, non-functional requirements, and approval checklist.

- [Phase 05 Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md) — approved core stack and system architecture, with remaining implementation details under review.
- [Generative Artifact Data Model](docs/GENERATIVE_ARTIFACT_MODEL.md) — proposed private, reproducible generator recipes, versioning, validation, and ownership policies.
- [Scene Studio Data Model & Security](docs/SCENE_STUDIO_DATA_MODEL.md) — proposed PostgreSQL migration, RLS policies, document contract, validation, and revision-aware saving.
- [Authentication & Environment Specification](docs/AUTH_AND_ENVIRONMENT.md) — proposed session flows, route access, environment separation, and deployment security.

## Project status
Phases 01–04 are approved. Phase 05 technical architecture is in progress; owner decisions are recorded and the database migration draft awaits isolated validation. See [PROJECT_STATUS.md](PROJECT_STATUS.md) and the [decision log](DECISIONS.md).

## Design previews
- [Home](design/prototypes/home-preview.html)
- [Playground](design/prototypes/playground-preview.html)
- [Motion Lab](design/prototypes/motion-lab-preview.html)
- [Scene Studio](design/prototypes/scene-studio-preview.html)
- [Archive](design/prototypes/archive-preview.html)
- [About](design/prototypes/about-preview.html)
- [Account](design/prototypes/account-preview.html)

These are standalone design/interaction prototypes. They are not production application features; the Scene Studio prototype is not a real 3D engine, and account forms are not connected to authentication.

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
FORMA is developed in gated phases. Each phase has a defined scope, deliverables, acceptance criteria, and review. No phase is considered complete until its output is inspected and approved. Design prototypes are kept separate from production application code.

## License
Not yet selected. All rights reserved unless a license is added to this repository.
