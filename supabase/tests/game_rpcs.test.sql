-- W3-05 tests: plays four users through a game using the RPCs.
-- Run with `supabase test db`. Everything runs inside a transaction and is rolled back,
-- so it never changes your local data.
--
-- How we "sign in" as someone: auth.uid() reads the user id from the request.jwt.claims
-- setting, so the tests set that, and switch to the `authenticated` role the app uses.

begin;
create extension if not exists pgtap with schema extensions;

select plan(26);

-- SETUP (as the database owner): four users, one game that already started, one with no host.
insert into auth.users (id, instance_id, aud, role, email, created_at, updated_at) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'host@test.local', now(), now()),
  ('aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'bee@test.local', now(), now()),
  ('aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'cee@test.local', now(), now()),
  ('aaaaaaaa-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'dee@test.local', now(), now());
insert into public.profiles (id, display_name) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Test Host'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'Test Bee'),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'Test Cee'),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'Test Dee')
  on conflict (id) do update set display_name = excluded.display_name;  -- still works if sign-up creates profiles (W5-04)
insert into public.games (id, host_id, sport, location_id, starts_at, duration_minutes, skill_level, max_players) values
  ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'soccer',
   (select id from public.locations limit 1), now() - interval '1 hour', 60, 'beginner', 10);
-- host_id is required today; W5-04 makes it optional. Rolled back with everything else.
alter table public.games alter column host_id drop not null;
insert into public.games (id, host_id, sport, location_id, starts_at, duration_minutes, skill_level, max_players) values
  ('bbbbbbbb-0000-0000-0000-000000000002', null, 'soccer',
   (select id from public.locations limit 1), now() + interval '1 day', 60, 'beginner', 10);

-- LOGGED OUT: the anon role may not call the functions at all
set local role anon;
select throws_ok(
  $$ select public.join_game('bbbbbbbb-0000-0000-0000-000000000001') $$,
  '42501', null,
  'Logged-out users may not call the RPCs');

set local role authenticated;

-- NOT SIGNED IN
select set_config('request.jwt.claims', '', true);
select throws_ok(
  $$ select public.join_game('bbbbbbbb-0000-0000-0000-000000000001') $$,
  'P0001', 'Not signed in',
  'Signed-out users cannot join');

-- HOST creates a game for 2 players
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-0000-0000-000000000001","role":"authenticated"}', true);

select throws_ok(
  $$ select public.create_game('soccer', (select id from public.locations limit 1), now() - interval '1 hour', 60, 2, 'beginner') $$,
  'P0001', 'Start time must be in the future',
  'A start time in the past is rejected');
select throws_ok(
  $$ select public.create_game('soccer', (select id from public.locations limit 1), now() + interval '1 day', 45, 2, 'beginner') $$,
  'P0001', 'Duration must be 60, 90 or 120 minutes',
  'A duration other than 60/90/120 is rejected');

-- Keep the new game's id in a setting so later statements can use it.
select set_config('test.game',
  public.create_game('soccer', (select id from public.locations limit 1), now() + interval '1 day', 60, 2, 'beginner', '')::text,
  true);

select is(
  (select host_id from public.games where id = current_setting('test.game')::uuid),
  'aaaaaaaa-0000-0000-0000-000000000001'::uuid,
  'The game is hosted by the signed-in user');
select is(
  (select notes from public.games where id = current_setting('test.game')::uuid),
  null,
  'Empty notes are stored as null');
select is(
  (select status::text from public.game_players where game_id = current_setting('test.game')::uuid and user_id = auth.uid()),
  'joined',
  'Creating a game adds the host as joined');

-- The app can't skip the RPCs and insert itself.
select throws_ok(
  $$ insert into public.game_players (game_id, user_id, status)
     values (current_setting('test.game')::uuid, auth.uid(), 'joined') $$,
  '42501', null,
  'Inserting into game_players directly is blocked by RLS');

-- BEE joins: one spot left
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-0000-0000-000000000002","role":"authenticated"}', true);
select is(public.join_game(current_setting('test.game')::uuid), 'joined', 'Bee gets the last spot');
select is(public.join_game(current_setting('test.game')::uuid), 'joined', 'Joining twice answers with the current place');
select is(
  (select count(*)::int from public.game_players where game_id = current_setting('test.game')::uuid and user_id = auth.uid()),
  1,
  'Joining twice does not add a second row');
select throws_ok(
  $$ select public.join_game('bbbbbbbb-0000-0000-0000-000000000001') $$,
  'P0001', 'Game has already started',
  'A past game cannot be joined');

-- CEE joins: game is full
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-0000-0000-000000000003","role":"authenticated"}', true);
select is(public.join_game(current_setting('test.game')::uuid), 'waitlisted', 'When the game is full, join returns waitlisted');

-- DEE joins too. All of this is one transaction, so every joined_at is the same moment:
-- move Dee earlier, so being first in line (not having the lower id) is what's tested.
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-0000-0000-000000000004","role":"authenticated"}', true);
select is(public.join_game(current_setting('test.game')::uuid), 'waitlisted', 'Dee is waitlisted too');
reset role;
update public.game_players set joined_at = joined_at - interval '1 minute'
where game_id = current_setting('test.game')::uuid and user_id = 'aaaaaaaa-0000-0000-0000-000000000004';
set local role authenticated;

-- BEE leaves: Dee is promoted, Cee keeps waiting
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-0000-0000-000000000002","role":"authenticated"}', true);
select lives_ok($$ select public.leave_game(current_setting('test.game')::uuid) $$, 'Bee can leave');
select is(
  (select status::text from public.game_players where game_id = current_setting('test.game')::uuid and user_id = auth.uid()),
  'left',
  'Leaving marks the player as left');
select is(
  (select status::text from public.game_players where game_id = current_setting('test.game')::uuid
     and user_id = 'aaaaaaaa-0000-0000-0000-000000000004'),
  'joined',
  'Leaving promotes the first waitlisted player');
select is(
  (select status::text from public.game_players where game_id = current_setting('test.game')::uuid
     and user_id = 'aaaaaaaa-0000-0000-0000-000000000003'),
  'waitlisted',
  'Only the first waitlisted player is promoted');
select is(
  (select count(*)::int from public.game_players where game_id = current_setting('test.game')::uuid and status = 'joined'),
  2,
  'The game is still at capacity, not over it');

-- BEE comes back: the game is full again, so back of the line, same row
select is(public.join_game(current_setting('test.game')::uuid), 'waitlisted', 'Rejoining a full game after leaving gives waitlisted');
select is(
  (select count(*)::int from public.game_players where game_id = current_setting('test.game')::uuid and user_id = auth.uid()),
  1,
  'Rejoining reuses the same row');

-- CEE (not the host) tries to cancel
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-0000-0000-000000000003","role":"authenticated"}', true);
select throws_ok(
  $$ select public.cancel_game(current_setting('test.game')::uuid) $$,
  'P0001', 'Only the host can cancel this game',
  'A non-host cannot cancel');
select throws_ok(
  $$ select public.cancel_game('bbbbbbbb-0000-0000-0000-000000000002') $$,
  'P0001', 'Only the host can cancel this game',
  'Nobody can cancel a game that has no host');

-- HOST cancels
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-0000-0000-000000000001","role":"authenticated"}', true);
select lives_ok($$ select public.cancel_game(current_setting('test.game')::uuid) $$, 'The host can cancel');
select is(
  (select status::text from public.games where id = current_setting('test.game')::uuid),
  'cancelled',
  'Cancelling sets the status to cancelled');

-- Nobody can join a cancelled game
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-0000-0000-000000000002","role":"authenticated"}', true);
select throws_ok(
  $$ select public.join_game(current_setting('test.game')::uuid) $$,
  'P0001', 'Game is cancelled',
  'A cancelled game cannot be joined');

select * from finish();
rollback;
