-- ============================================================================
--  MANIGUADEBABY — Script SQL complet (modèle UUID retenu)
--  Cible : Supabase / PostgreSQL 14+
--  Usage : Supabase > SQL Editor > coller > Run
--          ou  psql "$DATABASE_URL" -f maniguadebaby-v1.sql
--
--  Section 1 : vos cinq tables (profiles, artists, genres, tracks, favorites)
--  Section 2 : extensions du catalogue (albums, videos, playlists)
--  Section 3 : éditorial (articles, banners, newsletter)
--  Section 4 : historique d'écoute (play_events)
--  Section 5 : socle Version 2 (abonnements, Mobile Money, royalties)
--  Section 6 : index, triggers, vues métier
--  Section 7 : Row Level Security + buckets de stockage
--  Section 8 : jeu de données minimal
-- ============================================================================

begin;

create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "citext";     -- emails insensibles à la casse
create extension if not exists "pg_trgm";    -- recherche floue

-- ----------------------------------------------------------------------------
-- SECTION 1 — VOTRE MODÈLE
-- ----------------------------------------------------------------------------

-- 1.1 Profils utilisateurs (liés à l'authentification Supabase)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email citext unique not null,
  role text default 'fan' check (role in ('fan', 'artist', 'admin', 'superadmin')),
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Hors Supabase (PostgreSQL local / manette Drizzle), retirer la FK auth.users :
--   alter table public.profiles drop constraint profiles_id_fkey;
--   alter table public.profiles alter column id set default gen_random_uuid();

-- Champs d'expérience ajoutés par Maniguadebaby (tous optionnels)
alter table public.profiles add column if not exists password_hash text;
alter table public.profiles add column if not exists display_name text not null default 'Auditeur';
alter table public.profiles add column if not exists avatar_url text not null default '';
alter table public.profiles add column if not exists city text not null default '';
alter table public.profiles add column if not exists country text not null default 'Côte d''Ivoire';
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists bio text not null default '';
alter table public.profiles add column if not exists is_verified boolean not null default false;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

-- Création automatique du profil à l'inscription Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'fan'),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 1.2 Artistes
create table if not exists public.artists (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  bio text,
  avatar_url text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Colonnes éditoriales utilisées par le site (fiche artiste riche)
alter table public.artists add column if not exists slug text unique;
alter table public.artists add column if not exists country text not null default 'Côte d''Ivoire';
alter table public.artists add column if not exists city text not null default 'Abidjan';
alter table public.artists add column if not exists banner_url text not null default '';
alter table public.artists add column if not exists accent text not null default '#FF6A1A';
alter table public.artists add column if not exists verified boolean not null default false;
alter table public.artists add column if not exists followers integer not null default 0;
alter table public.artists add column if not exists monthly_listeners integer not null default 0;
alter table public.artists add column if not exists instagram text not null default '';
alter table public.artists add column if not exists youtube text not null default '';
alter table public.artists add column if not exists tiktok text not null default '';
alter table public.artists add column if not exists position integer not null default 0;
alter table public.artists add column if not exists updated_at timestamptz not null default now();

-- cover_url = alias applicatif de avatar_url (le lecteur et les fiches lisent cover_url)
alter table public.artists add column if not exists cover_url text not null default '';

-- 1.3 Genres musicaux (référentiel léger : SERIAL assumé)
create table if not exists public.genres (
  id serial primary key,
  name text unique not null,
  slug text unique not null
);

alter table public.genres add column if not exists description text not null default '';
alter table public.genres add column if not exists color_from text not null default '#F97316';
alter table public.genres add column if not exists color_to text not null default '#7C2D12';
alter table public.genres add column if not exists emoji text not null default '🎵';
alter table public.genres add column if not exists position integer not null default 0;

-- 1.4 Morceaux
create table if not exists public.tracks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  audio_url text not null,
  duration int,                                   -- en secondes
  cover_url text,
  artist_id uuid references public.artists(id) on delete cascade not null,
  genre_id int references public.genres(id) on delete set null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.tracks add column if not exists slug text unique;
alter table public.tracks add column if not exists album_id uuid;      -- FK posée en section 2
alter table public.tracks add column if not exists duration_seconds integer not null default 210;
alter table public.tracks add column if not exists plays integer not null default 0;
alter table public.tracks add column if not exists likes integer not null default 0;
alter table public.tracks add column if not exists release_date date not null default current_date;
alter table public.tracks add column if not exists featured boolean not null default false;
alter table public.tracks add column if not exists trending boolean not null default false;
alter table public.tracks add column if not exists explicit boolean not null default false;
alter table public.tracks add column if not exists position integer not null default 0;
alter table public.tracks add column if not exists updated_at timestamptz not null default now();

-- duration (votre nom) reste la référence ; duration_seconds est l'alias applicatif
create or replace function public.sync_track_duration()
returns trigger language plpgsql as $$
begin
  if new.duration is distinct from new.duration_seconds then
    new.duration_seconds := coalesce(new.duration, new.duration_seconds);
  end if;
  return new;
end; $$;

drop trigger if exists tracks_sync_duration on public.tracks;
create trigger tracks_sync_duration before insert or update on public.tracks
  for each row execute function public.sync_track_duration();

-- 1.5 Favoris (likes)
create table if not exists public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  track_id uuid references public.tracks(id) on delete cascade,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique (user_id, track_id)                      -- un seul « j'aime » par utilisateur et par morceau
);

-- Extension V1 : cœurs anonymes (avant inscription) + favoris multi-entités.
-- item_type = 'track' et item_id = track_id reproduisent exactement votre modèle.
alter table public.favorites add column if not exists visitor_id text;
alter table public.favorites add column if not exists item_type text not null default 'track';
alter table public.favorites add column if not exists item_id uuid;
alter table public.favorites add constraint favorites_owner_check
  check (user_id is not null or visitor_id is not null) not valid;

create unique index if not exists favorites_visitor_item_uidx
  on public.favorites (visitor_id, item_type, item_id) where visitor_id is not null;

-- Fusion automatique des cœurs anonymes lors de la première connexion
create or replace function public.merge_visitor_favorites(p_user uuid, p_visitor text)
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.favorites f
  using public.profiles p
  where f.visitor_id = p_visitor and f.user_id is null
    and p.id = p_user and p.item_type = f.item_type and p.item_id = f.item_id;
  update public.favorites set user_id = p_user, visitor_id = null
  where visitor_id = p_visitor and user_id is null;
end; $$;

-- ----------------------------------------------------------------------------
-- SECTION 2 — EXTENSIONS DU CATALOGUE
-- ----------------------------------------------------------------------------
create table if not exists public.albums (
  id uuid default gen_random_uuid() primary key,
  artist_id uuid references public.artists(id) on delete cascade not null,
  title text not null,
  slug text unique not null,
  description text not null default '',
  cover_url text not null default '',
  album_type text not null default 'album'
    check (album_type in ('album','ep','single','mixtape','live')),
  release_date date not null default current_date,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz not null default now()
);

alter table public.tracks
  drop constraint if exists tracks_album_id_fkey;
alter table public.tracks
  add constraint tracks_album_id_fkey foreign key (album_id)
  references public.albums(id) on delete set null;

create table if not exists public.videos (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  artist_id uuid references public.artists(id) on delete cascade not null,
  track_id uuid references public.tracks(id) on delete set null,
  video_url text not null,
  thumbnail_url text not null default '',
  description text not null default '',
  duration_seconds integer not null default 210,
  views integer not null default 0,
  release_date date not null default current_date,
  featured boolean not null default false,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.playlists (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  description text not null default '',
  cover_url text not null default '',
  curator text not null default 'Maniguadebaby',
  owner_id uuid references public.profiles(id) on delete set null,   -- null = playlist éditoriale
  is_public boolean not null default true,
  position integer not null default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.playlist_tracks (
  playlist_id uuid references public.playlists(id) on delete cascade,
  track_id uuid references public.tracks(id) on delete cascade,
  position integer not null default 0,
  primary key (playlist_id, track_id)
);

create unique index if not exists tracks_artist_position_uidx on public.tracks (artist_id, position);

-- ----------------------------------------------------------------------------
-- SECTION 3 — ÉDITORIAL & MISE EN AVANT
-- ----------------------------------------------------------------------------
create table if not exists public.articles (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  excerpt text not null default '',
  content text not null default '',
  cover_url text not null default '',
  author text not null default 'Rédaction Maniguadebaby',
  category text not null default 'Sorties',
  views integer not null default 0,
  status text not null default 'published' check (status in ('draft','published','archived')),
  published_at timestamptz default timezone('utc'::text, now()) not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.banners (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  subtitle text not null default '',
  tag text not null default 'Nouveauté',
  image_url text not null default '',
  cta_label text not null default 'Écouter',
  cta_href text not null default '/',
  track_id uuid references public.tracks(id) on delete set null,
  active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.newsletter_signups (
  id serial primary key,
  email citext unique not null,
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- ----------------------------------------------------------------------------
-- SECTION 4 — HISTORIQUE D'ÉCOUTE
-- ----------------------------------------------------------------------------
create table if not exists public.play_events (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  visitor_id text,
  track_id uuid references public.tracks(id) on delete cascade not null,
  seconds integer not null default 0,
  source text not null default 'web' check (source in ('web','mobile','embed')),
  played_at timestamptz default timezone('utc'::text, now()) not null
);

-- ----------------------------------------------------------------------------
-- SECTION 5 — SOCLE VERSION 2 (monétisation, déjà créé)
-- ----------------------------------------------------------------------------
create table if not exists public.artist_accounts (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid unique references public.profiles(id) on delete cascade not null,
  artist_id uuid unique references public.artists(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  payout_phone text not null default '',
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.subscription_plans (
  id serial primary key,
  code text unique not null,
  name text not null,
  price_xof integer not null,
  duration_days integer not null,
  offline_mode boolean not null default false,
  no_ads boolean not null default true,
  active boolean not null default true
);

create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  plan_id integer references public.subscription_plans(id) not null,
  status text not null default 'pending'
    check (status in ('active','expired','cancelled','pending')),
  starts_at timestamptz default timezone('utc'::text, now()) not null,
  expires_at timestamptz not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  provider text not null check (provider in ('wave','orange_money','mtn_momo','moov_money','card')),
  provider_ref text,
  phone_number text not null,
  amount_xof integer not null,
  status text not null default 'initiated'
    check (status in ('initiated','pending','succeeded','failed','refunded')),
  raw_response jsonb not null default '{}'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.royalty_ledger (
  id bigserial primary key,
  artist_id uuid references public.artists(id) on delete cascade not null,
  track_id uuid references public.tracks(id) on delete set null,
  period text not null,                    -- ex : 2026-03
  plays integer not null default 0,
  amount_xof integer not null default 0,
  settled boolean not null default false,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- ----------------------------------------------------------------------------
-- SECTION 6 — INDEX, TRIGGERS, VUES
-- ----------------------------------------------------------------------------
create index if not exists tracks_artist_idx     on public.tracks (artist_id);
create index if not exists tracks_album_idx      on public.tracks (album_id);
create index if not exists tracks_genre_idx      on public.tracks (genre_id);
create index if not exists tracks_plays_idx      on public.tracks (plays desc);
create index if not exists tracks_release_idx    on public.tracks (release_date desc);
create index if not exists tracks_title_trgm_idx on public.tracks using gin (title gin_trgm_ops);
create index if not exists artists_name_trgm_idx on public.artists using gin (name gin_trgm_ops);
create index if not exists albums_artist_idx     on public.albums (artist_id, release_date desc);
create index if not exists videos_artist_idx     on public.videos (artist_id, views desc);
create index if not exists playlist_tracks_idx   on public.playlist_tracks (track_id);
create index if not exists articles_status_idx   on public.articles (status, published_at desc);
create index if not exists favorites_user_idx    on public.favorites (user_id, created_at desc);
create index if not exists play_events_track_idx on public.play_events (track_id, played_at desc);
create index if not exists play_events_user_idx  on public.play_events (user_id, played_at desc);
create index if not exists payments_user_idx     on public.payments (user_id, created_at desc);
create index if not exists subscriptions_idx     on public.subscriptions (status, expires_at);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

do $$
declare t text;
begin
  foreach t in array array['profiles','artists','albums','tracks','videos','playlists','articles','banners','payments']
  loop
    execute format('drop trigger if exists %I on public.%I', t || '_updated_at', t);
    execute format('create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
                   t || '_updated_at', t);
  end loop;
end $$;

create or replace view public.v_track_chart as
select t.id, t.title, t.slug, t.cover_url, t.duration_seconds, t.plays, t.likes,
       a.id as artist_id, a.name as artist_name, a.slug as artist_slug,
       g.name as genre_name, g.slug as genre_slug
from public.tracks t
join public.artists a on a.id = t.artist_id
left join public.genres g on g.id = t.genre_id
order by t.plays desc;

create or replace view public.v_artist_stats as
select a.id, a.name, a.slug, a.cover_url,
       count(t.id) as track_count,
       coalesce(sum(t.plays), 0) as total_plays,
       coalesce(sum(t.likes), 0) as total_likes
from public.artists a
left join public.tracks t on t.artist_id = a.id
group by a.id;

create or replace view public.v_daily_plays as
select date_trunc('day', played_at) as day, count(*) as plays, count(distinct track_id) as tracks
from public.play_events group by 1 order by 1 desc;

-- ----------------------------------------------------------------------------
-- SECTION 7 — ROW LEVEL SECURITY & STOCKAGE
-- ----------------------------------------------------------------------------
alter table public.profiles           enable row level security;
alter table public.artists            enable row level security;
alter table public.genres             enable row level security;
alter table public.tracks             enable row level security;
alter table public.favorites          enable row level security;
alter table public.play_events        enable row level security;
alter table public.albums             enable row level security;
alter table public.videos             enable row level security;
alter table public.playlists          enable row level security;
alter table public.playlist_tracks    enable row level security;
alter table public.articles           enable row level security;
alter table public.banners            enable row level security;
alter table public.newsletter_signups enable row level security;
alter table public.artist_accounts    enable row level security;
alter table public.subscriptions      enable row level security;
alter table public.payments           enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.royalty_ledger     enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','superadmin'));
$$;

-- Catalogue : lecture publique, écriture admin
do $$
declare t text;
begin
  foreach t in array array['artists','genres','tracks','albums','videos','banners']
  loop
    execute format('drop policy if exists %I on public.%I', t || '_public_read', t);
    execute format('create policy %I on public.%I for select using (true)', t || '_public_read', t);
    execute format('drop policy if exists %I on public.%I', t || '_admin_write', t);
    execute format('create policy %I on public.%I for all using (public.is_admin()) with check (public.is_admin())',
                   t || '_admin_write', t);
  end loop;
end $$;

drop policy if exists articles_public_read on public.articles;
create policy articles_public_read on public.articles for select
  using (status = 'published' or public.is_admin());
drop policy if exists articles_admin_write on public.articles;
create policy articles_admin_write on public.articles for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists playlists_read on public.playlists;
create policy playlists_read on public.playlists for select
  using (is_public or owner_id = auth.uid() or public.is_admin());
drop policy if exists playlists_write on public.playlists;
create policy playlists_write on public.playlists for all
  using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists favorites_owner on public.favorites;
create policy favorites_owner on public.favorites for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists play_events_read on public.play_events;
create policy play_events_read on public.play_events for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists play_events_insert on public.play_events;
create policy play_events_insert on public.play_events for insert with check (true);

drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update using (id = auth.uid() or public.is_admin());

drop policy if exists newsletter_insert on public.newsletter_signups;
create policy newsletter_insert on public.newsletter_signups for insert with check (true);

insert into storage.buckets (id, name, public) values
  ('audio','audio',false), ('covers','covers',true), ('banners','banners',true), ('clips','clips',false)
on conflict (id) do nothing;

drop policy if exists media_public_read on storage.objects;
create policy media_public_read on storage.objects for select using (bucket_id in ('covers','banners'));
drop policy if exists media_admin_write on storage.objects;
create policy media_admin_write on storage.objects for insert
  with check (bucket_id in ('audio','clips','covers','banners') and public.is_admin());

-- ----------------------------------------------------------------------------
-- SECTION 8 — JEU DE DONNÉES MINIMAL
-- ----------------------------------------------------------------------------
-- Genres musicaux officiels de Maniguadebaby (fournis par la direction)
insert into public.genres (name, slug) values
  ('Mandingue', 'mandingue'),
  ('Mbalax', 'mbalax'),
  ('Zouglou', 'zouglou'),
  ('Coupé-Décalé', 'coupe-decale'),
  ('Highlife', 'highlife'),
  ('Afro Trap', 'afro-trap'),
  ('Tradi Moderne', 'tradi-moderne')
on conflict (name) do nothing;

-- Habillage visuel des tuiles (couleurs, emoji, description)
insert into public.genres (slug, description, color_from, color_to, emoji, position) values
  ('mandingue',      'Kora, balafon et griots : le Mali, la Guinée et le Sénégal mandingue.', '#F5C64B', '#5C4400', '🪕', 1),
  ('mbalax',         'Le sabar de Dakar : guitare, tama et tempo qui ne lâche pas.',            '#FFD97A', '#6B4E00', '🥁', 2),
  ('zouglou',        'La parole du peuple, née des cités universitaires d''Abidjan.',          '#F2B705', '#4A3600', '🗣️', 3),
  ('coupe-decale',   'Le son des maquis : ambianceur, dédicaces et pas de danse.',              '#FFC24B', '#5A3A00', '🕺', 4),
  ('highlife',       'Guitares du Ghana : la fête élégante, ballables et cornets.',             '#E8C56B', '#4F3B12', '🎺', 5),
  ('afro-trap',      '808 lourdes, flows nouchi et drill panafricaine.',                        '#D9B45B', '#3A2C08', '⚡', 6),
  ('tradi-moderne',  'Traditions revisitées : mapouka, chants de terroir, gospel et roots.',    '#C9A227', '#2E2306', '🌍', 7)
on conflict (slug) do nothing;

insert into public.subscription_plans (code, name, price_xof, duration_days, offline_mode) values
  ('daily','Pass Journée',100,1,false),
  ('weekly','Pass Semaine',500,7,false),
  ('monthly','Premium Mois',1500,30,true),
  ('yearly','Premium An',12000,365,true)
on conflict (code) do nothing;

commit;

-- Vérification rapide :
--   select table_name from information_schema.tables where table_schema='public' order by 1;
--   select * from public.v_artist_stats;
