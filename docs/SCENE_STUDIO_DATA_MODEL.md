# FORMA — Scene Studio Data Model & Security

**Version:** 0.1  
**Phase:** 05 — Technical Architecture  
**Status:** Proposed implementation specification  
**Backend:** Supabase PostgreSQL + Auth + Row Level Security  
**Scope:** Private, single-owner scenes for the MVP

## 1. Principles

- Each scene belongs to one authenticated user.
- Private scenes are never publicly readable in the MVP.
- PostgreSQL is the source of truth for persisted scene documents.
- Persist validated, versioned JSON; never persist Three.js runtime objects, functions, GPU resources, or class instances.
- Enforce ownership with database Row Level Security (RLS), not merely application checks.
- Use optimistic concurrency to prevent stale saves from silently overwriting newer work.
- No sharing, teams, collaboration, marketplace, or public asset tables in the MVP.

## 2. Data relationship

~~~text
auth.users
    |
    | one-to-many
    v
public.scenes
  id, owner_id, title, document (JSONB),
  schema_version, revision, created_at, updated_at
~~~

No separate profile table is required for the initial scene workflow. Supabase Auth owns identity.

## 3. Scenes table

| Field | Type | Rule |
|---|---|---|
| id | uuid | Primary key, generated |
| owner_id | uuid | Required reference to auth.users |
| title | text | Trimmed, 1–80 characters |
| document | jsonb | Versioned SceneDocument |
| schema_version | integer | Initially version 1 |
| revision | bigint | Starts at 1; increments on update |
| created_at | timestamptz | Server generated |
| updated_at | timestamptz | Server maintained |

Index: owner_id + updated_at descending.

## 4. Proposed first migration

This migration is a reviewable proposal. Apply it through version-controlled Supabase CLI migrations after configuring and testing an isolated project.

~~~sql
create table public.scenes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null
    check (char_length(btrim(title)) between 1 and 80),
  document jsonb not null,
  schema_version integer not null default 1
    check (schema_version = 1),
  revision bigint not null default 1
    check (revision >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scenes_document_is_object
    check (jsonb_typeof(document) = 'object'),
  constraint scenes_document_version_matches
    check ((document ->> 'schemaVersion') = schema_version::text)
);

create index scenes_owner_updated_idx
  on public.scenes (owner_id, updated_at desc);

alter table public.scenes enable row level security;

create policy "Owners can read their scenes"
  on public.scenes for select to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Owners can create their scenes"
  on public.scenes for insert to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "Owners can update their scenes"
  on public.scenes for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Owners can delete their scenes"
  on public.scenes for delete to authenticated
  using ((select auth.uid()) = owner_id);

create function public.set_scene_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger scenes_set_updated_at
before update on public.scenes
for each row execute function public.set_scene_updated_at();

revoke all on public.scenes from anon;
grant select, insert, update, delete on public.scenes to authenticated;
~~~

### Migration notes

- The database checks the top-level document version only. Full nested validation belongs in the application.
- Version 1 is deliberately constrained. A future migration must explicitly support new versions and include a tested document migration.
- RLS remains mandatory even if all mutations use server-side routes.
- The update policy prevents changing owner_id to a different user. Application updates must omit owner_id.
- The trigger maintains updated_at. The application performs revision increments using compare-and-swap updates.
- Confirm Supabase role grants and migration conventions in the isolated project before production use.

## 5. Version 1 document contract

~~~ts
export type Vec3 = [number, number, number];
export type SceneObjectType = "box" | "sphere" | "plane";

export type SceneDocumentV1 = {
  schemaVersion: 1;
  settings: {
    background: string;
    gridVisible: boolean;
  };
  objects: Array<{
    id: string;
    type: SceneObjectType;
    name: string;
    visible: boolean;
    transform: {
      position: Vec3;
      rotation: Vec3;
      scale: Vec3;
    };
    material: { color: string };
  }>;
};
~~~

The first release supports box, sphere, and plane primitives, object names, visibility, transforms, a background, grid visibility, and a simple color material. Add advanced geometry, lights, cameras, and asset references only through explicit schema evolution.

### Runtime validation

Use a runtime schema at every application boundary:
- Reject unknown document versions and unexpected structure.
- Require finite transform values.
- Limit the initial scene to 100 objects.
- Limit object names and require unique IDs within each document.
- Restrict primitive types to the supported union.
- Validate colors against an accepted syntax.
- Limit serialized document size (initial proposal: 1 MiB).
- Re-validate data after database reads; persisted JSON is not automatically trusted.

These limits are initial guardrails and can be tuned after profiling.

## 6. Optimistic concurrency

The revision is a compare-and-swap token.

1. Load a scene and retain its revision.
2. Validate and serialize the edited document.
3. Update only where both scene ID and expected revision match.
4. Set revision to expected revision + 1.
5. If one row is returned, accept the new revision.
6. If no row is returned, treat it as conflict, deletion, or inaccessible record. Re-fetch metadata and ask the user to reload or reconcile.
7. On network failure, preserve the local working copy and clearly indicate that it is not saved.

Illustrative update:

~~~ts
const { data, error } = await supabase
  .from("scenes")
  .update({
    document: validatedDocument,
    schema_version: 1,
    revision: expectedRevision + 1,
  })
  .eq("id", sceneId)
  .eq("revision", expectedRevision)
  .select("id, revision, updated_at")
  .maybeSingle();

if (error) throw error;
if (!data) {
  // Conflict, deletion, or inaccessible scene.
  // Preserve local edits; never overwrite blindly.
}
~~~

RLS enforces ownership. Revision matching is a concurrency guard, not authorization.

## 7. Required operations

| Operation | Required behavior |
|---|---|
| List | Only the signed-in user's scenes, newest updated first |
| Create | Derive owner from trusted session; never accept client owner ID |
| Load | Query by scene ID and rely on RLS |
| Update | Validate document and require expected revision |
| Rename | Validate title and use revision-aware update |
| Delete | Require UI confirmation and rely on RLS |
| Sign out | Clear session and private editor data |

Do not reveal whether an inaccessible scene ID belongs to another user.

## 8. Security test matrix

Run against an isolated local or disposable test project using Alice, Bob, and an anonymous session.

| Test | Expected |
|---|---|
| Anonymous lists scenes | No rows |
| Alice creates a scene owned by Alice | Allowed |
| Alice inserts a scene owned by Bob | Denied |
| Alice reads her own scene | Allowed |
| Bob reads, updates, or deletes Alice's scene | Denied / no row |
| Alice changes owner to Bob | Denied |
| Unsupported document version | Rejected |
| Malformed nested document | Rejected by application validation |
| Stale revision update | No row updated; conflict handled |
| Expired session | Authenticated operations fail |
| Anonymous access to future private storage | Denied |

RLS tests must never run against production user data.

## 9. Storage decision

Do not create a storage bucket for the initial primitive-only editor. When thumbnails or uploads are scheduled:
- Keep buckets private by default.
- Use owner-scoped object paths and storage policies.
- Validate actual content and byte size server-side.
- Do not trust filename extensions or browser MIME declarations.
- Add orphan cleanup and deletion behavior before shipping uploads.

## 10. Deferred capabilities

Public sharing, share tokens, team ownership, collaboration, realtime presence, comments, activity feeds, version-history UI, arbitrary uploads, asset libraries, and marketplace features require separate product and threat-model review.

## 11. Acceptance criteria

- Migration is version-controlled and reproducible in a clean test database.
- RLS tests prove anonymous and cross-user isolation.
- Validation rejects malformed and unsupported scene documents.
- Optimistic concurrency prevents silent stale overwrites.
- UI preserves local work and communicates save failures.
- Sign-out and deletion do not leave private content visible.
- No production secrets are committed.
