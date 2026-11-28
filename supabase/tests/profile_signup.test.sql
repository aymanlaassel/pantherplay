-- W5-04 tests: profiles made at sign-up, whose sports you can change, and deleting a host.
-- Run with `supabase test db`. Everything is rolled back, so your local data never changes.
-- We "sign in" by setting request.jwt.claims (auth.uid() reads it) and the `authenticated` role.

begin;
create extension if not exists pgtap with schema extensions;

select plan(18);

-- SIGN-UP: one account per kind of name Google can give us
select lives_ok($$
  insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data) values
    ('dddddddd-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ana@test.local',
     '{"full_name": "Ana Diaz", "avatar_url": "https://example.com/ana.png"}'),
    ('dddddddd-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ben@test.local',
     '{"name": "Ben Cole", "picture": "https://example.com/ben.png"}'),
    ('dddddddd-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'cam@test.local',
     '{"full_name": "   "}'),
    ('dddddddd-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'dan@test.local', null),
    ('dddddddd-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', null, null)
$$, 'Accounts with any kind of name can sign up');

create function pg_temp.name_of(n int) returns text language sql as $$
  select display_name from public.profiles where id = ('dddddddd-0000-0000-0000-00000000000' || n)::uuid
$$;
select is(pg_temp.name_of(1), 'Ana Diaz', 'The Google full_name is used');
select is(pg_temp.name_of(2), 'Ben Cole', 'name is used when there is no full_name');
select is(pg_temp.name_of(3), 'cam', 'A blank name falls back to the start of the email');
select is(pg_temp.name_of(4), 'dan', 'No Google data falls back to the start of the email');
select is(pg_temp.name_of(5), 'Student', 'No name and no email still gets a name');
select is(
  (select array_agg(avatar_url order by id) from public.profiles where id::text like 'dddddddd-%'),
  array['https://example.com/ana.png', 'https://example.com/ben.png', null, null, null],
  'The Google photo is copied, from avatar_url or picture');

-- PROFILE SPORTS: Ben has one sport; Ana tries to touch it
insert into public.profile_sports values ('dddddddd-0000-0000-0000-000000000002', 'tennis', 'advanced');

set local role anon;
select is((select count(*)::int from public.profile_sports), 0, 'Logged-out users see no sports');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"dddddddd-0000-0000-0000-000000000001","role":"authenticated"}', true);

select lives_ok(
  $$ insert into public.profile_sports values ('dddddddd-0000-0000-0000-000000000001', 'soccer', 'beginner') $$,
  'Users can add their own sport');
select throws_ok(
  $$ insert into public.profile_sports values ('dddddddd-0000-0000-0000-000000000001', 'soccer', 'advanced') $$,
  '23505', null, 'The same sport cannot be added twice');
select throws_ok(
  $$ insert into public.profile_sports values ('dddddddd-0000-0000-0000-000000000002', 'soccer', 'beginner') $$,
  '42501', null, 'Users cannot add a sport for someone else');
select throws_ok(
  $$ update public.profile_sports set user_id = 'dddddddd-0000-0000-0000-000000000002'
     where user_id = 'dddddddd-0000-0000-0000-000000000001' $$,
  '42501', null, 'Users cannot hand their row to someone else');

-- RLS hides other people's rows from update and delete, so these change nothing.
update public.profile_sports set level = 'beginner' where user_id = 'dddddddd-0000-0000-0000-000000000002';
delete from public.profile_sports where user_id = 'dddddddd-0000-0000-0000-000000000002';
select is(
  (select level::text from public.profile_sports where user_id = 'dddddddd-0000-0000-0000-000000000002'),
  'advanced',
  'Users can read someone else''s sport but not change or remove it');

update public.profile_sports set level = 'intermediate' where user_id = auth.uid();
select is(
  (select level::text from public.profile_sports where user_id = auth.uid()),
  'intermediate', 'Users can change their own level');
delete from public.profile_sports where user_id = auth.uid();
select is(
  (select count(*)::int from public.profile_sports where user_id = auth.uid()),
  0, 'Users can remove their own sport');

-- DELETING A HOST: Ben hosts a game that Ana joined
reset role;
insert into public.games (id, host_id, sport, location_id, starts_at, duration_minutes, skill_level, max_players) values
  ('eeeeeeee-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000002', 'soccer',
   (select id from public.locations limit 1), now() + interval '1 day', 60, 'beginner', 10);
insert into public.game_players (game_id, user_id, status) values
  ('eeeeeeee-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000001', 'joined'),
  ('eeeeeeee-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000002', 'joined');
delete from auth.users where id = 'dddddddd-0000-0000-0000-000000000002';

select results_eq(
  $$ select host_id from public.games where id = 'eeeeeeee-0000-0000-0000-000000000001' $$,
  $$ values (null::uuid) $$,
  'Deleting a host keeps their game, with no host');
select is(
  (select array_agg(user_id) from public.game_players where game_id = 'eeeeeeee-0000-0000-0000-000000000001'),
  array['dddddddd-0000-0000-0000-000000000001'::uuid],
  'The other players stay in the game');
select is(
  (select count(*)::int from public.profile_sports where user_id = 'dddddddd-0000-0000-0000-000000000002'),
  0, 'Deleting a user removes their sports');

select * from finish();
rollback;
