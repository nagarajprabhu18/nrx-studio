create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  role text not null default 'customer' check (role in ('customer','admin')),
  must_change_password boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 120),
  description text not null check (char_length(description) between 5 and 1200),
  category text not null check (char_length(category) between 2 and 60),
  image_url text,
  live_url text,
  featured boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists projects_public_featured_idx on public.projects (published, featured desc, created_at desc);

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  description text not null check (char_length(description) between 5 and 1000),
  category text not null check (char_length(category) between 2 and 60),
  image_url text,
  preview_url text,
  price numeric(10,2) not null default 0 check (price >= 0),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists templates_public_idx on public.templates (published, created_at desc);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  rating smallint not null check (rating between 1 and 5),
  message text not null check (char_length(message) between 12 and 1000),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
create index if not exists reviews_approved_idx on public.reviews (status, created_at desc);
create index if not exists reviews_pending_idx on public.reviews (created_at desc) where status = 'pending';

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  email text not null check (char_length(email) between 3 and 160),
  interest text not null check (char_length(interest) between 2 and 80),
  message text not null check (char_length(message) between 15 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists enquiries_recent_idx on public.enquiries (created_at desc);

create table if not exists public.site_settings (
  key text primary key check (char_length(key) between 1 and 80),
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public
as $$ begin new.updated_at = now(); return new; end; $$;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger projects_set_updated_at before update on public.projects for each row execute function public.set_updated_at();
create trigger templates_set_updated_at before update on public.templates for each row execute function public.set_updated_at();
create trigger settings_set_updated_at before update on public.site_settings for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$ select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin'); $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.templates enable row level security;
alter table public.reviews enable row level security;
alter table public.enquiries enable row level security;
alter table public.site_settings enable row level security;

create policy "Profiles can read their own row" on public.profiles for select to authenticated using (id = (select auth.uid()) or public.is_admin());
create policy "Admins manage profiles" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Public reads published projects" on public.projects for select to anon, authenticated using (published or public.is_admin());
create policy "Admins insert projects" on public.projects for insert to authenticated with check (public.is_admin());
create policy "Admins update projects" on public.projects for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete projects" on public.projects for delete to authenticated using (public.is_admin());

create policy "Public reads published templates" on public.templates for select to anon, authenticated using (published or public.is_admin());
create policy "Admins insert templates" on public.templates for insert to authenticated with check (public.is_admin());
create policy "Admins update templates" on public.templates for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete templates" on public.templates for delete to authenticated using (public.is_admin());

create policy "Public reads approved reviews" on public.reviews for select to anon, authenticated using (status = 'approved' or public.is_admin());
create policy "Admins update reviews" on public.reviews for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete reviews" on public.reviews for delete to authenticated using (public.is_admin());

create policy "Admins read enquiries" on public.enquiries for select to authenticated using (public.is_admin());
create policy "Admins delete enquiries" on public.enquiries for delete to authenticated using (public.is_admin());

create policy "Public reads settings" on public.site_settings for select to anon, authenticated using (true);
create policy "Admins write settings" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('project-media','project-media',true,5242880,array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = excluded.allowed_mime_types;
create policy "Public can view project media" on storage.objects for select to anon, authenticated using (bucket_id = 'project-media');
create policy "Admins upload project media" on storage.objects for insert to authenticated with check (bucket_id = 'project-media' and public.is_admin());
create policy "Admins update project media" on storage.objects for update to authenticated using (bucket_id = 'project-media' and public.is_admin()) with check (bucket_id = 'project-media' and public.is_admin());
create policy "Admins delete project media" on storage.objects for delete to authenticated using (bucket_id = 'project-media' and public.is_admin());
