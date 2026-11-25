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

FORMA's creative premise is **Matter in Motion**: nothing is finished; everything is becoming. Its visual language is built from four primitives — Matter (the specimen), Force (the condition acting on it), Trace (the evidence of transformation), and Notation (the intelligence that makes an experiment legible).

Its signature device is **the Afterform**: an intentional trace of a previous or possible state, expressed as an offset contour, displaced duplicate, motion path, registration mark, or layered silhouette. The palette combines Studio Bone, Carbon Ink, Acid Voltage, Signal Vermilion, Electric Iris, and Soft Matter. Each feature has its own composition and personality while sharing this visual grammar.

The guiding principle is simple: **make every interaction change something real.** See [Creative DNA](docs/CREATIVE_DNA.md) for the working identity system.

## Technical architecture

- Next.js App Router and TypeScript
- Three.js and React Three Fiber for spatial work
- GSAP and ScrollTrigger for orchestration
- CSS Modules and design tokens for the interface
- Supabase for authenticated cloud features
- Vercel for deployment

## Project status

FORMA is undergoing a creative re-foundation. The Identity Renaissance is being developed in review branches and has not been merged into `main`. The Creative DNA is a working foundation for owner review; visual implementation and browser/device validation follow after the identity direction is accepted.

See [Project Status](PROJECT_STATUS.md), [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md), [Security Threat Model](docs/SECURITY_THREAT_MODEL.md), and [Brand Guidelines](docs/BRAND_GUIDELINES.md), and [Creative DNA](docs/CREATIVE_DNA.md).

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
