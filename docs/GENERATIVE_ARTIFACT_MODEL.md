# FORMA — Generative Artifact Data Model

**Version:** 0.1  
**Phase:** 05 — Technical Architecture  
**Status:** Proposed; requires product-owner and security review  
**Backend:** Supabase PostgreSQL + Auth + Row Level Security  
**Scope:** Private, reproducible generative outputs; no public sharing or executable user code

---

## 1. Purpose

A generative result should be more than a screenshot of a random outcome. When FORMA offers saving, the saved artifact must preserve enough structured information to reproduce the output with the compatible generator implementation.

The artifact is a **recipe and provenance record**, not a serialized WebGL scene or executable program.

## 2. Design rules

- Store a stable generator identifier and explicit generator version.
- Store a deterministic seed and validated parameter document.
- Store an artifact schema version independent of the generator version.
- Treat every field received from the browser or database as untrusted.
- Never store or execute user-supplied JavaScript, shaders, expressions, or arbitrary code.
- Keep artifacts private to their owner in the MVP.
- Do not store GPU resources, renderer instances, functions, or Three.js class instances.
- A saved artifact must not silently change appearance when a generator is updated.

## 3. Proposed table

### `public.generative_artifacts`

| Column | Type | Purpose |
|---|---|---|
| id | uuid primary key | Artifact identifier |
| owner_id | uuid, auth user reference | Private owner |
| title | text | User-facing artifact name |
| generator_id | text | Stable allowlisted generator key |
| generator_version | text | Exact compatible generator release |
| seed | text | Canonical deterministic seed |
| parameters | jsonb | Generator-specific validated parameter object |
| schema_version | integer | Artifact document contract version |
| created_at | timestamptz | Server generated |
| updated_at | timestamptz | Server maintained |

Use a canonical string seed rather than relying on database numeric coercion. The generator contract must define the accepted seed format and normalization. The application must bound its length and reject unsupported characters.

### Suggested SQL migration (proposal only)

```sql
create table public.generative_artifacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null
    check (char_length(btrim(title)) between 1 and 80),
  generator_id text not null
    check (char_length(generator_id) between 1 and 100),
  generator_version text not null
    check (char_length(generator_version) between 1 and 40),
  seed text not null
    check (char_length(seed) between 1 and 64),
  parameters jsonb not null
    check (jsonb_typeof(parameters) = 'object'),
  schema_version integer not null default 1
    check (schema_version = 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index generative_artifacts_owner_updated_idx
  on public.generative_artifacts (owner_id, updated_at desc);

alter table public.generative_artifacts enable row level security;

create policy "Owners can read their generative artifacts"
  on public.generative_artifacts for select to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Owners can create their generative artifacts"
  on public.generative_artifacts for insert to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "Owners can update their generative artifacts"
  on public.generative_artifacts for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Owners can delete their generative artifacts"
  on public.generative_artifacts for delete to authenticated
  using ((select auth.uid()) = owner_id);

create function public.set_generative_artifact_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger generative_artifacts_set_updated_at
before update on public.generative_artifacts
for each row execute function public.set_generative_artifact_updated_at();

revoke all on public.generative_artifacts from anon;
grant select, insert, update, delete on public.generative_artifacts to authenticated;
```

This is a draft migration, not tested SQL. Confirm grants, naming, policies, and migration conventions in an isolated Supabase project before applying it anywhere persistent.

## 4. Generator registry contract

The application owns a finite registry of supported generators. A record in the database does not authorize loading an arbitrary module by a database-supplied path.

Illustrative type:

```ts
type GenerativeArtifactV1 = {
  schemaVersion: 1;
  generator: {
    id: string;
    version: string;
  };
  seed: string;
  parameters: Record<string, unknown>;
};
```

At runtime:
1. Validate the artifact envelope.
2. Resolve `generator.id` against a compile-time registry.
3. Resolve the exact compatible `generator.version`.
4. Validate parameters using that generator version's schema.
5. Normalize the seed according to that version's documented algorithm.
6. Generate output within explicit CPU, memory, geometry, and texture budgets.
7. If the generator version is unavailable, show a clear unsupported-version state; do not silently substitute the newest version.

Each generator implementation should expose:
- stable ID and version;
- parameter schema and defaults;
- seed normalization;
- deterministic generation function;
- documented bounds and resource budget;
- static preview/fallback strategy;
- optional export capabilities.

## 5. Determinism contract

Determinism is scoped and explicit:
- Identical generator ID, version, normalized seed, parameters, and supported runtime contract should produce the same logical output.
- Avoid unseeded random calls inside generation functions.
- Avoid depending on current time, pointer position, device dimensions, or frame timing unless those values are explicit saved parameters.
- Separate deterministic generation from live animation. A live simulation may evolve after generation; its initial state must be reproducible.
- If floating-point or renderer differences prevent pixel-identical output across devices, promise structural/logical reproducibility rather than identical pixels.

## 6. Validation and resource limits

Application validation must:
- allow only generator IDs and versions in the registry;
- validate the parameter schema for that exact version;
- bound seed length and format;
- cap serialized parameter size;
- reject non-finite numbers and unexpected keys;
- cap generated object count, vertex/instance count, texture dimensions, and computation time;
- reject external URLs or asset references unless a future reviewed feature explicitly supports them;
- revalidate after database reads.

Initial resource limits should be established per generator, not one arbitrary global limit. Values must be measured and documented before implementation is considered complete.

## 7. Ownership and privacy

- Enable RLS and restrict all CRUD operations to the authenticated owner.
- Derive owner identity from the trusted server session; never trust a client-supplied owner ID.
- Do not include private parameter documents in public pages, analytics, or routine logs.
- No public artifact URLs, share tokens, or anonymous read policy in the MVP.
- No storage bucket is needed for the first metadata-only version. Add private preview storage only when thumbnail generation is implemented and storage policies are reviewed.

## 8. Versioning and migrations

- `schema_version` describes the artifact envelope, not the generator implementation.
- `generator_version` identifies the exact deterministic algorithm and parameter interpretation.
- Preserve older generator implementations for saved versions where practical, or provide an explicit migration path.
- A migration must transform and validate the parameter document, record the target version, and be reversible or backed up.
- Never silently reinterpret old parameters under new defaults.
- Export should include the artifact envelope so a user can retain the recipe outside the service.

## 9. Security test matrix

Test in an isolated environment with Alice, Bob, and anonymous sessions:

| Test | Expected |
|---|---|
| Anonymous lists artifacts | No rows |
| Alice creates artifact owned by Alice | Allowed |
| Alice inserts owner_id for Bob | Denied |
| Bob reads/updates/deletes Alice's artifact | Denied / no row |
| Alice attempts owner reassignment | Denied |
| Unknown generator ID/version | Application rejects |
| Invalid parameter shape or oversized payload | Application rejects |
| Seed outside contract | Application rejects |
| Unsupported artifact schema | Application rejects |
| Saved artifact loads after generator upgrade | Exact version retained or explicit unsupported/migration state |

## 10. MVP recommendation

Start with a small number of authored generators and a private save/restore workflow only if it fits the first release. Do not introduce a generic node editor, arbitrary code execution, AI prompt-to-generator authoring, public sharing, collaboration, marketplace, or a user-uploaded plugin system.

The generator registry should remain simple and explicit. Add a new generator by implementing and testing a bounded module, not by dynamically evaluating stored code.

## 11. Acceptance criteria

- Generator ID/version registry is explicit and allowlisted.
- Seed and parameters reproduce the documented logical output.
- Unsupported versions fail clearly rather than silently changing results.
- Runtime parameter and resource bounds are enforced.
- RLS proves private owner-only access.
- No arbitrary user-supplied code is executed.
- Exported artifact includes the recipe and version provenance.
- Migration and RLS tests pass in an isolated database before release.
