create type public.campus as enum ('MMC', 'BBC');
create type public.skill_level as enum ('beginner', 'intermediate', 'advanced');
create type public.game_status as enum('open', 'confirmed', 'full', 'cancelled', 'completed');
create type public.player_status as enum ('joined', 'waitlisted', 'left');


create table public.profiles(
id uuid primary key references auth.users (id) on delete cascade,
    display_name text not null,
    avatar_url text,
    campus public.campus,
    onboarding_completed_at timestamptz
);
comment on table public.profiles is 'One row per student, keyed on their sign-in id';
create table public.sports(
    code text primary key,
    name text not null
);
comment on table public.sports is 'The sports the app offers.';

create table public.locations(
    id uuid primary key default gen_random_uuid(),
    campus public.campus not null,
    name text not null,
    latitude float8 not null,
    longitude float8 not null, 
    photo_url text
);
comment on table public.locations is 'The fixed list of campus game spots';

create table public.games (
    id uuid primary key default gen_random_uuid(),
    host_id uuid not null references public.profiles (id),
    sport text not null references public.sports (code),
    location_id uuid not null references public.locations (id),
    starts_at timestamptz not null,
    duration_minutes int not null check (duration_minutes in (60, 90, 120)),
    skill_level public.skill_level not null,
    max_players int not null check (max_players > 0),
    notes text,
    status public.game_status not null default 'open'
);
comment on table public.games is 'one row per posted pickup game.';

create table public.game_players(
    game_id uuid not null references public.games (id) on delete cascade,
    user_id uuid not null references public.profiles (id) on delete cascade,
    status public.player_status not null,
    joined_at timestamptz not null default now(),
    primary key (game_id, user_id)
);
comment on table public.game_players is 'Who is in which game; spots filled is counted from here.';

create index on public.games(starts_at);
create index on public.games (location_id);
create index on public.game_players (game_id);

alter table public.profiles enable row level security;
alter table public.sports enable row level security;
alter table public.locations enable row level security;
alter table public.games enable row level security;
alter table public.game_players enable row level security;

create policy "Signed-in users can read profiles"
    on public.profiles for select to authenticated using (true);
comment on policy "Signed-in users can read profiles" on public.profiles is 'Lets players see each other.';

create policy "Users can update their own profile"
    on public.profiles for update to authenticated
    using (auth.uid() = id) with check (auth.uid() = id);
comment on policy "Users can update their own profile" on public.profiles is 'Blocks editing anyone else''s profile.';

create policy "Signed-in users can read sports"
    on public.sports for select to authenticated using (true);
comment on policy "Signed-in users can read sports" on public.sports is 'Read-only list.';

create policy "Signed-in users can read locations"
    on public.locations for select to authenticated using (true);
    comment on policy "Signed-in users can read locations" on public.locations is 'Read-only list.';

create policy "Signed-in users can read games"
    on public.games for select to authenticated using (true);
comment on policy "Signed-in users can read games" on public.games is 'Powers Discover and Map.';

create policy "Hosts can update their own games"
    on public.games for update to authenticated
    using (auth.uid() = host_id) with check (auth.uid() = host_id);
comment on policy "Hosts can update their own games" on public.games is 'Blocks editing anyone else''s game.';

create policy "Signed-in users can read players"
    on public.game_players for select to authenticated using (true);
comment on policy "Signed-in users can read players" on public.game_players is 'Shows who is going; rows are only added through the W3-05 RPCs';
