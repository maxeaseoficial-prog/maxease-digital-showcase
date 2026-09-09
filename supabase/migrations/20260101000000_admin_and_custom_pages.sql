create extension if not exists pgcrypto;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role text not null check (role = 'admin'),
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

drop policy if exists "user_roles_select_self_or_admin" on public.user_roles;
create policy "user_roles_select_self_or_admin"
on public.user_roles
for select
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'admin'
  )
);

drop policy if exists "user_roles_manage_admin_only" on public.user_roles;
create policy "user_roles_manage_admin_only"
on public.user_roles
for all
using (
  exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'admin'
  )
);

create or replace function public.ensure_first_admin_role(_user_id uuid)
returns public.user_roles
language plpgsql
security definer
set search_path = public
as $$
declare
  role_record public.user_roles;
begin
  if exists (select 1 from public.user_roles where role = 'admin') then
    raise exception 'admin role already exists';
  end if;

  insert into public.user_roles (user_id, role)
  values (_user_id, 'admin')
  returning * into role_record;

  return role_record;
end;
$$;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.user_roles to authenticated;

grant execute on function public.ensure_first_admin_role(uuid) to service_role;

drop table if exists public.custom_pages cascade;

create table public.custom_pages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  active boolean not null default true,
  desktop_file_path text,
  mobile_file_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_custom_pages_active_slug
  on public.custom_pages (active, slug);

create or replace function public.set_custom_pages_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_custom_pages_updated_at on public.custom_pages;
create trigger trg_custom_pages_updated_at
before update on public.custom_pages
for each row
execute function public.set_custom_pages_updated_at();

alter table public.custom_pages enable row level security;

drop policy if exists "custom_pages_admin_all" on public.custom_pages;
create policy "custom_pages_admin_all"
on public.custom_pages
for all
using (
  exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'admin'
  )
);

drop policy if exists "custom_pages_public_read_active" on public.custom_pages;
create policy "custom_pages_public_read_active"
on public.custom_pages
for select
using (active = true);

insert into storage.buckets (id, name, public)
values ('custom-pages', 'custom-pages', false)
on conflict (id) do update set public = false;

drop policy if exists "storage_custom_pages_admin_all" on storage.objects;
create policy "storage_custom_pages_admin_all"
on storage.objects
for all
using (
  bucket_id = 'custom-pages'
  and exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'admin'
  )
)
with check (
  bucket_id = 'custom-pages'
  and exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'admin'
  )
);

grant select, insert, update, delete on public.custom_pages to authenticated;
