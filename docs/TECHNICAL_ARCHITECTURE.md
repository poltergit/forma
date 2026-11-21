# FORMA — Technical Architecture Proposal

**Version:** 0.2  
**Phase:** 05 — Technical Architecture  
**Status:** Core stack approved; supporting architecture details under review  
**Prerequisites:** Phases 01–04 approved  
**Implementation status:** Not started

---

## 1. Architecture goals

FORMA combines a public creative-technology experience with a real interactive product. It must support expressive spatial storytelling, generative 2D/3D experiments, a constrained 3D editor, private cloud-saved scenes, and a small-team maintenance model. The architecture must preserve indexable content, progressive enhancement, accessibility, and free-tier-conscious infrastructure.

FORMA is not to be architected as a generic SaaS dashboard with a 3D hero attached. Its spatial and generative ambition is a product requirement; see [Experiential Direction](EXPERIENCE_DIRECTION.md).

Avoid premature microservices, unnecessary abstractions, and features outside the approved MVP.

## 2. Approved stack and supporting recommendations

| Layer | Decision / recommendation | Responsibility |
|---|---|---|
| Web application | **Approved:** Next.js App Router + React + TypeScript | Public routes, application shell, server rendering |
| Styling | **Approved:** CSS design tokens + CSS Modules | Custom art direction and semantic design system |
| 3D | **Approved:** Three.js through React Three Fiber | Spatial experiences and Scene Studio viewport |
| 3D helpers | Drei, selectively | Camera, controls, and common scene helpers |
| Editor state | Zustand, recommended | Selection, transforms, tools, undo/redo, transient editor state |
| Server/cache state | Start with server components/actions and focused fetches; add TanStack Query only if justified | Scene queries, mutations, invalidation |
| Validation | Zod, recommended | Runtime validation of forms, API inputs, and scene/generative documents |
| Backend | **Approved:** Supabase | PostgreSQL, Auth, RLS, and object storage when needed |
| Tests | Vitest, React Testing Library, Playwright, axe-core, recommended | Unit, component, browser, and accessibility testing |
| Hosting | **Approved:** Vercel | Next.js previews and production hosting |

The six core technology choices are approved (D-014). Supporting library recommendations are not yet approved. Use stable compatible releases at implementation time; do not freeze package versions in this proposal.

## 3. System topology

Start with one deployable web application and one managed backend project. Do not split the MVP into microservices.

```text
Visitor / User
      |
      v
Next.js Web Application
  |-- Public editorial and experience routes
  |-- Interactive experiment runtime
  |-- Generative and motion studies
  |-- Authenticated Scene Studio
  |-- Account surfaces
  |
  |-- Server route handlers / server actions
  |-- Typed validation and authorization boundary
      |
      v
Supabase
  |-- Auth
  |-- PostgreSQL
  |-- Row Level Security
  |-- Storage (only for binary assets when needed)
```

### Trust boundaries

- The browser is untrusted.
- Browser-exposed environment variables may contain only public configuration, such as the Supabase URL and publishable/anon key.
- Service-role secrets must never enter client bundles, browser storage, or the repository.
- Enforce authorization with PostgreSQL RLS and server-side checks where applicable. Hiding a control is not authorization.
- Validate scene documents and user-controlled generative parameters before persistence and after loading.

## 4. Rendering and route strategy

Render editorial content on the server or statically where appropriate. Hydrate only interactive regions. Load WebGL dependencies only for experiences that need them.

| Route | Rendering approach | Access |
|---|---|---|
| `/` | Server-rendered editorial shell; optional client-only spatial hero | Public |
| `/playground` | Server-rendered gallery and metadata | Public |
| `/playground/[slug]` | Server-rendered context + isolated client experiment stage | Public |
| `/motion-lab` | Server shell + client generative/motion workspace | Public |
| `/archive` | Server-rendered archive | Public |
| `/archive/[slug]` | Server-rendered case study + optional spatial presentation | Public |
| `/about` | Server-rendered editorial content + optional progressive spatial elements | Public |
| `/auth/sign-in`, `/auth/sign-up` | Server shell + client form behavior | Public |
| `/scene-studio` | Auth-aware route; editor and viewport loaded client-side | Public entry; edit/save requires sign-in |
| `/account` | Authenticated route | Authenticated |

Keep page titles, navigation, and essential content usable if WebGL fails or is unavailable. Provide loading, empty, error, and not-found states. Preserve intended destinations through authentication. Public experiments and case studies must not require an account.

## 5. Proposed code organization

Use one application repository. Organize by feature and shared responsibility. Create directories as implementation needs them; this is a target, not a mandate to scaffold everything at once.

```text
forma/
├── app/
│   ├── (public)/
│   ├── (auth)/
│   ├── scene-studio/
│   ├── account/
│   ├── api/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── layout/
│   ├── navigation/
│   ├── feedback/
│   └── ui/
├── features/
│   ├── experience/           # Spatial home composition
│   ├── playground/           # Experiment registry and stages
│   ├── generative/           # Shared seeded utilities, not a monolithic engine
│   ├── motion-lab/
│   ├── scene-studio/
│   │   ├── components/
│   │   ├── editor/
│   │   ├── renderer/
│   │   ├── document/
│   │   ├── state/
│   │   └── validation/
│   ├── archive/
│   └── account/
├── lib/
│   ├── supabase/
│   ├── auth/
│   ├── validation/
│   └── utilities/
├── types/
├── public/
├── design/
│   └── tokens.css
├── docs/
└── tests/
```

Keep route files thin. Put product behavior in feature modules. Keep experiment-specific rendering isolated so one experiment's dependencies or failures do not contaminate the entire site. Shared components should emerge from genuinely repeated patterns.

## 6. Spatial and generative runtime

The runtime should support expressive experiments without becoming an over-engineered general-purpose game engine.

### Responsibilities

1. **Experience composition:** page-level choreography and spatial elements, isolated from essential document structure.
2. **Experiment stage:** a bounded runtime for one active interactive study at a time.
3. **Generative systems:** deterministic seeded functions and explicit parameter schemas.
4. **Rendering layer:** React Three Fiber for spatial work; CSS/SVG/canvas for simpler 2D motion where more appropriate.
5. **Interaction layer:** pointer, touch, keyboard, and scroll inputs mapped to explicit state changes.
6. **Fallback layer:** static preview and meaningful text/control alternatives when WebGL is unavailable or motion is reduced.

### Generative artifact contract

When a generative output is saved, store enough information to reproduce it:
- generator identifier and version;
- seed;
- validated parameter object;
- document/schema version;
- optional output metadata or thumbnail reference.

Do not store runtime objects, GPU resources, functions, or arbitrary executable code. Never execute user-supplied code as part of a saved generator document. Treat all saved parameters as untrusted input.

### Runtime isolation

- Load Three.js only in the client-side feature that needs it.
- Keep the initial Home route's critical text and navigation independent of WebGL.
- Avoid mounting multiple heavyweight scenes concurrently.
- Pause or lower render activity when a stage is hidden or off-screen.
- Bound object counts, geometry complexity, texture sizes, and post-processing.
- Dispose of geometries, materials, textures, render targets, and listeners.
- Provide a stable fallback when WebGL context creation fails or the context is lost.
- Use CSS transforms for simple interface movement; reserve WebGL for spatial or generative work that benefits from it.

## 7. Scene Studio architecture

Keep the editor's responsibilities separate:

1. **Viewport:** React Three Fiber canvas, camera, lights, grid, object rendering, selection visualization.
2. **Scene document:** serializable representation of objects, transforms, materials, and supported settings.
3. **Editor state:** selection, active tool, panel state, transient transform interactions, undo/redo.
4. **Inspector:** validated edits to selected object properties.
5. **Persistence:** load, create, save, rename, and delete operations for the authenticated owner.
6. **Export:** scene export and image capture, with explicit capability boundaries.

The renderer is not the database. Never persist Three.js runtime objects, functions, GPU resources, or arbitrary class instances. Serialize the editor into a versioned plain JSON document.

### Initial document shape (illustrative)

```ts
type SceneDocument = {
  schemaVersion: number;
  settings: { background: string; gridVisible: boolean };
  objects: Array<{
    id: string;
    type: "box" | "sphere" | "plane";
    name: string;
    visible: boolean;
    transform: {
      position: [number, number, number];
      rotation: [number, number, number];
      scale: [number, number, number];
    };
    material: { color: string };
  }>;
};
```

Constrain the first version to the approved MVP. Add geometry, materials, lights, cameras, and assets through explicit schema evolution.

### Editing, history, and saving

- Keep pointer movement and drag previews transient.
- Commit meaningful changes as discrete editor commands.
- Use reversible commands or bounded snapshots for undo/redo; never persist every pointer-move event.
- Debounce cloud saves after meaningful changes and show a clear save state.
- Provide a manual save action and unsaved-changes indicator.
- Prevent an older in-flight save from overwriting a newer revision.
- Preserve the local working document and communicate failures when offline or when saving fails.
- No collaboration or multi-user editing in the MVP.

## 8. Persistence model and authorization

Use PostgreSQL for structured scene records. Keep the first schema small. See [Scene Studio Data Model](SCENE_STUDIO_DATA_MODEL.md) for the proposed `scenes` table, versioned document, RLS policies, validation constraints, and revision-aware save protocol.

Authorization requirements:
- Enable RLS.
- A user may select, insert, update, and delete only rows where `owner_id = auth.uid()`.
- Inserts must enforce the authenticated owner.
- Ordinary updates must not permit owner reassignment.
- Anonymous users receive no access to private scenes.
- Test every operation using at least two separate user identities.

Use object storage only for binary assets such as uploaded textures or thumbnails. Define private buckets and owner-scoped policies before enabling uploads. Do not add public sharing, teams, comments, or collaboration tables to the MVP.

## 9. Authentication and security

Use Supabase Auth for sign-up, sign-in, sign-out, and recovery. Use the supported server-side session/cookie integration for the selected Next.js version. Validate redirect destinations, protect private routes on the server, and enforce data access again with RLS.

- Never trust client-supplied owner IDs.
- Validate forms, API inputs, scene documents, and generator parameters at runtime.
- Apply strict bounds to object counts, serialized document sizes, numeric ranges, and uploaded files.
- Keep secrets in deployment environment settings; commit only placeholders in `.env.example`.
- Add rate limiting and abuse protection to sensitive endpoints where supported.
- Collect only personal data the product actually needs.

See [Authentication & Environment](AUTH_AND_ENVIRONMENT.md) for the proposed session flow and environment separation.

## 10. Data flows

**Public experience:** request → Next.js route → server-rendered editorial content → optional client enhancement. Essential information does not depend on a canvas.

**Generative experiment:** user input/seed → validated parameter state → deterministic generator → bounded renderer → interactive output → optional reproducible artifact save/export.

**Scene load:** authenticated user → server session validation → owner-scoped query → schema validation → editor hydration → viewport render.

**Scene save:** editor command → serialization → schema validation → authenticated mutation → RLS ownership check → database write → revision response → visible save status.

## 11. Performance and resilience

- Server-render public content and isolate interactive client regions.
- Dynamically load the 3D viewport and editor-only dependencies.
- Compress and correctly size images; lazy-load below-the-fold media.
- Avoid rendering expensive scenes while inactive or off-screen.
- Cap pixel ratio and provide quality fallbacks for weaker devices.
- Pause animation when the page is hidden; avoid unnecessary render loops.
- Dispose of GPU resources and listeners.
- Avoid expensive shader/post-processing effects as a default.
- Respect reduced-motion preferences and provide non-canvas alternatives for essential information.
- Preserve native scrolling; no scroll hijacking or forced cinematic waits.
- Measure route JavaScript, LCP, INP, CLS, and representative frame time.
- Establish numeric performance budgets after a real baseline is measured.

## 12. Testing strategy

| Layer | Tools | Coverage |
|---|---|---|
| Unit | Vitest | Serialization, seeded determinism, generator bounds, validation, editor commands |
| Component | React Testing Library | Forms, controls, navigation, loading/error states |
| Browser | Playwright | Public journeys, keyboard/touch flows, experiments, auth, editing and persistence |
| Security | RLS integration tests | Anonymous and cross-user isolation |
| Accessibility | axe-core + manual checks | Semantics, keyboard, focus, dialogs, contrast, announcements, reduced motion |
| Visual/device | Browser screenshots + manual review | Desktop/tablet/mobile, WebGL fallback, reduced-motion and low-power modes |
| 3D runtime | Manual profiling + targeted automated checks | Context loss, disposal, render loop, object/texture budgets, frame-time sampling |

Run browser and security tests against isolated configured environments. A passing unit suite does not establish deployment readiness. Do not claim device, WebGL, or accessibility validation without actually performing it.

## 13. Environments and deployment

Recommended environments:
- **Local:** local development and isolated test data.
- **Preview:** branch deployments using non-production backend resources.
- **Production:** protected deployment with production secrets and database.

Vercel is the approved hosting provider. Verify current plan quotas, build and bandwidth limits, environment controls, preview behavior, and production requirements before configuring deployment. Verify Supabase quotas, inactivity behavior, email constraints, backup/restore options, and commercial terms. Free tiers do not guarantee production SLAs. Maintain a database and scene-document export/migration path.

## 14. Observability and operations

MVP baseline:
- Structured server logs without secrets or sensitive scene contents.
- Error reporting for client/server exceptions and WebGL failures.
- Clear loading, empty, save, and failure states.
- Basic backend connectivity checks.
- Deployment and migration notes.
- Documented backup/export procedure before real user data is accepted.

Third-party analytics are not required for the first implementation.

## 15. Dependency policy

- Prefer stable releases compatible with selected React/Next.js versions.
- Pin dependencies through the package lockfile.
- Do not install libraries for trivial utilities.
- Isolate Three.js dependencies from public page bundles.
- Review maintenance, licensing, bundle cost, and security advisories before adoption.
- Re-check compatibility at implementation time.

## 16. Risks and mitigations

| Risk | Mitigation |
|---|---|
| 3D complexity expands scope | Bounded experiment stages, primitive budgets, explicit MVP schema |
| Heavy visual runtime harms performance | Lazy loading, quality tiers, visibility pause, measured budgets |
| Generative output becomes random noise | Authored rules, exposed parameters, deterministic seeds, curated presets |
| Motion harms accessibility | Native scroll, reduced-motion equivalents, keyboard/touch support |
| WebGL fails on a device | Static/2D fallback and non-canvas essential content |
| Cloud data exposure | RLS, server checks, cross-user tests |
| Save conflicts/data loss | Revision-aware writes, local working state, visible errors |
| Free-tier changes | Quota monitoring and export/migration plan |
| Design drift | Shared semantic tokens and page/experience specifications |
| Premature abstractions | One application, feature modules, no microservices |

## 17. Decisions requiring further review

### Approved (D-014 and D-015)
- Next.js App Router, TypeScript, Supabase, Three.js + React Three Fiber, Vercel, CSS tokens + CSS Modules.
- Experiential ambition: spatial, generative, performative, intentionally art-directed, and meaningfully interactive. See [Experiential Direction](EXPERIENCE_DIRECTION.md).

### Still proposed, not yet approved
- Zustand for editor-local state.
- Zod for runtime validation.
- Drei helpers where useful.
- TanStack Query only if client-side server-state caching proves necessary.
- Vitest, React Testing Library, Playwright, and axe-core.
- Exact Supabase Auth session integration and server/client data-access boundaries.
- Final environment topology and provider plan configuration.
- Exact boundaries and initial scope of the generative runtime.

### Phase 05 acceptance criteria

- Core stack and provider decisions recorded in `DECISIONS.md`.
- Route/rendering strategy approved.
- Application, experiment, generative, and feature boundaries approved.
- Scene document and persistence model reviewed.
- Authentication and authorization model approved.
- Environment, testing, performance, accessibility, and deployment strategy approved.
- Spatial/generative ambition translated into bounded MVP scope and validation criteria.
- MVP exclusions and migration assumptions understood.

**Current state:** Core stack approved (D-014). Experiential ambition captured (D-015). Detailed persistence, security, and authentication specifications prepared. Supporting architecture and Phase 05 acceptance review remain in progress. Phase 06 is not authorized.
