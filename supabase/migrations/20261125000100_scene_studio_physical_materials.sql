-- Bounded physical material properties for Scene Studio; legacy fields remain optional.
begin;
create or replace function public.is_valid_scene_studio_object(p_object jsonb)
returns boolean language plpgsql immutable set search_path = ''
as $fn$
declare
  v_scale numeric; v_roughness numeric; v_metalness numeric; v_transmission numeric;
  v_thickness numeric; v_ior numeric; v_clearcoat numeric; v_clearcoat_roughness numeric; v_opacity numeric;
begin
  if jsonb_typeof(p_object) is distinct from 'object'
     or jsonb_typeof(p_object -> 'id') is distinct from 'number'
     or (p_object ->> 'id') !~ '^[0-9]+$' or (p_object ->> 'id')::numeric < 1
     or jsonb_typeof(p_object -> 'name') is distinct from 'string'
     or jsonb_typeof(p_object -> 'kind') is distinct from 'string'
     or char_length(btrim(p_object ->> 'name')) not between 1 and 80
     or p_object ->> 'kind' not in ('box','sphere','torus')
     or jsonb_typeof(p_object -> 'color') is distinct from 'string' or (p_object ->> 'color') !~ '^#[0-9A-Fa-f]{6}$'
     or jsonb_typeof(p_object -> 'emissive') is distinct from 'string' or (p_object ->> 'emissive') !~ '^#[0-9A-Fa-f]{6}$'
     or jsonb_typeof(p_object -> 'roughness') is distinct from 'number'
     or jsonb_typeof(p_object -> 'metalness') is distinct from 'number'
     or jsonb_typeof(p_object -> 'scale') is distinct from 'number'
     or jsonb_typeof(p_object -> 'visible') is distinct from 'boolean'
     or not public.is_valid_scene_studio_vec3(p_object -> 'position')
     or not public.is_valid_scene_studio_vec3(p_object -> 'rotation') then return false; end if;
  if (p_object ? 'transmission' and jsonb_typeof(p_object -> 'transmission') is distinct from 'number')
     or (p_object ? 'thickness' and jsonb_typeof(p_object -> 'thickness') is distinct from 'number')
     or (p_object ? 'ior' and jsonb_typeof(p_object -> 'ior') is distinct from 'number')
     or (p_object ? 'clearcoat' and jsonb_typeof(p_object -> 'clearcoat') is distinct from 'number')
     or (p_object ? 'clearcoatRoughness' and jsonb_typeof(p_object -> 'clearcoatRoughness') is distinct from 'number')
     or (p_object ? 'opacity' and jsonb_typeof(p_object -> 'opacity') is distinct from 'number') then return false; end if;
  v_scale := (p_object ->> 'scale')::numeric; v_roughness := (p_object ->> 'roughness')::numeric;
  v_metalness := (p_object ->> 'metalness')::numeric; v_transmission := coalesce((p_object ->> 'transmission')::numeric,0);
  v_thickness := coalesce((p_object ->> 'thickness')::numeric,0); v_ior := coalesce((p_object ->> 'ior')::numeric,1.5);
  v_clearcoat := coalesce((p_object ->> 'clearcoat')::numeric,0);
  v_clearcoat_roughness := coalesce((p_object ->> 'clearcoatRoughness')::numeric,0); v_opacity := coalesce((p_object ->> 'opacity')::numeric,1);
  return v_scale > 0 and v_scale <= 100 and v_roughness between 0 and 1 and v_metalness between 0 and 1
    and v_transmission between 0 and 1 and v_thickness between 0 and 5 and v_ior between 1 and 2.333
    and v_clearcoat between 0 and 1 and v_clearcoat_roughness between 0 and 1 and v_opacity between 0 and 1;
end;
$fn$;
commit;
