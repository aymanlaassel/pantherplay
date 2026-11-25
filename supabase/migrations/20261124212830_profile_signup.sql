-- W5-04: create the profile at sign-up, store sports and levels, keep games when a host is deleted.

-- SIGN-UP: a trigger (code the database runs by itself) that adds a profile for every new user.
-- `security definer`: sign-up has no rights on profiles, so this runs with the owner's rights.
-- `search_path = ''`: every table is named in full, so nobody can swap in a look-alike.
create function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (id, display_name, avatar_url)
    values (
        new.id,
        -- The first one that isn't blank: Google name, start of the email, a last resort.
        -- display_name is required, so without a value the sign-up itself would fail.
        coalesce(
            nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
            nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
            nullif(split_part(new.email, '@', 1), ''),
            'Student'
        ),
        -- Some Google accounts use `picture` instead of `avatar_url` (same as auth.ts).
        coalesce(
            nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
            nullif(new.raw_user_meta_data ->> 'picture', '')
        )
    );
    return new;
end;
$$;
comment on function public.create_profile_for_new_user is 'Adds a profile for each new sign-in account.';
revoke execute on function public.create_profile_for_new_user from public, anon, authenticated;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.create_profile_for_new_user();

-- PROFILE SPORTS: which sports a student plays and at what level.
create table public.profile_sports (
    user_id uuid not null references public.profiles (id) on delete cascade,
    sport text not null references public.sports (code),
    level public.skill_level not null,
    primary key (user_id, sport)
);
comment on table public.profile_sports is 'Which sports each student plays, and at what level.';

alter table public.profile_sports enable row level security;
grant select, insert, update, delete on public.profile_sports to authenticated;

create policy "Signed-in users can read profile sports"
    on public.profile_sports for select to authenticated using (true);
comment on policy "Signed-in users can read profile sports" on public.profile_sports is 'Lets players see each other''s sports.';

create policy "Users can add their own sports"
    on public.profile_sports for insert to authenticated
    with check (auth.uid() = user_id);
comment on policy "Users can add their own sports" on public.profile_sports is 'Blocks adding sports for anyone else.';

create policy "Users can update their own sports"
    on public.profile_sports for update to authenticated
    using (auth.uid() = user_id) with check (auth.uid() = user_id);
comment on policy "Users can update their own sports" on public.profile_sports is 'Blocks editing anyone else''s sports, or handing a row to someone else.';

create policy "Users can remove their own sports"
    on public.profile_sports for delete to authenticated
    using (auth.uid() = user_id);
comment on policy "Users can remove their own sports" on public.profile_sports is 'Blocks removing anyone else''s sports.';

-- HOSTS: deleting a host keeps their games, with no host (decided Nov 10).
alter table public.games alter column host_id drop not null;
alter table public.games drop constraint games_host_id_fkey;
alter table public.games add constraint games_host_id_fkey
    foreign key (host_id) references public.profiles (id) on delete set null;
comment on column public.games.host_id is 'Null when the host deleted their account.';
