# PantherPlay handover guide (for PantherSoft)

Start here. This page gets you from a fresh laptop to a running app, then covers how the database and secrets are managed, how login is built to be swapped for FIU login, which accounts change hands, and what is still unfinished.

For the "why" and the "what", read these rather than this page:

- [`ARCHITECTURE.md`](./ARCHITECTURE.md): diagrams of the system, folders, screens, database and who owns what.
- [`adr/`](./adr/): one short note per big decision (ADR = Architecture Decision Record).
- [`google-sign-in-setup.md`](./google-sign-in-setup.md): the Google Cloud and Supabase dashboard setup for sign-in.
- [`../CLAUDE.md`](../CLAUDE.md): the project rules every change follows.

Items marked **(confirm with Felipe)** were not written down anywhere in the repo when this guide was written; ask the team lead before relying on them.

## Prerequisites

Install these once:

| Tool | Why | Notes |
|---|---|---|
| [Node.js](https://nodejs.org) 22 | Runs the app tooling | CI uses Node 22 (`.github/workflows/ci.yml`). The repo has no `.nvmrc`, so 22 LTS is the safe choice. |
| [Expo Go](https://expo.dev/go) on your phone, or the iOS simulator (Xcode) | Opens the app while you develop | |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Local Supabase runs inside Docker | Must be running before `supabase start`. |
| [Supabase CLI](https://supabase.com/docs/guides/cli) v3 | Local database, migrations, SQL tests | `brew install supabase/tap/supabase`. CI pins 3.1.0; v2 can't read our `supabase/config.toml`. |
| Git | | |

## Run the app

1. **Clone and install.**

   ```bash
   git clone <repo-url>          # the URL is in the root README
   cd pantherplay/app
   npm install
   ```

2. **Create your env file.** From `app/`:

   ```bash
   cp .env.example .env
   ```

   Fill in the two values the app reads (`app/src/lib/supabase.ts`):

   | Variable | What it is |
   |---|---|
   | `EXPO_PUBLIC_SUPABASE_URL` | The hosted project URL, `https://<your-project-ref>.supabase.co` (Supabase dashboard → Project Settings → API). |
   | `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | The publishable key, starts with `sb_publishable_` (same page). |

   `EXPO_PUBLIC_API_URL` in `.env.example` is left over from the old `server/` folder; nothing in the app reads it.

   `.env` is git-ignored. Never commit it.

3. **Start the app.**

   ```bash
   npx expo start --tunnel
   ```

   Scan the QR code with Expo Go. Use `--tunnel` (or `--localhost` on the iOS simulator): with plain `npx expo start`, Google sign-in can never finish on a phone. [`google-sign-in-setup.md`](./google-sign-in-setup.md#testing-sign-in-in-expo-go) explains why. To sign in, your Google account must be on the consent screen's **Test users** list while the Google app is in Testing.

You should land on Welcome, sign in with Google, and reach Discover.

## Run Supabase locally

Local Supabase is a full copy of the backend on your laptop, built from `supabase/migrations/` and filled with fake data from `supabase/seed.sql`. Use it to write and test database changes without touching the real project. Run these from the repo root (where `supabase/` is):

```bash
supabase start      # first run downloads images and takes a while
supabase status     # prints the local URLs and keys
supabase db reset   # wipe local data, rerun every migration, then seed.sql
supabase test db    # run the SQL tests in supabase/tests/
supabase stop       # when you're done
```

The local dashboard (Studio) is at http://127.0.0.1:54323.

The app normally points at the hosted project, not local. Local Supabase doesn't have Google sign-in set up (`supabase/config.toml` has no Google provider), and on a real phone `127.0.0.1` means the phone itself, so pointing the app at local only works on the simulator and only for screens that don't need sign-in.

## Run the checks

Run these from `app/` before every PR. All must pass. CI runs lint, typecheck, tests and the SQL tests on every PR; the smoke test is local only.

| Check | Command |
|---|---|
| Typecheck | `npm run typecheck` |
| Lint | `npm run lint` |
| Tests | `npm test` |
| Smoke test (bundles the app) | `npx expo export --platform ios --output-dir /tmp/export-check` |
| SQL tests (from the repo root, local Supabase running) | `supabase test db` |

## Change the database and deploy migrations

A **migration** is a SQL file that changes the database one step at a time. Every database change, including its Row Level Security (RLS) policies, goes in `supabase/migrations/` and nowhere else. RLS is the set of database rules deciding which rows each signed-in user can read or write.

1. Create a file: `supabase migration new <short_name>` (from the repo root).
2. Write the SQL, with matching RLS policies for any new table.
3. Test locally: `supabase db reset`, then `supabase test db`. Add a test in `supabase/tests/` for new database functions.
4. Merge the PR.
5. Deploy to the hosted project:

   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   supabase db push --dry-run   # shows which migrations would run
   supabase db push
   ```

**Never hand-edit production.** No table edits or SQL in the hosted dashboard: anything not in a migration is lost the next time someone rebuilds from the repo.

Pushing needs the database password and a Supabase role that can manage the project. Who pushes, and when, is **(confirm with Felipe)**: there is no deploy step in CI today.

## Where secrets live

| Secret | Where it lives | OK in the app? |
|---|---|---|
| Supabase publishable key (`sb_publishable_…`) | `app/.env` as `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes. It's protected by RLS and ships inside the app. |
| Supabase secret key (`sb_secret_…`, formerly "service role") | Supabase dashboard; Edge Function secrets if one is ever written | **Never.** It skips RLS. |
| Database password | Supabase dashboard; needed for `supabase link` / `db push` | Never. |
| Google OAuth client secret | Supabase dashboard → Authentication → Providers → Google, only | Never. |
| Apple Sign in key (when added) | Supabase dashboard; locally via `SUPABASE_AUTH_EXTERNAL_APPLE_SECRET` (see `supabase/config.toml`) | Never. |

Rules:

- Anything named `EXPO_PUBLIC_*` is bundled into the app and readable by anyone. Only put public values there.
- The repo is **public**. Never commit `.env` files or keys. `.gitignore` already ignores `.env` and `.env.*` except `.env.example`.
- If a secret leaks, rotate it in the dashboard it came from right away.
- There are no Edge Functions yet (`supabase/functions/` doesn't exist). Server code that needs a secret goes there, not in the app.

## How login is built to be swapped

- **One file knows the provider.** `app/src/lib/auth.ts` is the only file that knows we sign in with Google. Screens only call its functions: `signIn`, `signOut`, `getSession`, `getUserId`, `onAuthChange` and `getProviderProfile`. No screen imports a provider SDK.
- **Everything is keyed on the Supabase user id** (`auth.users.id`), never on the Google email or Google account id. `profiles.id` is that same id, and so are `games.host_id` and `game_players.user_id`. Changing providers doesn't change anyone's data, as long as Supabase still issues the user id.
- **The auth gate** in `app/src/app/_layout.tsx` only asks "is there a session?" It doesn't care which provider created it.

Outline for the FIU login swap (PantherSoft's job, not done here):

1. Find out what FIU offers (for example SAML SSO or an OpenID Connect provider) and whether Supabase Auth supports it directly. Supabase supports SAML SSO on paid plans and many OAuth providers.
2. Turn the provider on in the Supabase dashboard (Authentication → Providers) and add its redirect URLs, the same way Google is set up in [`google-sign-in-setup.md`](./google-sign-in-setup.md).
3. Change `signInWithGoogle()` in `auth.ts` to the new provider, and update `getProviderProfile()` if FIU puts the name and photo in different `user_metadata` fields.
4. Update the button label and logo on the Sign in screen (`app/src/app/(auth)/sign-in.tsx`).
5. Decide what happens to existing Google accounts. A new provider creates a **new** Supabase user unless the accounts are linked (Supabase identity linking), so existing users would start fresh otherwise.
6. Turn Google off in Supabase once nobody needs it, and update `app/__tests__/auth.test.ts`.
7. Write an ADR for the switch.

## Accounts to transfer

| Account | What it holds | Notes |
|---|---|---|
| **Supabase** organization and project | Database, Auth, Realtime, API keys, auth settings | Transfer the organization, or add PantherSoft as Owner. Saving auth settings needs Owner or Administrator. Production needs a **paid plan**: the free tier pauses inactive projects. |
| **Google Cloud** project `PantherPlay` | The OAuth consent screen and OAuth client used for Google sign-in | Owned by a shared team Google account (not personal, not `@fiu.edu`). Add PantherSoft as project Owner, or hand over the shared account. |
| **Apple Developer** program | App Store Connect, TestFlight, Sign in with Apple (service id and key) | Needed to publish on iOS. Sign in with Apple is decided but not built. Who holds the membership is **(confirm with Felipe)**. |
| **Expo / EAS** | Builds and over-the-air updates | The Expo stack uses EAS Build, but there is no `eas.json` yet and `app.json` still uses the starter name and slug `app`. Whether an Expo account exists is **(confirm with Felipe)**. |
| **GitHub** repository | Code, issues, PRs, CI (GitHub Actions) | Transfer the repo or add PantherSoft as admin. CI needs no secrets today. |
| **Figma** file | Screen designs and the component library | Component names in the code match the Figma library. Transfer or share edit access. |
| **Google Play Console** | Android publishing | Only if Android ships. Production Android builds also need a Google Maps API key ([ADR 0004](./adr/0004-map-tab.md)). **(confirm with Felipe)** |
| **Domain / hosting for the privacy policy and terms** | The pages linked from Sign in and Settings | Both are `https://example.com` placeholders today; the App Store and Google consent screen need real ones. **(confirm with Felipe)** |

## Open items and known limits

**Decided** (some aren't built yet, see below):

- **Sign-in:** no `@fiu.edu` limit. Any Google account can sign in today; FIU login replaces Google later.
- **Social:** Chats and Friends, as built in the Social tab. See [`social-page-scope.md`](./social-page-scope.md).
- **My Games:** a section pinned on the Profile page, not a tab.
- **Waitlist:** first come, first served. When a joined player leaves, the earliest waitlisted player gets the spot automatically (`leave_game` already does this). Someone who leaves and rejoins goes to the back. Waitlisted players see their position in line.
- **Scheduling:** games can be posted up to 14 days ahead.
- **Confirm threshold:** a game counts as `confirmed` (it's happening) once half its spots are filled, with a minimum of 2 players.
- **No reliability score.**
- **Backend:** Supabase only, no custom server. `server/` (Express + Prisma) is unused and will be deleted.

**Still open** (ask Felipe, don't pick):

- The v1 sport list (flag football vs pickleball) and the min/max players per game.
- The ADRs still waiting to be written are listed in [`adr/README.md`](./adr/README.md), including 0006 (server-state library).

**Not built yet, or still on mock data:**

- Profile and Notifications still return mock data (`app/src/api/profile.ts`, `app/src/api/notifications.ts`). Games, joining, leaving, creating and locations use Supabase.
- Social is a skeleton on mock data: no real chat, no friend requests, no tables.
- Settings: Sign out is a placeholder (TODO #51), Edit profile and most rows do nothing.
- Onboarding has only the Photo and Notifications screens; Campus and Sports & level aren't built, and the auth gate doesn't check `onboarding_completed_at` yet.
- Realtime updates (live spot counts) aren't wired up yet.
- Push notifications: the app asks for permission, but nothing sends pushes (no Edge Functions).
- The sport list is a hard-coded copy in `app/src/api/sports.ts`.
- `server/` (Express + Prisma) is still in the repo; the app doesn't use it and it's due to be deleted.
- My Games on Profile, the waitlist position, the 14-day scheduling limit and the confirm threshold are decided but not built: nothing limits how far ahead a game is posted, and nothing sets a game to `confirmed` yet.

**App Store must-haves still missing:**

- [ ] In-app account deletion: the Delete account screen exists but doesn't delete anything yet.
- [ ] Report and block for users and games: Settings shows the rows, nothing behind them.
- [ ] Real privacy policy and terms URLs (now `example.com` placeholders in `sign-in.tsx` and `settings/index.tsx`).
- [ ] The "I'm 18 or older" confirm step.
- [ ] Sign in with Apple (Apple can require it when an app offers Google sign-in).
- [x] Push permission asked only after an explain-first screen (`(onboarding)/enable-notifications.tsx`).
- [ ] A paid Supabase plan for production.
- [ ] The Google sign-in launch checklist in [`google-sign-in-setup.md`](./google-sign-in-setup.md#before-launch): publish the consent screen, remove the `exp://**` and `exps://**` redirect URLs, set a real Site URL.
- [ ] App name, slug, icon and bundle ids in `app/app.json` are still the Expo starter values, and there's no `eas.json`.
