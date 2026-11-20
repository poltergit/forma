# FORMA — Technical Architecture Proposal

**Version:** 0.1  
**Phase:** 05 — Technical Architecture  
**Status:** Proposed; product-owner approval required  
**Prerequisites:** Phases 01–04 approved  
**Implementation status:** Not started

---

## 1. Architecture goals

FORMA combines a public creative-technology experience with a real interactive product. The architecture must support indexable public pages, interactive 2D experiments, a constrained 3D editor, private cloud-saved scenes, a small-team maintenance model, free-tier-conscious infrastructure, and production-level accessibility, security, and performance.

Avoid premature microservices, unnecessary abstractions, and features outside the approved MVP.

## 2. Recommended stack (proposal)

| Layer | Recommendation | Responsibility |
|---|---|---|
| Web application | Next.js App Router + React + TypeScript | Public routes, application shell, server rendering |
| Styling | Existing CSS tokens + CSS Modules/global CSS | Custom art direction and semantic design system |
| 3D | Three.js through React Three Fiber | Scene Studio viewport |
| 3D helpers | Drei, selectively | Camera, controls, and common scene helpers |
| Editor state | Zustand | Selection, transforms, tools, undo/redo, transient editor state |
| Server/cache state | TanStack Query only where justified | Scene queries, mutations, invalidation |
| Validation | Zod | Runtime validation of forms, API inputs, and scene documents |
| Backend | Supabase | PostgreSQL, Auth, RLS, and object storage when needed |
| Tests | Vitest, React Testing Library, Playwright, axe-core | Unit, component, browser, and accessibility testing |
| Hosting candidate | Vercel | Next.js previews and production hosting |

This is a recommended baseline, not a set of approved provider choices. Use stable compatible releases at implementation time; do not freeze package versions in this proposal.

## 3. System topology

Start with one deployable web application and one managed backend project. Do not split the MVP into microservices.

```text
Visitor / User
      |
      v
Next.js Web Application
  |-- Public experience and content routes
  |-- Playground and experiment runtime
  |-- Motion Lab
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
- Validate scene documents before persistence and after loading.

## 4. Rendering and route strategy

Render public content on the server or statically where appropriate. Hydrate only interactive regions. Load 3D dependencies only where needed.

| Route | Rendering approach | Access |
|---|---|---|
| `/` | Server-rendered page; optional client-only hero | Public |
| `/playground` | Server-rendered gallery and metadata | Public |
| `/playground/[slug]` | Server-rendered content + client experiment stage | Public |
| `/motion-lab` | Server shell + client study controls | Public |
| `/archive` | Server-rendered archive | Public |
| `/archive/[slug]` | Server-rendered case study | Public |
| `/about` | Server-rendered content | Public |
| `/auth/sign-in`, `/auth/sign-up` | Server shell + client form behavior | Public |
| `/scene-studio` | Auth-aware route; viewport loaded client-side | Public entry; edit/save requires sign-in |
| `/account` | Authenticated route | Authenticated |

Keep page titles, navigation, and essential content usable if a 3D canvas fails. Provide loading, empty, error, and not-found states. Preserve intended destinations through authentication. Public experiments and case studies must not require an account.

## 5. Proposed code organization

Use one application repository. Organize by feature and shared responsibility. Create directories as implementation needs them; this is a target, not a mandate to scaffold everything at once.

```text
forma/
├── app/
│   ├── (public)/             # Home, Playground, Motion Lab, Archive, About
│   ├── (auth)/               # Sign-in and sign-up
│   ├── scene-studio/
│   ├── account/
│   ├── api/
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── globals.css
├── components/
│   ├── layout/
│   ├── navigation/
│   ├── feedback/
│   └── ui/
├── features/
│   ├── playground/
│   ├── motion-lab/
│   ├── scene-studio/
│   │   ├── components/
│   │   ├── editor/
│   │   ├── scene/
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

Keep route files thin. Put product behavior in feature modules. Shared components should emerge from genuinely repeated patterns.

## 6. Scene Studio architecture

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

Constrain the first version to the current MVP. Add geometry, materials, lights, cameras, and assets through explicit schema evolution.

### Editing, history, and saving

- Keep pointer movement and drag previews transient.
- Commit meaningful changes as discrete editor commands.
- Use reversible commands or bounded snapshots for undo/redo; never persist every pointer-move event.
- Debounce cloud saves after meaningful changes and show a clear save state.
- Provide a manual save action and unsaved-changes indicator.
- Prevent an older in-flight save from overwriting a newer revision.
- Preserve the local working document and communicate failures when offline or when saving fails.
- No collaboration or multi-user editing in the MVP.

## 7. Initial persistence model proposal

Use PostgreSQL for structured scene records. Keep the first schema small.

### `scenes`

| Column | Type | Purpose |
|---|---|---|
| `id` | uuid primary key | Scene identifier |
| `owner_id` | uuid, auth user reference | Ownership |
| `title` | text | Scene name |
| `document` | jsonb | Versioned SceneDocument |
| `schema_version` | integer | Migration version |
| `created_at` | timestamptz | Creation time |
| `updated_at` | timestamptz | Last successful save |

Index `(owner_id, updated_at desc)` for a user's scene library.

### Authorization requirements

- Enable RLS.
- A user may select, insert, update, and delete only rows where `owner_id = auth.uid()`.
- Inserts must enforce the authenticated owner.
- Ordinary updates must not permit owner reassignment.
- Anonymous users receive no access to private scenes.
- Test every operation using at least two separate user identities.

Use object storage only for binary assets such as uploaded textures or thumbnails. Store object paths and metadata in PostgreSQL, not binary payloads in JSONB. Define private buckets and owner-scoped policies before enabling uploads.

Do not add public sharing, team membership, comments, or collaboration tables to the MVP.

## 8. Authentication and security

Proposed approach:
- Supabase Auth for sign-up, sign-in, sign-out, and recovery.
- Use the supported server-side session/cookie integration for the selected Next.js version.
- Validate redirect destinations to prevent open redirects.
- Protect private routes on the server and enforce data access again with RLS.
- Never trust client-supplied owner IDs.
- Validate external inputs with Zod and enforce document size and upload type/size limits.
- Use secure HttpOnly session cookies through the supported integration.
- Keep secrets in deployment environment settings; commit only a placeholder `.env.example`.
- Add rate limiting and abuse protection to sensitive endpoints where supported.
- Apply least-privilege database and storage policies.
- Collect only personal data the product actually needs.

Security acceptance tests: anonymous access, cross-user reads/writes, owner reassignment attempts, invalid scene payloads, expired sessions, and unauthorized storage access.

## 9. Data flows

**Public content:** request → Next.js route → typed content source → rendered page. Curated experiment metadata can live in typed source files for the MVP; do not introduce a CMS until non-developer editing is a real requirement.

**Scene load:** authenticated user → server session validation → owner-scoped query → schema validation → editor hydration → viewport render.

**Scene save:** editor command → serialization → schema validation → authenticated mutation → RLS ownership check → database write → revision response → visible save status.

**Authentication:** form → server-side validation → Supabase Auth → session cookie → validated intended-route redirect. Recovery must use the provider's configured flow and never claim an email was sent unless the provider confirms it.

## 10. Performance strategy

- Server-render public content and isolate interactive client regions.
- Dynamically load the 3D viewport and editor-only dependencies.
- Compress and correctly size images; lazy-load below-the-fold media.
- Avoid rendering expensive 3D scenes while inactive or off-screen.
- Cap pixel ratio and provide quality fallbacks for weaker devices.
- Dispose of geometries, materials, textures, and renderer resources when no longer needed.
- Avoid expensive shader/particle effects as a default.
- Respect reduced-motion preferences and provide non-canvas alternatives for essential information.
- Measure route JavaScript, LCP, INP, and CLS.
- Establish numeric performance budgets after a real baseline is measured.

## 11. Testing strategy

| Layer | Tools | Coverage |
|---|---|---|
| Unit | Vitest | Scene serialization, validation, editor commands |
| Component | React Testing Library | Forms, controls, navigation, loading/error states |
| Browser | Playwright | Public journeys, authentication, editing and persistence |
| Security | RLS integration tests | Anonymous and cross-user isolation |
| Accessibility | axe-core + manual checks | Semantics, keyboard, focus, dialogs, contrast, announcements |
| Visual | Browser screenshots + manual review | Desktop/tablet/mobile and approved visual direction |

Run browser tests against an isolated configured test environment. A passing unit suite does not establish deployment readiness.

## 12. Environments and deployment

Recommended environments:
- **Local:** local development, local environment variables, isolated test data.
- **Preview:** pull-request or branch deployments using non-production backend resources.
- **Production:** protected deployment with production secrets and database.

Vercel is the initial hosting candidate, not a final selection. Before approval, verify current free-tier quotas, build and bandwidth limits, Supabase database/storage quotas and inactivity behavior, auth email constraints, custom-domain needs, backup/restore options, and commercial-use terms. A free tier is not a guaranteed production SLA. Maintain a database and scene-document export/migration path.

## 13. Observability and operations

MVP baseline:
- Structured server logs without secrets or sensitive scene contents.
- Error reporting for client and server exceptions.
- Clear loading, empty, save, and failure states.
- Basic health checks for configured backend connectivity.
- Deployment and migration notes.
- Documented backup/export procedure before real user data is accepted.

Third-party analytics are not required for the first implementation.

## 14. Dependency policy

- Prefer stable releases compatible with the selected React/Next.js versions.
- Pin dependencies through the package lockfile.
- Do not install libraries for trivial utilities.
- Isolate Three.js dependencies from public page bundles.
- Review maintenance, licensing, bundle cost, and security advisories before adoption.
- Re-check compatibility at implementation time.

## 15. Risks and mitigations

| Risk | Mitigation |
|---|---|
| 3D complexity expands scope | Constrain MVP primitives and scene schema |
| Large client bundle | Server-render public pages; lazy-load editor |
| Cloud data exposure | RLS, server checks, cross-user tests |
| Save conflicts/data loss | Revision-aware writes, local working state, visible errors |
| Free-tier changes | Quota monitoring and export/migration plan |
| Design drift | Shared semantic tokens and component specs |
| Mobile editor usability | Purpose-built workflows and device testing |
| Premature abstractions | One application, feature modules, no microservices |

## 16. Decisions requiring owner approval

These recommendations are not binding until approved:

1. Next.js App Router as the application framework.
2. TypeScript as the application language.
3. CSS tokens + CSS Modules/global CSS; no general UI kit.
4. Three.js through React Three Fiber; Drei only where useful.
5. Zustand for editor-local state.
6. Supabase Auth + PostgreSQL + RLS; Storage only when needed.
7. Zod for runtime validation.
8. Vitest, React Testing Library, Playwright, and axe-core for testing.
9. Vercel as the initial hosting candidate, subject to current quota review.
10. Private single-user scenes for MVP; no public sharing, collaboration, marketplace, or native mobile apps.

### Phase 05 acceptance criteria

- Stack and provider decisions recorded in `DECISIONS.md`.
- Route/rendering strategy approved.
- Application and feature boundaries approved.
- Scene document and persistence model approved.
- Authentication and authorization model approved.
- Environment, testing, performance, and deployment strategy approved.
- MVP exclusions and migration assumptions understood.

**Current state:** Proposal drafted; owner review required. Phase 06 is not authorized.
