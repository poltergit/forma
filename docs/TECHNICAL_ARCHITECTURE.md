# FORMA — Technical Architecture

**Version:** 0.4  
**Phase:** 05 — Technical Architecture  
**Status:** Core and supporting stack approved; operational validation remains  
**Implementation status:** Not started

---

## 1. Architecture goals

FORMA combines a public creative-technology experience with a real interactive product. It must support expressive spatial storytelling, ambitious generative 2D/3D experiments, a real 3D editor, private cloud persistence, and invite-only real-time collaboration.

It must not become a generic SaaS dashboard with decorative 3D. Its spatial and generative ambition is a product requirement; see [Experiential Direction](EXPERIENCE_DIRECTION.md).

## 2. Approved stack

| Layer | Approved technology | Responsibility |
|---|---|---|
| Application | Next.js App Router + React + TypeScript | Routing, server rendering, client experience islands |
| Styling | CSS design tokens + CSS Modules | Art-directed interface and semantic system |
| 3D | Three.js + React Three Fiber | Spatial experiences and editor viewport |
| 3D helpers | Drei selectively | Useful camera, controls, and scene helpers |
| Editor state | Zustand | Selection, tools, transient transforms, panels, history coordination |
| Runtime validation | Zod | Forms, scene documents, commands, generator parameters |
| Backend | Supabase | Auth, PostgreSQL, RLS, Realtime, Storage only when required |
| Unit tests | Vitest | Pure logic, generators, commands, validation |
| Component tests | React Testing Library | Observable UI behavior |
| Browser tests | Playwright | Critical single- and multi-user journeys |
| Accessibility automation | axe-core | Automated checks supplemented by manual testing |
| Client server-state cache | Defer TanStack Query | Reconsider only when measured requirements justify it |
| Hosting | Vercel | Preview and production deployments |

Exact package versions and compatibility are verified at implementation time. Approval does not mean packages are installed or tests configured.

## 3. System topology

```text
Browser clients (owner / editor / viewer)
  |-- Public editorial and experience routes
  |-- Spatial and generative client stages
  |-- Scene Studio editor / R3F viewport
  |-- Supabase Auth session
  |-- Private Realtime presence + database notifications
          |
          v
Next.js server boundary
  |-- Session validation
  |-- Zod input validation
  |-- Membership and role authorization
  |-- Typed scene command handling
  |-- Invitation creation / acceptance
          |
          v
Supabase
  |-- Auth
  |-- PostgreSQL: scenes, members, invitations, artifacts
  |-- RLS and transactional scene mutations
  |-- Realtime: private presence and committed-change notifications
  |-- Storage: private binary assets only when introduced
```

### Trust boundaries
- The browser is untrusted.
- Public environment variables contain only public configuration and publishable keys.
- Service-role secrets, if needed for a trusted invitation operation, remain server-only and are never exposed to browser code.
- Every mutation checks the current authenticated identity and role.
- RLS remains mandatory even when a server action also checks authorization.
- Database content, generator parameters, and collaboration commands are untrusted input.

## 4. Rendering and route strategy

| Route | Rendering approach | Access |
|---|---|---|
| `/` | Server-rendered editorial shell + optional client spatial hero | Public |
| `/playground` | Server-rendered editorial registry | Public |
| `/playground/[slug]` | Server context + isolated client experiment | Public |
| `/motion-lab` | Server shell + client generative workspace | Public |
| `/archive`, `/archive/[slug]` | Server-rendered editorial archive/case study + optional spatial moments | Public |
| `/about` | Server-rendered editorial narrative + progressive spatial enhancement | Public |
| `/auth/*` | Server shell + client form behavior | Public |
| `/scene-studio` | Auth-aware route; client editor and viewport | Entry public; scene access requires membership |
| `/scene-studio/[sceneId]` | Server validates session/membership, then loads editor | Owner/editor/viewer |
| `/account` | Authenticated | Authenticated |

Essential text, navigation, and actions remain usable without WebGL. Public experiments do not require an account. Scene IDs are not authorization tokens.

## 5. Feature boundaries

```text
app/
  (public)/       # home, playground, motion lab, archive, about
  (auth)/         # sign-in, sign-up, recovery, invitation acceptance
  scene-studio/   # scene library, editor, sharing
  account/
  api/            # narrowly scoped handlers where needed

features/
  experience/     # spatial Home composition
  playground/     # registry and isolated experiment stages
  generative/     # seeded generators, schemas, artifact serialization
  motion-lab/     # parameter-driven motion studies
  scene-studio/
    document/     # versioned serializable schema
    commands/     # allowlisted edits and undo compensation
    editor/       # Zustand transient state and selection
    renderer/     # React Three Fiber viewport
    persistence/  # scene load/save and revision protocol
    collaboration/# membership, presence, command sync, recovery
  archive/
  account/

lib/
  supabase/       # browser/server clients
  auth/           # session and access helpers
  validation/     # shared Zod schemas
  observability/
components/       # accessible shared UI
design/tokens.css
tests/
```

Keep route files thin. Experiment stages load independently. Do not create abstractions until repeated use cases justify them.

## 6. Spatial and generative runtime

The runtime is a collection of authored, bounded experiences—not a general-purpose game engine.

- Spatial Home: one memorable composition with a small set of meaningful scroll-linked transformations.
- Playground: multiple original, independently loadable studies with distinct visual grammar.
- Motion Lab: parameter-rich motion and generative studies with reset, seed, and reproducibility where offered.
- Generative registry: explicit allowlisted generator ID/version, validated parameter schema, deterministic seed handling, resource bounds, and fallback.
- Renderer: React Three Fiber for real spatial work; CSS/SVG/canvas for simpler 2D work.
- Accessibility: keyboard/touch alternatives, reduced-motion modes, essential semantic content outside canvas, WebGL fallback.

Saved generative artifacts store generator ID/version, seed, validated parameters, and schema version. Never store or execute arbitrary user-supplied JavaScript, shaders, or dynamic module paths.

## 7. Scene Studio and collaboration

Scene Studio separates:
1. Serializable scene document.
2. React Three Fiber renderer.
3. Zustand editor-local state.
4. Allowlisted typed command layer and undo/redo.
5. Revision-aware persistence.
6. Membership, invitations, presence, synchronization, and reconnect recovery.

### Roles
- Owner: full control, deletion, invite/revoke, role management.
- Editor: read and edit; cannot manage membership or delete the scene.
- Viewer: read and presence only.
- Anonymous/non-member: no private scene or channel access.

### Synchronization baseline
- Supabase Realtime private channels provide scene presence and committed-change notifications.
- PostgreSQL remains the durable source of truth.
- Mutations are validated at the Next.js boundary and executed through a narrow PostgreSQL RPC/function that checks `auth.uid()`, current membership/role, command idempotency, and scene revision inside one database transaction.
- Ordinary browser clients cannot directly replace the scene document or revision. RLS/privileges prevent bypassing the command RPC.
- Commands are idempotent; concurrent edits are ordered. Same-property conflicts use explicit server commit order and visible collaborator attribution.
- Notifications are not the event log. Reconnecting clients fetch an authoritative snapshot/revision and reconcile pending command IDs.
- No CRDT or offline multi-user merge in MVP.

A Next.js server action is not itself a database transaction. The atomic lock/update/receipt operation must occur inside PostgreSQL. Prefer a narrowly scoped security-invoker RPC where feasible; if security-definer is necessary, harden its search path and grants and enforce the actor from `auth.uid()` inside the function.

See [Real-Time Collaboration](REALTIME_COLLABORATION.md) and [Security Threat Model](SECURITY_THREAT_MODEL.md). Validate private-channel authorization, RLS, transaction/idempotency behavior, event recovery, and quotas in an isolated project before production.

## 8. Data and security

- PostgreSQL stores scenes, memberships, invitations, and generative artifact metadata.
- RLS protects every private table.
- Owner/editor/viewer role checks apply to every operation.
- Server derives actor identity from the session; never trust a client-supplied owner ID.
- Invitations use expiring single-use tokens stored hashed; raw tokens are never persisted.
- Rate-limit invitation operations.
- No service-role key in client bundles.
- Validate scene documents, commands, parameters, and upload bytes.
- Bound object counts, payload sizes, numeric ranges, and generator resource consumption.
- Private storage only when binary assets are introduced.

The collaboration-aware [Scene Studio Data Model](SCENE_STUDIO_DATA_MODEL.md) is the proposed baseline. The [Generative Artifact Model](GENERATIVE_ARTIFACT_MODEL.md) is a separate proposed table and policy. Neither has been applied or tested.

## 9. Authentication and invitation flow

Use Supabase Auth with the supported SSR integration for the selected Next.js version. Validate sessions server-side. Invitation acceptance requires an authenticated account matching the intended verified recipient identity, a valid unexpired token, and an atomic membership creation. If an admin invitation API is needed, isolate it behind a server-only operation; never expose service credentials. Do not claim invitation delivery unless email configuration is actually working.

See [Authentication & Environment](AUTH_AND_ENVIRONMENT.md) and [Real-Time Collaboration](REALTIME_COLLABORATION.md).

## 10. Testing strategy

| Layer | Tools | Coverage |
|---|---|---|
| Unit | Vitest | Generator determinism, schemas, command reducers, revision/conflict logic |
| Component | React Testing Library | Editor controls, role-based UI, invitation and sync states |
| Browser | Playwright | Public journeys, auth, two-user collaboration, viewer restrictions, reconnect |
| Database/security | Isolated Supabase tests | RLS, membership, invitation, command authorization, idempotency |
| Accessibility | axe-core + manual | Keyboard, focus, announcements, contrast, reduced motion |
| Runtime/device | Browser profiling and manual review | WebGL failure/context loss, resource disposal, frame time, mobile |

Multi-user tests require separate authenticated contexts. Never run destructive RLS tests against production data. Passing unit tests alone does not establish collaboration readiness.

## 11. Performance and resilience

- Server-render public content; isolate interactive client regions.
- Lazy-load WebGL and avoid concurrent heavy canvases.
- Pause rendering off-screen/backgrounded.
- Cap pixel ratio, geometry, instance count, textures, and post-processing.
- Keep presence messages small and throttle transient updates.
- Do not persist raw pointer movement.
- Preserve local intent through network failure; show pending/conflict state.
- Recover from missed realtime events using the latest database snapshot.
- Respect native scrolling, reduced motion, and non-WebGL fallbacks.
- Measure LCP, INP, CLS, bundle size, and representative 3D frame time on actual devices before setting numeric budgets.

## 12. Environments and operations

Use local, preview, and production environments with separate Supabase resources and secrets. Preview deployments must not use production user data. Verify current Vercel/Supabase quotas, Realtime connection/message limits, email delivery constraints, backups, restore, and inactivity behavior before launch. Free-tier infrastructure does not imply a production SLA.

Observability should capture server/client errors, sync failures, WebGL failures, and operational metrics without logging secrets, invite tokens, or private scene documents.

## 13. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Collaboration synchronization complexity | Typed commands, server-authoritative ordering, bounded scope, isolated spike |
| Realtime event missed | Durable database revision and snapshot recovery |
| Conflicting simultaneous edits | Transactional ordering, idempotency, explicit conflict UI |
| Membership policy mistake | RLS tests for owner/editor/viewer/revoked/anonymous |
| Invitation abuse | Hashed expiring tokens, rate limits, identity matching |
| 3D performance | Lazy loading, budgets, quality tiers, profiling |
| Generative output becomes noise | Authored rules, seeds, curated parameters, reproducibility |
| Free-tier limits | Verify quotas and retain export/migration path |
| Excessive scope | No public rooms, chat/video, offline merge, or arbitrary code in MVP |

## 14. Phase 05 decisions and remaining validation

Approved:
- D-014: core and supporting stack.
- D-015: spatial/generative/performative experience quality bar.
- D-016: ambitious generative first-release scope.
- D-017: real-time invite-only collaboration in Scene Studio MVP.

Still required before Phase 05 acceptance:
- Finalize and test migrations, RLS, and grants for scenes, members, invitations, and artifacts.
- Validate invitation delivery, verified identity binding, and atomic acceptance.
- Validate PostgreSQL command RPC, idempotency, concurrent edits, and conflict behavior.
- Validate private Realtime authorization, revocation, reconnect, and recovery.
- Verify provider quotas, environment separation, backups, and deployment constraints.
- Complete final threat-model review and validation evidence package.

**Phase 06 is not authorized until the product owner explicitly approves the completed Phase 05 review.**
