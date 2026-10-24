# src/api

The only place screens get data from. Screens call these functions and never talk to Supabase directly.

**Right now everything here is mock data.** `listGames()`, `getGame(id)` and `listLocations()` return fake data from `mock-data.ts` after a short delay, so loading states can be built. When Supabase is set up, the function bodies get replaced by Supabase calls. The names, arguments and return types stay the same, so screens don't change.

- `types.ts`: row types that mirror the tables in `docs/ARCHITECTURE.md` section 5, plus `GameWithDetails` (what screens get).
- `games.ts`: `listGames()`, `getGame(id)`.
- `locations.ts`: `listLocations()`, the fixed campus spots with their coordinates (Map pins).
- `mock-data.ts`: the fake data, including hostile cases (null avatar, 60-character notes, long host name, 47 games on one day, full, cancelled, starting in 5 minutes). Call `setMockScenario('empty')` to make `listGames()` return `[]` for the empty state.
- `profile.ts`: `getCurrentProfile()`, the signed-in user's profile plus their sports and hosted/played counts (`ProfileWithDetails`). `mockLongNameProfile` is the hostile case (no avatar, very long name), shown on Profile with `?mock=long`.
