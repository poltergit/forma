-- FORMA Phase 05 database baseline
-- REVIEW DRAFT ONLY: this migration has NOT been applied or tested.
-- Apply only to an isolated Supabase development project after review.

begin;

create table public.scenes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 80),
  document jsonb not null default '{"schemaVersion":1,"settings":{"background":"#111214","gridVisible":true},"objects":[]}'::jsonb
    check (jsonb_typeof(document) = 'object'),
  schema_version integer not null default 1 check (schema_version = 1),
  revision bigint not null default 1 check (revision >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index scenes_owner_updated_idx on public.scenes(owner_id, updated_at desc);

create table public.scene_members (
  scene_id uuid not null references public.scenes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('editor', 'viewer')),
  invited_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (scene_id, user_id)
);
create index scene_members_user_scene_idx on public.scene_members(user_id, scene_id);

create table public.scene_invitations (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid not null references public.scenes(id) on delete cascade,
  recipient_email_normalized text not null check (
    recipient_email_normalized = lower(btrim(recipient_email_normalized))
    and char_length(recipient_email_normalized) between 3 and 320
  ),
  role text not null check (role in ('editor', 'viewer')),
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  invited_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint scene_invitation_expiry_after_creation check (expires_at > created_at),
  constraint scene_invitation_single_terminal_state check (accepted_at is null or revoked_at is null)
);
create index scene_invitations_scene_pending_idx
  on public.scene_invitations(scene_id, expires_at)
  where accepted_at is null and revoked_at is null;

create table public.scene_command_receipts (
  scene_id uuid not null references public.scenes(id) on delete cascade,
  command_id uuid not null,
  actor_id uuid not null references auth.users(id) on delete cascade,
  request_fingerprint text not null check (request_fingerprint ~ '^[0-9a-f]{32}
    'object.transform.set', 'object.visibility.set',
    'object.material.set', 'scene.settings.set'
  )),
  resulting_revision bigint not null check (resulting_revision >= 2),
  created_at timestamptz not null default now(),
  primary key (scene_id, command_id)
);
create index scene_command_receipts_scene_revision_idx
  on public.scene_command_receipts(scene_id, resulting_revision);

create table public.generative_artifacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 80),
  generator_id text not null check (char_length(generator_id) between 1 and 100),
  generator_version text not null check (char_length(generator_version) between 1 and 40),
  seed text not null check (char_length(seed) between 1 and 64),
  parameters jsonb not null check (jsonb_typeof(parameters) = 'object'),
  schema_version integer not null default 1 check (schema_version = 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index generative_artifacts_owner_updated_idx
  on public.generative_artifacts(owner_id, updated_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
create trigger scenes_set_updated_at before update on public.scenes
  for each row execute function public.set_updated_at();
create trigger generative_artifacts_set_updated_at before update on public.generative_artifacts
  for each row execute function public.set_updated_at();

create or replace function public.prevent_scene_owner_change()
returns trigger language plpgsql set search_path = ''
as $$
begin
  if new.owner_id is distinct from old.owner_id then
    raise exception 'Scene ownership cannot be transferred';
  end if;
  return new;
end;
$$;
create trigger scenes_owner_immutable before update of owner_id on public.scenes
  for each row execute function public.prevent_scene_owner_change();

create or replace function public.prevent_artifact_owner_change()
returns trigger language plpgsql set search_path = ''
as $$
begin
  if new.owner_id is distinct from old.owner_id then
    raise exception 'Artifact ownership cannot be transferred';
  end if;
  return new;
end;
$$;
create trigger artifacts_owner_immutable before update of owner_id on public.generative_artifacts
  for each row execute function public.prevent_artifact_owner_change();

-- SECURITY DEFINER helpers avoid recursive RLS evaluation. Their search_path
-- is empty, all relations are qualified, and only authenticated can execute.
create or replace function public.is_scene_member(p_scene_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select (select auth.uid()) is not null and (
    exists (select 1 from public.scenes s
      where s.id = p_scene_id and s.owner_id = (select auth.uid()))
    or exists (select 1 from public.scene_members sm
      where sm.scene_id = p_scene_id and sm.user_id = (select auth.uid()))
  );
$$;
create or replace function public.is_scene_owner(p_scene_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.scenes s
    where s.id = p_scene_id and s.owner_id = (select auth.uid())
  );
$$;
revoke all on function public.is_scene_member(uuid) from public, anon;
revoke all on function public.is_scene_owner(uuid) from public, anon;
grant execute on function public.is_scene_member(uuid) to authenticated;
grant execute on function public.is_scene_owner(uuid) to authenticated;

alter table public.scenes enable row level security;
alter table public.scene_members enable row level security;
alter table public.scene_invitations enable row level security;
alter table public.scene_command_receipts enable row level security;
alter table public.generative_artifacts enable row level security;

create policy scenes_select_member on public.scenes
  for select to authenticated using ((select public.is_scene_member(id)));
create policy scenes_insert_owner on public.scenes
  for insert to authenticated with check (owner_id = (select auth.uid()));
-- Intentionally no scene UPDATE policy/grant: use a future atomic command RPC.
create policy scenes_delete_owner on public.scenes
  for delete to authenticated using (owner_id = (select auth.uid()));
create policy scene_members_select_members on public.scene_members
  for select to authenticated using ((select public.is_scene_member(scene_id)));
-- Membership, invitation, and command-receipt writes are RPC-only in later work.
create policy artifacts_select_owner on public.generative_artifacts
  for select to authenticated using (owner_id = (select auth.uid()));
create policy artifacts_insert_owner on public.generative_artifacts
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy artifacts_update_owner on public.generative_artifacts
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy artifacts_delete_owner on public.generative_artifacts
  for delete to authenticated using (owner_id = (select auth.uid()));

revoke all on public.scenes from anon, authenticated;
revoke all on public.scene_members from anon, authenticated;
revoke all on public.scene_invitations from anon, authenticated;
revoke all on public.scene_command_receipts from anon, authenticated;
revoke all on public.generative_artifacts from anon, authenticated;
grant select, insert, delete on public.scenes to authenticated;
grant select on public.scene_members to authenticated;
grant select, insert, update, delete on public.generative_artifacts to authenticated;

commit;
),
  command_type text not null check (command_type in (
    'object.create', 'object.delete', 'object.rename',
    'object.transform.set', 'object.visibility.set',
    'object.material.set', 'scene.settings.set'
  )),
  resulting_revision bigint not null check (resulting_revision >= 2),
  created_at timestamptz not null default now(),
  primary key (scene_id, command_id)
);
create index scene_command_receipts_scene_revision_idx
  on public.scene_command_receipts(scene_id, resulting_revision);

create table public.generative_artifacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 80),
  generator_id text not null check (char_length(generator_id) between 1 and 100),
  generator_version text not null check (char_length(generator_version) between 1 and 40),
  seed text not null check (char_length(seed) between 1 and 64),
  parameters jsonb not null check (jsonb_typeof(parameters) = 'object'),
  schema_version integer not null default 1 check (schema_version = 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index generative_artifacts_owner_updated_idx
  on public.generative_artifacts(owner_id, updated_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
create trigger scenes_set_updated_at before update on public.scenes
  for each row execute function public.set_updated_at();
create trigger generative_artifacts_set_updated_at before update on public.generative_artifacts
  for each row execute function public.set_updated_at();

create or replace function public.prevent_scene_owner_change()
returns trigger language plpgsql set search_path = ''
as $$
begin
  if new.owner_id is distinct from old.owner_id then
    raise exception 'Scene ownership cannot be transferred';
  end if;
  return new;
end;
$$;
create trigger scenes_owner_immutable before update of owner_id on public.scenes
  for each row execute function public.prevent_scene_owner_change();

create or replace function public.prevent_artifact_owner_change()
returns trigger language plpgsql set search_path = ''
as $$
begin
  if new.owner_id is distinct from old.owner_id then
    raise exception 'Artifact ownership cannot be transferred';
  end if;
  return new;
end;
$$;
create trigger artifacts_owner_immutable before update of owner_id on public.generative_artifacts
  for each row execute function public.prevent_artifact_owner_change();

-- SECURITY DEFINER helpers avoid recursive RLS evaluation. Their search_path
-- is empty, all relations are qualified, and only authenticated can execute.
create or replace function public.is_scene_member(p_scene_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select (select auth.uid()) is not null and (
    exists (select 1 from public.scenes s
      where s.id = p_scene_id and s.owner_id = (select auth.uid()))
    or exists (select 1 from public.scene_members sm
      where sm.scene_id = p_scene_id and sm.user_id = (select auth.uid()))
  );
$$;
create or replace function public.is_scene_owner(p_scene_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.scenes s
    where s.id = p_scene_id and s.owner_id = (select auth.uid())
  );
$$;
revoke all on function public.is_scene_member(uuid) from public, anon;
revoke all on function public.is_scene_owner(uuid) from public, anon;
grant execute on function public.is_scene_member(uuid) to authenticated;
grant execute on function public.is_scene_owner(uuid) to authenticated;

alter table public.scenes enable row level security;
alter table public.scene_members enable row level security;
alter table public.scene_invitations enable row level security;
alter table public.scene_command_receipts enable row level security;
alter table public.generative_artifacts enable row level security;

create policy scenes_select_member on public.scenes
  for select to authenticated using ((select public.is_scene_member(id)));
create policy scenes_insert_owner on public.scenes
  for insert to authenticated with check (owner_id = (select auth.uid()));
-- Intentionally no scene UPDATE policy/grant: use a future atomic command RPC.
create policy scenes_delete_owner on public.scenes
  for delete to authenticated using (owner_id = (select auth.uid()));
create policy scene_members_select_members on public.scene_members
  for select to authenticated using ((select public.is_scene_member(scene_id)));
-- Membership, invitation, and command-receipt writes are RPC-only in later work.
create policy artifacts_select_owner on public.generative_artifacts
  for select to authenticated using (owner_id = (select auth.uid()));
create policy artifacts_insert_owner on public.generative_artifacts
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy artifacts_update_owner on public.generative_artifacts
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy artifacts_delete_owner on public.generative_artifacts
  for delete to authenticated using (owner_id = (select auth.uid()));

revoke all on public.scenes from anon, authenticated;
revoke all on public.scene_members from anon, authenticated;
revoke all on public.scene_invitations from anon, authenticated;
revoke all on public.scene_command_receipts from anon, authenticated;
revoke all on public.generative_artifacts from anon, authenticated;
grant select, insert, delete on public.scenes to authenticated;
grant select on public.scene_members to authenticated;
grant select, insert, update, delete on public.generative_artifacts to authenticated;

commit;
),
  command_type text not null check (command_type in (
    'object.create', 'object.delete', 'object.rename',
    'object.transform.set', 'object.visibility.set',
    'object.material.set', 'scene.settings.set'
  )),
  resulting_revision bigint not null check (resulting_revision >= 2),
  created_at timestamptz not null default now(),
  primary key (scene_id, command_id)
);
create index scene_command_receipts_scene_revision_idx
  on public.scene_command_receipts(scene_id, resulting_revision);

create table public.generative_artifacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 80),
  generator_id text not null check (char_length(generator_id) between 1 and 100),
  generator_version text not null check (char_length(generator_version) between 1 and 40),
  seed text not null check (char_length(seed) between 1 and 64),
  parameters jsonb not null check (jsonb_typeof(parameters) = 'object'),
  schema_version integer not null default 1 check (schema_version = 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index generative_artifacts_owner_updated_idx
  on public.generative_artifacts(owner_id, updated_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
create trigger scenes_set_updated_at before update on public.scenes
  for each row execute function public.set_updated_at();
create trigger generative_artifacts_set_updated_at before update on public.generative_artifacts
  for each row execute function public.set_updated_at();

create or replace function public.prevent_scene_owner_change()
returns trigger language plpgsql set search_path = ''
as $$
begin
  if new.owner_id is distinct from old.owner_id then
    raise exception 'Scene ownership cannot be transferred';
  end if;
  return new;
end;
$$;
create trigger scenes_owner_immutable before update of owner_id on public.scenes
  for each row execute function public.prevent_scene_owner_change();

create or replace function public.prevent_artifact_owner_change()
returns trigger language plpgsql set search_path = ''
as $$
begin
  if new.owner_id is distinct from old.owner_id then
    raise exception 'Artifact ownership cannot be transferred';
  end if;
  return new;
end;
$$;
create trigger artifacts_owner_immutable before update of owner_id on public.generative_artifacts
  for each row execute function public.prevent_artifact_owner_change();

-- SECURITY DEFINER helpers avoid recursive RLS evaluation. Their search_path
-- is empty, all relations are qualified, and only authenticated can execute.
create or replace function public.is_scene_member(p_scene_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select (select auth.uid()) is not null and (
    exists (select 1 from public.scenes s
      where s.id = p_scene_id and s.owner_id = (select auth.uid()))
    or exists (select 1 from public.scene_members sm
      where sm.scene_id = p_scene_id and sm.user_id = (select auth.uid()))
  );
$$;
create or replace function public.is_scene_owner(p_scene_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.scenes s
    where s.id = p_scene_id and s.owner_id = (select auth.uid())
  );
$$;
revoke all on function public.is_scene_member(uuid) from public, anon;
revoke all on function public.is_scene_owner(uuid) from public, anon;
grant execute on function public.is_scene_member(uuid) to authenticated;
grant execute on function public.is_scene_owner(uuid) to authenticated;

alter table public.scenes enable row level security;
alter table public.scene_members enable row level security;
alter table public.scene_invitations enable row level security;
alter table public.scene_command_receipts enable row level security;
alter table public.generative_artifacts enable row level security;

create policy scenes_select_member on public.scenes
  for select to authenticated using ((select public.is_scene_member(id)));
create policy scenes_insert_owner on public.scenes
  for insert to authenticated with check (owner_id = (select auth.uid()));
-- Intentionally no scene UPDATE policy/grant: use a future atomic command RPC.
create policy scenes_delete_owner on public.scenes
  for delete to authenticated using (owner_id = (select auth.uid()));
create policy scene_members_select_members on public.scene_members
  for select to authenticated using ((select public.is_scene_member(scene_id)));
-- Membership, invitation, and command-receipt writes are RPC-only in later work.
create policy artifacts_select_owner on public.generative_artifacts
  for select to authenticated using (owner_id = (select auth.uid()));
create policy artifacts_insert_owner on public.generative_artifacts
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy artifacts_update_owner on public.generative_artifacts
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy artifacts_delete_owner on public.generative_artifacts
  for delete to authenticated using (owner_id = (select auth.uid()));

revoke all on public.scenes from anon, authenticated;
revoke all on public.scene_members from anon, authenticated;
revoke all on public.scene_invitations from anon, authenticated;
revoke all on public.scene_command_receipts from anon, authenticated;
revoke all on public.generative_artifacts from anon, authenticated;
grant select, insert, delete on public.scenes to authenticated;
grant select on public.scene_members to authenticated;
grant select, insert, update, delete on public.generative_artifacts to authenticated;

commit;
),
  command_type text not null check (command_type in (
    'object.create', 'object.delete', 'object.rename',
    'object.transform.set', 'object.visibility.set',
    'object.material.set', 'scene.settings.set'
  )),
  resulting_revision bigint not null check (resulting_revision >= 2),
  created_at timestamptz not null default now(),
  primary key (scene_id, command_id)
);
create index scene_command_receipts_scene_revision_idx
  on public.scene_command_receipts(scene_id, resulting_revision);

create table public.generative_artifacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 80),
  generator_id text not null check (char_length(generator_id) between 1 and 100),
  generator_version text not null check (char_length(generator_version) between 1 and 40),
  seed text not null check (char_length(seed) between 1 and 64),
  parameters jsonb not null check (jsonb_typeof(parameters) = 'object'),
  schema_version integer not null default 1 check (schema_version = 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index generative_artifacts_owner_updated_idx
  on public.generative_artifacts(owner_id, updated_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
create trigger scenes_set_updated_at before update on public.scenes
  for each row execute function public.set_updated_at();
create trigger generative_artifacts_set_updated_at before update on public.generative_artifacts
  for each row execute function public.set_updated_at();

create or replace function public.prevent_scene_owner_change()
returns trigger language plpgsql set search_path = ''
as $$
begin
  if new.owner_id is distinct from old.owner_id then
    raise exception 'Scene ownership cannot be transferred';
  end if;
  return new;
end;
$$;
create trigger scenes_owner_immutable before update of owner_id on public.scenes
  for each row execute function public.prevent_scene_owner_change();

create or replace function public.prevent_artifact_owner_change()
returns trigger language plpgsql set search_path = ''
as $$
begin
  if new.owner_id is distinct from old.owner_id then
    raise exception 'Artifact ownership cannot be transferred';
  end if;
  return new;
end;
$$;
create trigger artifacts_owner_immutable before update of owner_id on public.generative_artifacts
  for each row execute function public.prevent_artifact_owner_change();

-- SECURITY DEFINER helpers avoid recursive RLS evaluation. Their search_path
-- is empty, all relations are qualified, and only authenticated can execute.
create or replace function public.is_scene_member(p_scene_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select (select auth.uid()) is not null and (
    exists (select 1 from public.scenes s
      where s.id = p_scene_id and s.owner_id = (select auth.uid()))
    or exists (select 1 from public.scene_members sm
      where sm.scene_id = p_scene_id and sm.user_id = (select auth.uid()))
  );
$$;
create or replace function public.is_scene_owner(p_scene_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.scenes s
    where s.id = p_scene_id and s.owner_id = (select auth.uid())
  );
$$;
revoke all on function public.is_scene_member(uuid) from public, anon;
revoke all on function public.is_scene_owner(uuid) from public, anon;
grant execute on function public.is_scene_member(uuid) to authenticated;
grant execute on function public.is_scene_owner(uuid) to authenticated;

alter table public.scenes enable row level security;
alter table public.scene_members enable row level security;
alter table public.scene_invitations enable row level security;
alter table public.scene_command_receipts enable row level security;
alter table public.generative_artifacts enable row level security;

create policy scenes_select_member on public.scenes
  for select to authenticated using ((select public.is_scene_member(id)));
create policy scenes_insert_owner on public.scenes
  for insert to authenticated with check (owner_id = (select auth.uid()));
-- Intentionally no scene UPDATE policy/grant: use a future atomic command RPC.
create policy scenes_delete_owner on public.scenes
  for delete to authenticated using (owner_id = (select auth.uid()));
create policy scene_members_select_members on public.scene_members
  for select to authenticated using ((select public.is_scene_member(scene_id)));
-- Membership, invitation, and command-receipt writes are RPC-only in later work.
create policy artifacts_select_owner on public.generative_artifacts
  for select to authenticated using (owner_id = (select auth.uid()));
create policy artifacts_insert_owner on public.generative_artifacts
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy artifacts_update_owner on public.generative_artifacts
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy artifacts_delete_owner on public.generative_artifacts
  for delete to authenticated using (owner_id = (select auth.uid()));

revoke all on public.scenes from anon, authenticated;
revoke all on public.scene_members from anon, authenticated;
revoke all on public.scene_invitations from anon, authenticated;
revoke all on public.scene_command_receipts from anon, authenticated;
revoke all on public.generative_artifacts from anon, authenticated;
grant select, insert, delete on public.scenes to authenticated;
grant select on public.scene_members to authenticated;
grant select, insert, update, delete on public.generative_artifacts to authenticated;

commit;
