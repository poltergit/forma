# FORMA — Phase 06 Frontend Foundation Plan

**Version:** 0.2  
**Phase:** 06 — Frontend Foundation  
**Status:** In progress  
**Entry gate:** Phase 05 approved by product owner on 2026-11-21.  
**Implementation branch:** `phase-06/frontend-foundation`

## 1. Objective

Turn the approved architecture and Phase 04 design system into a maintainable, accessible, production-oriented Next.js application foundation. This phase builds the engineering skeleton and shared systems; it does not yet deliver the finished Home experience, Playground, Motion Lab, or Scene Studio.

## 2. Foundation scope

### Application bootstrap

- Next.js App Router with TypeScript and strict compiler settings.
- App directory, root layout, global stylesheet, metadata, error/not-found/loading boundaries.
- Local development, production build, lint, typecheck, and test scripts.
- Reproducible lockfile and exact dependency resolution.
- Typed environment validation and safe `.env.example`; never commit secrets.

### Design system integration

- Import the existing `design/tokens.css` as the canonical token source.
- Add semantic CSS Modules conventions and a small shared primitive layer only where it removes repeated behavior.
- Load Space Grotesk, Inter, and JetBrains Mono with a production-safe font strategy.
- Establish responsive containers, focus-visible styles, reduced-motion utilities, and accessible route states.
- Avoid building a generic component library or prematurely abstracting page-specific art direction.

### Application structure

- `src/app/` — App Router routes, layouts, metadata, error boundaries.
- `src/components/ui/` — small accessible shared primitives as needed.
- `src/components/shell/` — navigation and global experience shell.
- `src/features/` — domain-owned feature modules.
- `src/lib/env/` — typed environment validation.
- `src/lib/utils/` — pure shared utilities as needed.
- `src/styles/` — shared CSS foundations as needed.
- `tests/` — unit, component, and browser test organization.

### Runtime and quality boundaries

- Server Components by default; Client Components only for real interaction, browser APIs, canvas, or local state.
- Keep Three.js/React Three Fiber behind client-only feature boundaries and lazy-load expensive scenes.
- No service-role secret in browser bundles.
- Supabase browser/server clients are separate modules; missing credentials are an explicit configuration error, never a fake connected state.
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

## 4. Implementation sequence and current state

1. **Initial bootstrap — started.** Next.js 16.4.6, React 19-compatible manifest, TypeScript strict configuration, App Router, and core scripts committed. Dependency install and lockfile still pending.
2. **Token and visual foundation — source committed.** Canonical token import, font loading, global reset, focus styles, reduced motion, responsive shell, and a restrained foundation home route.
3. **Route shell — source committed.** Header/footer, metadata, loading, route error, global error, and not-found states.
4. **Environment and Supabase boundaries — source committed.** Separate browser/server factories and explicit missing configuration. Session refresh boundary still needs implementation and validation against the installed Next.js version.
5. **Zod and Zustand conventions — initial examples committed.** Scene vector/color validation, public environment validation, and editor panel UI state. Starter unit tests cover these boundaries.
6. **Test tooling — configuration and starter tests committed.** Vitest and Playwright configuration. Tests have not been executed.
7. **CI — pending.** Add after the lockfile exists so CI uses a reproducible install.
8. **Verification and responsive review — pending.** Install, lint, typecheck, tests, build, browser inspection, accessibility checks, and performance review.
9. **Owner review — pending.** Phase 06 remains in progress until explicit approval.

## 5. Acceptance criteria

- [ ] Reproducible install from committed lockfile.
- [x] Initial strict TypeScript project configuration committed (typecheck not yet run).
- [x] App Router root, not-found, route error, global error, and loading source files committed (runtime not yet verified).
- [x] Tokens load from the canonical design token source (build not yet verified).
- [x] Responsive shell source and mobile breakpoints committed (rendered inspection pending).
- [x] Keyboard focus and reduced-motion baseline committed (manual validation pending).
- [x] Supabase browser/server modules separated; no service-role key in browser code.
- [x] Missing Supabase credentials are explicit rather than silently mocked.
- [x] Initial unit and browser test configuration plus representative tests committed (not yet run).
- [x] Next.js 16 `proxy.ts` session refresh boundary committed (runtime validation pending).
- [ ] Lint, typecheck, unit tests, Playwright, and production build pass.
- [ ] CI reports the same checks using the committed lockfile.
- [ ] Rendered desktop/tablet/mobile review completed without horizontal overflow.
- [ ] Product owner reviews and approves Phase 06 before Phase 07.

## 6. Verification constraints

The GitHub connector can commit source files but this execution environment cannot reach GitHub or npm from a local shell. Therefore dependency installation, lockfile generation, automated checks, browser rendering, and CI execution are not claimed. These tasks must be completed in a network-enabled checkout before the phase can be presented as complete.

## 7. Implementation notes

- Verify package compatibility at install time rather than assuming semver ranges resolve as expected.
- Keep the token source canonical; avoid a second divergent palette.
- Avoid loading Three.js on routes that do not need it.
- Do not import browser-only libraries from Server Components.
- Use dynamic import and explicit loading/fallback states for WebGL experiences.
- Do not report Supabase behavior as verified until tested against the isolated project.
