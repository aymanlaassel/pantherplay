-- Starter data for local development. Runs after the migrations on every `supabase db reset`.

-- TEST USERS: fake sign-in accounts, so the test games have hosts. Local only.
insert into auth.users (id, instance_id, aud, role, email, created_at, updated_at) values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'alex@test.local', now(), now()),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'maya@test.local', now(), now()),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sam@test.local', now(), now());

-- TEST PROFILES: one per test user, same id
insert into public.profiles (id, display_name, campus, onboarding_completed_at) values
  ('00000000-0000-0000-0000-000000000001', 'Alex Rivera', 'MMC', now()),
  ('00000000-0000-0000-0000-000000000002', 'Maya Thompson', 'MMC', now()),
  ('00000000-0000-0000-0000-000000000003', 'Sam Okafor', 'BBC', now());

-- TEST GAMES: times are relative to now, so they never go stale
insert into public.games (id, host_id, sport, location_id, starts_at, duration_minutes, skill_level, max_players, notes, status) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'soccer',
    (select id from public.locations where campus = 'MMC' and name = 'Soccer & Flag Football Field'),
    now() + interval '3 hours', 90, 'beginner', 10, '5v5, bring a white and a dark shirt', 'open'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'basketball',
    (select id from public.locations where campus = 'MMC' and name = 'Basketball Court 1'),
    now() + interval '1 day', 60, 'intermediate', 2, null, 'full'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'volleyball',
    (select id from public.locations where campus = 'BBC' and name = 'Volleyball Court'),
    now() + interval '2 days', 120, 'advanced', 12, null, 'open'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'pickleball',
    (select id from public.locations where campus = 'MMC' and name = 'Tennis & Pickleball Courts'),
    now() + interval '1 day', 60, 'beginner', 4, 'Paddles provided', 'cancelled');

-- TEST PLAYERS: every host is joined in their own game; the basketball game is full
insert into public.game_players (game_id, user_id, status) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'joined'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'joined'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'joined'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'joined'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'waitlisted'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'joined'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'joined');
