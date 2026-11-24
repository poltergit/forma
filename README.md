# FORMA

**Form is a verb.**

FORMA is an independent digital atelier: a creative instrument for shaping ideas through geometry, motion, typography, and digital space. It is a place to experiment, change the conditions, and discover forms that did not exist before.

FORMA is not a template library or a conventional SaaS dashboard with decorative 3D. It is an evolving workbench and exhibition for creative technology.

## The atelier

- **Open Studies** — a curated entry into generative geometry, motion systems, and kinetic typography.
- **Live Instrument** — a parameter-driven 3D study where energy, rhythm, fragments, and seed reshape the composition.
- **Playground** — a collection of interactive experiments and visual systems.
- **Motion Lab** — an instrument for exploring timing, easing, trajectories, and motion recipes.
- **Scene Studio** — a focused 3D creation environment with cloud persistence and invite-only collaboration.
- **Archive** — a home for saved specimens, experiments, and creative work.

## Creative direction

The new FORMA identity is editorial, tactile, and experimental: warm paper, near-black ink, signal coral, electric blue, and acid chartreuse. Large typographic gestures establish the voice; generative forms bring it into three dimensions; controls make the work respond.

The guiding principle is simple: **make every interaction change something real.**

## Technical architecture

- Next.js App Router and TypeScript
- Three.js and React Three Fiber for spatial work
- GSAP and ScrollTrigger for orchestration
- CSS Modules and design tokens for the interface
- Supabase for authenticated cloud features
- Vercel for deployment

## Project status

FORMA is undergoing a creative re-foundation. The homepage has been reimagined around the digital atelier concept and a new visual language. The Playground, Motion Lab, and Scene Studio remain active product surfaces and are being brought into the new direction in subsequent passes. The redesign is published to `main`; automated validation and owner-led visual review are still required before the new direction is considered approved.

See [Project Status](PROJECT_STATUS.md), [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md), [Security Threat Model](docs/SECURITY_THREAT_MODEL.md), and [Brand Guidelines](docs/BRAND_GUIDELINES.md).

## Run locally

Requirements: Node.js 20.9 or newer and lower than 23 (Node 22 recommended).

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Supabase is optional for the public landing experience. To use Supabase-backed features, set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`. Never put a service-role key in a browser environment.

## Principles

- Experience over decoration.
- Originality over templates.
- Generative systems with authored rules and user control.
- Interaction that changes the artifact, not just the interface.
- Purposeful motion with reduced-motion alternatives.
- Accessibility, performance, and security are product requirements.
- Small, verifiable milestones over oversized implementation bursts.

## License

Not yet selected. All rights reserved unless a license is added to this repository.
