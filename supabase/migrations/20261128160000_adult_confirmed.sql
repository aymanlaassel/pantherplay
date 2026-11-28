-- W8-14: PantherPlay is 18+ (decided Nov 25). Onboarding's first step asks the student to confirm it;
-- this column records when they did. No birthdate is collected.
-- Students set it on their own row through the existing "Users can update their own profile" policy.
alter table public.profiles add column adult_confirmed_at timestamptz;
comment on column public.profiles.adult_confirmed_at is 'When the student confirmed they are 18 or older. Null until they do; the app keeps them in onboarding until then.';
