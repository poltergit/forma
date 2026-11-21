-- FORMA Phase 05: invitation and membership lifecycle RPCs
-- REVIEW DRAFT ONLY. Not applied or executed against Supabase.
-- Depends on 20261121000100_forma_core_schema.sql.
-- Raw invitation tokens are generated/hashed by a trusted Next.js server action.
-- PostgreSQL receives only a lowercase 64-character SHA-256 hex digest.

begin;

alter table public.scene_invitations
  add column accepted_by uuid references auth.users(id) on delete cascade,
  add column revoked_by uuid references auth.users(id) on delete cascade,
  add column expired_at timestamptz;

alter table public.scene_invitations
  add constraint scene_invitation_acceptance_actor_consistency
    check ((accepted_at is null) = (accepted_by is null)),
  add constraint scene_invitation_revocation_actor_consistency
    check ((revoked_at is null) = (revoked_by is null)),
  add constraint scene_invitation_terminal_states_exclusive
    check (
      not (accepted_at is not null and revoked_at is not null)
      and not (accepted_at is not null and expired_at is not null)
      and not (revoked_at is not null and expired_at is not null)
    );

create unique index scene_invitations_one_pending_per_recipient
  on public.scene_invitations(scene_id, recipient_email_normalized)
  where accepted_at is null and revoked_at is null and expired_at is null;

create or replace function public.create_scene_invitation(
  p_scene_id uuid, p_recipient_email text, p_role text,
  p_token_hash text, p_expires_at timestamptz
)
returns jsonb language plpgsql security definer set search_path = ''
as $fn$
declare
  v_actor uuid := auth.uid();
  v_scene public.scenes%rowtype;
  v_email text;
  v_invitation public.scene_invitations%rowtype;
begin
  if v_actor is null then
    raise exception using errcode = '28000', message = 'FORMA_UNAUTHENTICATED';
  end if;
  v_email := lower(btrim(coalesce(p_recipient_email, '')));
  if p_scene_id is null
     or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
     or char_length(v_email) > 320
     or p_role is null or p_role not in ('editor', 'viewer')
     or p_token_hash is null or p_token_hash !~ '^[0-9a-f]{64}
     or p_expires_at is null
     or p_expires_at < now() + interval '1 hour'
     or p_expires_at > now() + interval '7 days' then
    raise exception using errcode = '22023', message = 'FORMA_INVALID_INVITATION';
  end if;

  select s.* into v_scene from public.scenes s
  where s.id = p_scene_id for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'FORMA_NOT_FOUND';
  end if;
  if v_scene.owner_id <> v_actor then
    raise exception using errcode = '42501', message = 'FORMA_FORBIDDEN';
  end if;

  if exists (
    select 1 from auth.users u
    where u.id = v_scene.owner_id and lower(u.email) = v_email
  ) or exists (
    select 1 from auth.users u
    join public.scene_members sm on sm.user_id = u.id
    where sm.scene_id = p_scene_id and lower(u.email) = v_email
  ) then
    raise exception using errcode = '22023', message = 'FORMA_ALREADY_MEMBER';
  end if;

  update public.scene_invitations i
  set expired_at = i.expires_at
  where i.scene_id = p_scene_id
    and i.recipient_email_normalized = v_email
    and i.accepted_at is null and i.revoked_at is null
    and i.expired_at is null and i.expires_at <= now();

  if exists (
    select 1 from public.scene_invitations i
    where i.scene_id = p_scene_id
      and i.recipient_email_normalized = v_email
      and i.accepted_at is null and i.revoked_at is null
      and i.expired_at is null
  ) then
    raise exception using errcode = '23505', message = 'FORMA_INVITATION_ALREADY_PENDING';
  end if;

  insert into public.scene_invitations (
    scene_id, recipient_email_normalized, role, token_hash, invited_by, expires_at
  ) values (p_scene_id, v_email, p_role, p_token_hash, v_actor, p_expires_at)
  returning * into v_invitation;

  return jsonb_build_object(
    'invitation_id', v_invitation.id,
    'scene_id', v_invitation.scene_id,
    'recipient_email', v_invitation.recipient_email_normalized,
    'role', v_invitation.role,
    'expires_at', v_invitation.expires_at
  );
end;
$fn$;

create or replace function public.accept_scene_invitation(p_token_hash text)
returns jsonb language plpgsql security definer set search_path = ''
as $fn$
declare
  v_actor uuid := auth.uid();
  v_email text;
  v_confirmed_at timestamptz;
  v_scene_id uuid;
  v_scene public.scenes%rowtype;
  v_invitation public.scene_invitations%rowtype;
begin
  if v_actor is null then
    raise exception using errcode = '28000', message = 'FORMA_UNAUTHENTICATED';
  end if;
  if p_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception using errcode = '22023', message = 'FORMA_INVALID_INVITATION';
  end if;

  select i.scene_id into v_scene_id from public.scene_invitations i
  where i.token_hash = p_token_hash;
  if not found then
    raise exception using errcode = 'P0002', message = 'FORMA_INVITATION_NOT_FOUND';
  end if;

  -- Lock order is scene first, invitation second, matching create/revoke.
  select s.* into v_scene from public.scenes s
  where s.id = v_scene_id for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'FORMA_NOT_FOUND';
  end if;

  select i.* into v_invitation from public.scene_invitations i
  where i.token_hash = p_token_hash and i.scene_id = v_scene_id
  for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'FORMA_INVITATION_NOT_FOUND';
  end if;

  if v_invitation.accepted_at is not null then
    if v_invitation.accepted_by = v_actor then
      return jsonb_build_object(
        'invitation_id', v_invitation.id, 'scene_id', v_scene_id,
        'role', v_invitation.role, 'duplicate', true
      );
    end if;
    raise exception using errcode = '22023', message = 'FORMA_INVITATION_ALREADY_USED';
  end if;

  if v_invitation.revoked_at is not null
     or v_invitation.expired_at is not null
     or v_invitation.expires_at <= now() then
    raise exception using errcode = '22023', message = 'FORMA_INVITATION_UNAVAILABLE';
  end if;

  select lower(u.email), u.email_confirmed_at
  into v_email, v_confirmed_at
  from auth.users u where u.id = v_actor;
  if v_email is null or v_confirmed_at is null then
    raise exception using errcode = '42501', message = 'FORMA_VERIFIED_EMAIL_REQUIRED';
  end if;
  if v_email <> v_invitation.recipient_email_normalized then
    raise exception using errcode = '42501', message = 'FORMA_INVITATION_EMAIL_MISMATCH';
  end if;
  if v_scene.owner_id = v_actor or exists (
    select 1 from public.scene_members sm
    where sm.scene_id = v_scene_id and sm.user_id = v_actor
  ) then
    raise exception using errcode = '22023', message = 'FORMA_ALREADY_MEMBER';
  end if;

  insert into public.scene_members(scene_id, user_id, role, invited_by)
  values (v_scene_id, v_actor, v_invitation.role, v_invitation.invited_by);

  update public.scene_invitations
  set accepted_at = now(), accepted_by = v_actor
  where id = v_invitation.id;

  return jsonb_build_object(
    'invitation_id', v_invitation.id, 'scene_id', v_scene_id,
    'role', v_invitation.role, 'duplicate', false
  );
end;
$fn$;

create or replace function public.revoke_scene_invitation(
  p_scene_id uuid, p_invitation_id uuid
)
returns jsonb language plpgsql security definer set search_path = ''
as $fn$
declare
  v_actor uuid := auth.uid();
  v_scene public.scenes%rowtype;
  v_invitation public.scene_invitations%rowtype;
begin
  if v_actor is null then
    raise exception using errcode = '28000', message = 'FORMA_UNAUTHENTICATED';
  end if;
  if p_scene_id is null or p_invitation_id is null then
    raise exception using errcode = '22023', message = 'FORMA_INVALID_INVITATION';
  end if;

  select s.* into v_scene from public.scenes s
  where s.id = p_scene_id for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'FORMA_NOT_FOUND';
  end if;
  if v_scene.owner_id <> v_actor then
    raise exception using errcode = '42501', message = 'FORMA_FORBIDDEN';
  end if;

  select i.* into v_invitation from public.scene_invitations i
  where i.id = p_invitation_id and i.scene_id = p_scene_id for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'FORMA_INVITATION_NOT_FOUND';
  end if;
  if v_invitation.accepted_at is not null then
    raise exception using errcode = '22023', message = 'FORMA_INVITATION_ALREADY_ACCEPTED';
  end if;
  if v_invitation.revoked_at is not null or v_invitation.expired_at is not null then
    return jsonb_build_object('invitation_id', p_invitation_id, 'duplicate', true);
  end if;

  update public.scene_invitations
  set revoked_at = now(), revoked_by = v_actor
  where id = p_invitation_id;
  return jsonb_build_object('invitation_id', p_invitation_id, 'duplicate', false);
end;
$fn$;

create or replace function public.remove_scene_member(p_scene_id uuid, p_user_id uuid)
returns jsonb language plpgsql security definer set search_path = ''
as $fn$
declare
  v_actor uuid := auth.uid();
  v_scene public.scenes%rowtype;
  v_removed_count integer;
begin
  if v_actor is null then
    raise exception using errcode = '28000', message = 'FORMA_UNAUTHENTICATED';
  end if;
  if p_scene_id is null or p_user_id is null then
    raise exception using errcode = '22023', message = 'FORMA_INVALID_MEMBER';
  end if;

  -- Serializes member removal against apply_scene_command on the same scene.
  select s.* into v_scene from public.scenes s
  where s.id = p_scene_id for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'FORMA_NOT_FOUND';
  end if;
  if v_scene.owner_id <> v_actor then
    raise exception using errcode = '42501', message = 'FORMA_FORBIDDEN';
  end if;
  if p_user_id = v_scene.owner_id then
    raise exception using errcode = '22023', message = 'FORMA_OWNER_CANNOT_BE_REMOVED';
  end if;

  delete from public.scene_members
  where scene_id = p_scene_id and user_id = p_user_id;
  get diagnostics v_removed_count = row_count;

  return jsonb_build_object(
    'scene_id', p_scene_id, 'user_id', p_user_id, 'removed', v_removed_count > 0
  );
end;
$fn$;

revoke all on function public.create_scene_invitation(uuid, text, text, text, timestamptz) from public, anon;
revoke all on function public.accept_scene_invitation(text) from public, anon;
revoke all on function public.revoke_scene_invitation(uuid, uuid) from public, anon;
revoke all on function public.remove_scene_member(uuid, uuid) from public, anon;

grant execute on function public.create_scene_invitation(uuid, text, text, text, timestamptz) to authenticated;
grant execute on function public.accept_scene_invitation(text) to authenticated;
grant execute on function public.revoke_scene_invitation(uuid, uuid) to authenticated;
grant execute on function public.remove_scene_member(uuid, uuid) to authenticated;

commit;