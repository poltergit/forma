# FORMA — Phase 06 Frontend Foundation Plan

**Version:** 0.1  
**Phase:** 06 — Frontend Foundation  
**Status:** In progress  
**Entry gate:** Phase 05 approved by product owner on 2026-11-21.

## 1. Objective

Turn the approved architecture and Phase 04 design system into a maintainable, accessible, production-oriented Next.js application foundation. This phase builds the engineering skeleton and shared systems; it does not yet deliver the finished Home experience, Playground, Motion Lab, or Scene Studio.

## 2. Foundation scope

### Application bootstrap
- Next.js App Router with TypeScript and strict compiler settings.
- App directory, root layout, global stylesheet, metadata, error/not-found/loading boundaries.
- Local development, production build, lint, typecheck, and test scripts.
- Commit a lockfile and exact dependency versions selected from compatible stable releases at implementation time.
- Typed environment validation and safe .env.example; never commit secrets.

### Design system integration
- Import the existing design/tokens.css as the canonical token source.
- Add semantic CSS Modules conventions and a small shared primitive layer only where it removes repeated behavior.
- Load Space Grotesk, Inter, and JetBrains Mono with a production-safe font strategy; verify licensing, delivery, and layout stability.
- Establish responsive containers, focus-visible styles, reduced-motion utilities, surface primitives, and accessible button/link/form foundations.
- Avoid building a generic component library or prematurely abstracting page-specific art direction.

### Application structure
- src/app/ — App Router routes, layouts, metadata, error boundaries.
- src/components/ui/ — small accessible shared primitives.
- src/components/shell/ — navigation and global experience shell.
- src/features/ — domain-owned feature modules.
- src/lib/env/ — typed environment validation.
- src/lib/utils/ — pure shared utilities.
- src/styles/ — global styles and CSS foundations.
- src/types/ — shared app-level types only when cross-feature reuse is real.
- tests/ — unit, component, and browser test organization.

### Runtime and quality boundaries
- Server Components by default; Client Components only for real interaction, browser APIs, canvas, or local state.
- Keep Three.js/React Three Fiber behind client-only feature boundaries and lazy-load expensive scenes.
- No service-role secret in browser bundles.
- Supabase browser/server clients are separate modules; missing credentials must be an explicit configuration state, never a fake connected state.
- Zod validates external input at trust boundaries; TypeScript types alone are not runtime validation.
- Zustand stores are scoped to client interaction state, not a substitute for server authorization or durable persistence.
- Vitest, React Testing Library, Playwright, and axe-core provide the planned test layers.
- Reduced-motion, keyboard, touch, responsive behavior, and graceful WebGL fallback are baseline requirements.

## 3. Out of scope
- Final cinematic Home experience.
- Finished Playground and Motion Lab content.
- Real Scene Studio editor and collaboration UI.
- Production Supabase migrations or real user data.
- Public sharing, billing, teams, chat, or arbitrary user code execution.
- Fake/demo authentication that could be mistaken for a real account system.

## 4. Implementation sequence
1. Confirm compatible stable framework/runtime versions and commit package manifest plus lockfile.
2. Bootstrap strict TypeScript Next.js App Router application and baseline scripts.
3. Integrate canonical design tokens, fonts, global styles, and responsive primitives.
4. Add route shell, navigation foundation, metadata, loading/error/not-found boundaries.
5. Add typed environment validation and Supabase SSR/browser client boundaries without requiring live credentials for a static build.
6. Add Zustand and Zod conventions with a small real example, not empty abstraction layers.
7. Add Vitest, Testing Library, Playwright, and axe-core configuration.
8. Add CI workflow and verify lint, typecheck, tests, and production build in the actual repository runtime.
9. Review architecture, accessibility, performance, and mobile behavior before Phase 06 approval.

## 5. Acceptance criteria
- [ ] Reproducible install from committed lockfile.
- [ ] Strict TypeScript check passes.
- [ ] Production build succeeds without secrets for public routes.
- [ ] App Router root, not-found, error, and loading states work.
- [ ] Tokens load from the canonical design token source.
- [ ] Responsive shell works at desktop, tablet, and mobile widths without horizontal overflow.
- [ ] Keyboard focus and reduced-motion behavior are usable.
- [ ] Client/server module boundaries are enforced; no privileged key enters a client bundle.
- [ ] Supabase clients are typed and isolated; missing credentials are explicit.
- [ ] Unit/component/browser/accessibility tooling is configured and representative checks run.
- [ ] CI reports the same checks as local development.
- [ ] Product owner reviews and approves Phase 06 before Phase 07.

## 6. Implementation notes
- Verify current framework and package compatibility rather than blindly copying old version pins.
- Keep the token source canonical; avoid a second divergent palette.
- Avoid loading Three.js on routes that do not need it.
- Do not import browser-only libraries from Server Components.
- Use dynamic import and explicit loading/fallback states for WebGL experiences.
- Do not report Supabase behavior as verified until tested against the isolated project.
- Do not claim CI, browser, accessibility, or performance checks until their actual outputs are inspected.
