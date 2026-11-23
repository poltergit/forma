# FORMA — Phase 06 Frontend Foundation Plan

**Version:** 0.3  
**Phase:** 06 — Frontend Foundation  
**Status:** Approved for progression by product owner on 2026-11-21  
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
- Vitest, React Testing Library, Playwright, and axe-core provide the planned test layers; browser coverage includes automated accessibility and viewport overflow checks.
- Reduced-motion, keyboard, touch, responsive behavior, and graceful WebGL fallback are baseline requirements.

## 3. Out of scope

- Final cinematic Home experience.
- Finished Playground and Motion Lab content.
- Real Scene Studio editor and collaboration UI.
- Production Supabase migrations or real user data.
- Public sharing, billing, teams, chat, or arbitrary user code execution.
- Fake/demo authentication that could be mistaken for a real account system.

## 4. Implementation sequence and current state

1. **Initial bootstrap — committed.** Next.js 16.4.6, React 19-compatible manifest, TypeScript strict configuration, App Router, core scripts, and npm lockfile are committed.
2. **Token and visual foundation — source committed.** Canonical token import, font loading, global reset, focus styles, reduced motion, responsive shell, and a restrained foundation home route.
3. **Route shell — source committed.** Header/footer, metadata, loading, route error, global error, and not-found states.
4. **Environment and Supabase boundaries — source committed.** Separate browser/server factories and explicit missing configuration. Session refresh boundary still needs implementation and validation against the installed Next.js version.
5. **Zod and Zustand conventions — initial examples committed.** Scene vector/color validation, public environment validation, and editor panel UI state. Starter unit tests cover these boundaries.
6. **Test tooling — committed and owner-tested locally.** Vitest and Playwright configuration; owner reports 8 unit tests and 6 browser tests passed.
7. **CI — follow-up.** Add a workflow using the committed lockfile and supported Node 22 runtime.
8. **Local verification — owner-reported successful.** ESLint, TypeScript, 8 Vitest tests, 6 Playwright tests, and production build passed according to the product owner. Supported-runtime, CI, and manual visual/accessibility review remain follow-up.
9. **Owner review — approved for progression.** Product owner directed the project to proceed to Phase 07 on 2026-11-21.

## 5. Acceptance criteria

- [x] npm lockfile committed; clean supported-runtime `npm ci` remains a follow-up.
- [x] Initial strict TypeScript project configuration committed (typecheck not yet run).
- [x] App Router root, not-found, route error, global error, and loading source files committed (runtime not yet verified).
- [x] Tokens load from the canonical design token source (build not yet verified).
- [x] Responsive shell source and mobile breakpoints committed (rendered inspection pending).
- [x] Keyboard focus and reduced-motion baseline committed (manual validation pending).
- [x] Supabase browser/server modules separated; no service-role key in browser code.
- [x] Missing Supabase credentials are explicit rather than silently mocked.
- [x] Initial unit and browser test configuration plus representative tests committed (not yet run).
- [x] Next.js 16 `proxy.ts` session refresh boundary committed (runtime validation pending).
- [x] Owner reports ESLint, TypeScript, 8 unit tests, 6 Playwright tests, and production build passed.
- [ ] CI reports the same checks using the committed lockfile.
- [ ] Rendered desktop/tablet/mobile review completed without horizontal overflow.
- [x] Product owner approved progression to Phase 07 on 2026-11-21.

## 6. Verification constraints

The product owner reported successful local verification and committed the generated lockfile. These results were not independently rerun in this environment. Local installation used Node.js 26.12.1 with `--engine-strict=false`, while the package declares `>=20.9.0 <23`. A clean Node 22 `npm ci`, CI execution, rendered responsive review, and assistive-technology review remain follow-up requirements. The owner nevertheless explicitly approved progression to Phase 07; see [Phase 06 Review](PHASE_06_REVIEW.md).

## 7. Implementation notes

- Verify package compatibility at install time rather than assuming semver ranges resolve as expected.
- Keep the token source canonical; avoid a second divergent palette.
- Avoid loading Three.js on routes that do not need it.
- Do not import browser-only libraries from Server Components.
- Use dynamic import and explicit loading/fallback states for WebGL experiences.
- Do not report Supabase behavior as verified until tested against the isolated project.
