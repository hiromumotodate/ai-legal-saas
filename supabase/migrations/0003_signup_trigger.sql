-- Auto-create an organization + profile when a new user signs up.
-- This trigger runs with elevated privileges (SECURITY DEFINER).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_org_name text;
  v_slug text;
begin
  v_org_name := coalesce(new.raw_user_meta_data->>'organization_name', split_part(new.email, '@', 1) || ' 法律事務所');
  v_slug := lower(regexp_replace(coalesce(new.raw_user_meta_data->>'organization_slug', split_part(new.email, '@', 1)), '[^a-z0-9]+', '-', 'g')) || '-' || substring(new.id::text, 1, 6);

  insert into public.organizations (name, slug)
  values (v_org_name, v_slug)
  returning id into v_org_id;

  insert into public.profiles (id, organization_id, email, full_name, role)
  values (
    new.id,
    v_org_id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    'owner'
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
