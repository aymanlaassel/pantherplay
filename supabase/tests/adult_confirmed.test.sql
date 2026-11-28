-- W8-14 tests: the 18+ confirmation column and who may set it.
-- Run with `supabase test db`. Everything runs inside a transaction and is rolled back.

begin;
create extension if not exists pgtap with schema extensions;

select plan(4);

-- SETUP (as the database owner): two users with profiles.
insert into auth.users (id, instance_id, aud, role, email, created_at, updated_at) values
  ('cccccccc-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ana@test.local', now(), now()),
  ('cccccccc-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ben@test.local', now(), now());
insert into public.profiles (id, display_name) values
  ('cccccccc-0000-0000-0000-000000000001', 'Test Ana'),
  ('cccccccc-0000-0000-0000-000000000002', 'Test Ben')
  on conflict (id) do update set display_name = excluded.display_name;  -- still works if sign-up creates profiles (W5-04)

select has_column('public', 'profiles', 'adult_confirmed_at', 'profiles has adult_confirmed_at');
select col_type_is('public', 'profiles', 'adult_confirmed_at', 'timestamp with time zone', 'adult_confirmed_at is a timestamptz');

-- SIGNED IN AS ANA
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"cccccccc-0000-0000-0000-000000000001","role":"authenticated"}', true);

update public.profiles set adult_confirmed_at = now() where id = 'cccccccc-0000-0000-0000-000000000001';
update public.profiles set adult_confirmed_at = now() where id = 'cccccccc-0000-0000-0000-000000000002';

reset role;
select isnt(
  (select adult_confirmed_at from public.profiles where id = 'cccccccc-0000-0000-0000-000000000001'), null,
  'A student can confirm on their own profile');
select is(
  (select adult_confirmed_at from public.profiles where id = 'cccccccc-0000-0000-0000-000000000002'), null,
  'A student can''t confirm for someone else');

select * from finish();
rollback;
