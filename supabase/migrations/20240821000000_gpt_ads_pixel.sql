create type public.gpt_ads_status as enum ('active', 'inactive');

create table public.gpt_ads_config (
    id uuid primary key default gen_random_uuid(),
    pixel_id text,
    config_code text,
    status public.gpt_ads_status not null default 'inactive',
    whatsapp_contact_enabled boolean not null default true,
    lead_form_submitted_enabled boolean not null default true,
    budget_requested_enabled boolean not null default true,
    updated_at timestamp with time zone default now(),
    updated_by uuid references auth.users(id)
);

-- Ensure only one config exists
create unique index single_config_idx on public.gpt_ads_config ((id is not null));

grant select on public.gpt_ads_config to authenticated;
grant all on public.gpt_ads_config to service_role;

alter table public.gpt_ads_config enable row level security;

create policy "Admins can manage gpt_ads_config"
on public.gpt_ads_config
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Authenticated users can read gpt_ads_config"
on public.gpt_ads_config
for select
to authenticated
using (true);

-- Also allow anon to read the active config for the pixel to work on the frontend
grant select on public.gpt_ads_config to anon;
create policy "Public can read gpt_ads_config"
on public.gpt_ads_config
for select
to anon
using (true);
