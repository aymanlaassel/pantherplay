# PantherPlay Architecture — Visual Guide

This file is the team's map of how PantherPlay fits together. Every diagram is written in **Mermaid**, a tiny text language that GitHub turns into a picture automatically.

**New to this? Start here:**
- **To view:** open this file on GitHub. The diagrams draw themselves. In VS Code, install the extension **"Markdown Preview Mermaid Support"** and press `Ctrl/Cmd + Shift + V`.
- **To edit:** change the text inside a ` ```mermaid ` block. Paste it into **https://mermaid.live** to see the picture update as you type, then copy it back.
- **Shapes:** rectangles are things (a screen, a service, a folder), diamonds are yes/no questions, cylinders are databases, and arrows show who talks to whom or what happens next.
- **Under every diagram** there's a table explaining, in plain language, what each box is in charge of.
- **Dashed boxes and lines** mean *not decided yet* or *later*. Don't build them without checking with Felipe.
- **Rule:** if your PR changes the architecture (a new table, a new screen, a new service), update the matching diagram in the same PR.

**Diagrams in this file:**
1. [The big picture](#1-the-big-picture)
2. [Where code lives](#2-where-code-lives)
3. [Screen flow](#3-screen-flow)
4. [Which screen do I land on?](#4-which-screen-do-i-land-on-the-auth-gate)
5. [The database](#5-the-database)
6. [Joining a game, step by step](#6-joining-a-game-step-by-step)
7. [A game's life](#7-a-games-life)
8. [How my code reaches users](#8-how-my-code-reaches-users)
9. [Who owns what](#9-who-owns-what)

---

## 1. The big picture

**What it shows:** the pieces of the system and how they talk to each other.

**Key idea:** there is **no server we write ourselves.** The phone app talks directly to Supabase, which is our database, login system and live updates all in one.

```mermaid
flowchart LR
  subgraph Phone["📱 Student's phone"]
    App["PantherPlay app<br/>(React Native + Expo)"]
  end

  subgraph Supabase["☁️ Supabase (our backend)"]
    Auth["Auth<br/>who is signed in"]
    DB[("Postgres database<br/>games, players, profiles")]
    RT["Realtime<br/>live spot counts"]
    Fn["Edge Functions<br/>send push notifications"]
  end

  Google["Google sign-in<br/>(used for now)"]
  FIU["FIU official login<br/>(later — PantherSoft)"]
  Push["Expo Push service"]

  App -- "1. sign in" --> Auth
  Auth -- "checks identity" --> Google
  Auth -.-> FIU
  App -- "2. read & write data" --> DB
  DB -- "3. changes stream back" --> RT
  RT -- "live updates" --> App
  DB -- "4. something important happened" --> Fn
  Fn --> Push
  Push -- "notification" --> App

  classDef later stroke-dasharray: 5 5,color:#5A6B7D
  class FIU later
```

**What each box does:**

| Box | In charge of |
|---|---|
| **PantherPlay app** | Everything the student sees and taps. It shows screens, sends what the student does (join, post, leave) to Supabase, and redraws when data changes. It does **not** decide rules like "is this game full?". |
| **Auth** | Knowing who is signed in. After sign-in it gives the app a token (a digital ID card) that's attached to every request, so the database knows who is asking. |
| **Google sign-in** | Proving the person owns their Google account. Used until FIU login is ready. |
| **FIU official login** | Replacing Google later. PantherSoft builds this; we don't. |
| **Postgres database** | Storing everything that must survive closing the app: profiles, games, who joined. It also **enforces the rules**: Row Level Security (RLS) decides who may read or change each row, and functions like `join_game` stop overbooking. |
| **Realtime** | Watching the database and pushing changes to every phone with that screen open, so spot counts update without a refresh. |
| **Edge Functions** | Small pieces of server code that Supabase runs for us. Here they decide who should get a notification and hand it to Expo Push. They hold the secret service key, which must never be in the app. |
| **Expo Push service** | Delivering the notification through Apple and Google so it shows on the lock screen, even when the app is closed. |

---

## 2. Where code lives

**What it shows:** the folders in the repo and what goes in each.

**Key idea:** the phone app lives in `app/`. Screens go in `app/src/app/`, reusable pieces in the rest of `app/src/`, and database changes in `supabase/`. **Only `app/src/lib/auth.ts` knows we use Google**, so swapping in FIU login later touches one file.

```mermaid
flowchart TB
  Repo["📁 pantherplay repo"]

  Repo --> AppProj["app/<br/>the phone app (Expo project)"]
  Repo --> Supa["supabase/"]
  Repo --> Docs["docs/<br/>ARCHITECTURE.md, adr/"]
  Repo --> Server["server/<br/>Express + Prisma<br/>(pending: keep or remove)"]

  AppProj --> Screens["src/app/<br/>one file = one screen<br/>(Expo Router)"]
  AppProj --> Comp["src/components/<br/>Button, GameCard, Chip…<br/>(same names as Figma)"]
  AppProj --> Theme["src/theme/<br/>colors, fonts, spacing"]
  AppProj --> Api["src/api/<br/>functions that read/write data"]
  AppProj --> Lib["src/lib/"]

  Screens --> AuthScreens["(auth)/<br/>welcome, sign-in"]
  Screens --> Onb["(onboarding)/<br/>campus, sports, photo, notifications"]
  Screens --> Tabs["(tabs)/<br/>discover, profile, …"]
  Screens --> Pushed["game/[id] · game/create · notifications"]

  Lib --> AuthTs["auth.ts ⚠️<br/>the ONLY file that knows<br/>about Google sign-in"]
  Lib --> Client["supabase.ts<br/>database client"]

  Supa --> Mig["migrations/<br/>every database change, in order"]
  Supa --> Seed["seed.sql<br/>sports + campus locations"]

  Comp --> Theme
  Screens --> Comp
  Screens --> Api
  Api --> Client

  classDef pending stroke-dasharray: 5 5,color:#5A6B7D
  class Server pending
```

**What each folder does:**

| Folder | In charge of |
|---|---|
| `app/` | The whole phone app (the Expo project), with its own `package.json` and assets. Run `npx expo start` from here. |
| `app/src/app/` | **Screens.** Each file is one screen, and its path becomes the screen's address: `game/[id].tsx` is the Game detail page for any game id. Folders in parentheses like `(auth)` group screens without changing the address. A `_layout.tsx` file wraps a group (the tab bar, the auth gate). |
| `app/src/components/` | Reusable building blocks that many screens share (buttons, game cards, chips). Named like the Figma components, so designers and developers mean the same thing. |
| `app/src/theme/` | Colors, fonts, text styles, spacing and radius in one place, mirroring the Figma variables. Components use names like `colors.text.primary` (Figma `text/primary`), never hex codes, so changing a color is one edit. Light mode only. |
| `app/src/api/` | The only place screens get data from: small functions like `listGames()` or `joinGame(id)` that call Supabase, so screens never write database queries themselves. |
| `app/src/lib/supabase.ts` | Creating the one Supabase connection the whole app shares. |
| `app/src/lib/auth.ts` | Sign in, sign out, and "who is signed in?". The only file that knows Google is involved. |
| `supabase/migrations/` | Every database change, as numbered SQL files applied in order. Like git history for the database: anyone can rebuild the same database from scratch. |
| `supabase/seed.sql` | The starter rows the app needs: the sport list and the campus locations. |
| `docs/` | This file and ADRs (one short file per big decision, explaining why). |
| `server/` | An Express + Prisma server from early setup. The team later chose Supabase only, so this may be removed. **Don't build on it yet.** |

---

## 3. Screen flow

**What it shows:** every screen and how you move between them.

**Key idea:** solid boxes are designed in Figma. Dashed boxes are **pending a team decision** or not designed yet.

```mermaid
flowchart TD
  Welcome["Welcome<br/>Get started"] --> SignIn["Sign in<br/>Continue with Google"]
  SignIn --> Gate{"New user?"}
  Gate -- yes --> Campus["Onboarding 1<br/>Which campus?"]
  Campus --> Sports["Onboarding 2<br/>Sports & level"]
  Sports --> Photo["Onboarding 3<br/>Photo"]
  Photo --> Notif["Onboarding 4<br/>Allow notifications"]
  Notif --> Discover
  Gate -- no --> Discover

  subgraph TabBar["Tab bar"]
    Discover["Discover / Home"]
    MapTab["Map"]
    Plus(("＋"))
    Social["Social<br/>(scope pending)"]
    Profile["Profile"]
  end

  Discover -- "tap a game card" --> Detail["Game detail"]
  Discover -- "tap the bell" --> Notifications["Notifications"]
  Plus -- "opens full-screen" --> Create["Create game"]
  Create -- "Post game" --> Detail
  Profile -- "gear icon" --> Settings["Settings<br/>(not designed)"]
  Settings --> NotifPrefs["Notification preferences<br/>(not designed)"]
  Notifications -- "tap a notification" --> Detail
  MyGames["My Games<br/>(pending — no tab slot yet)"] -.-> Detail

  classDef pending stroke-dasharray: 5 5,color:#5A6B7D
  class Social,Settings,NotifPrefs,MyGames,Campus,Sports,Photo,Notif pending
```

**What each screen does:**

| Screen | In charge of |
|---|---|
| **Welcome** | The first thing a new person sees: what the app is, and a "Get started" button. |
| **Sign in** | One "Continue with Google" button for both new and returning users. |
| **New user?** | Not a screen. The app checks whether this person has finished onboarding (see diagram 4). |
| **Onboarding 1–4** | One-time setup for new users: home campus, sports and skill level, profile photo, and permission to send notifications (explained first, then the phone's own prompt). |
| **Discover / Home** | The live board: games at your campus, filtered by date and sport. The main screen. |
| **Map** | A map of where games are. In for v1 (decided). |
| **＋** | The center tab button. Opens Create game. |
| **Social** | The fourth tab (name decided). Probably friends and what they're playing; exactly what goes in it, and whether chat is included, is still pending. |
| **Profile** | Your info and sports, plus the gear icon that opens Settings. |
| **Game detail** | One game: when, where, who's going, spots left, and the Join button. It opens on top of the tabs with a back button. |
| **Notifications** | Your list of updates (game cancelled, spot opened). Opened from the bell on Home. |
| **Create game** | The full-screen form to host a game. Posting it opens the new game's detail page. |
| **Settings / Notification preferences** | Account options (sign out, delete account, blocked users) and which notifications you get. Not designed yet. |
| **My Games** | Games you've joined or host. Pending: it has no tab slot yet. |

---

## 4. Which screen do I land on? (the auth gate)

**What it shows:** the check the app runs every time it opens.

**Key idea:** there's **no "Create account" button**. Google handles new and returning users with the same tap, and this check decides where they go.

```mermaid
flowchart TD
  Open(["App opens"]) --> HasSession{"Is someone<br/>signed in?"}
  HasSession -- no --> Welcome["Show Welcome → Sign in"]
  HasSession -- yes --> Onboarded{"Has this person<br/>finished onboarding?<br/>(profiles.onboarding_completed_at)"}
  Onboarded -- no --> Onboarding["Show onboarding"]
  Onboarded -- yes --> Home["Show Discover"]
  Onboarding -- "finish last step" --> Save["Save profile<br/>set onboarding_completed_at"]
  Save --> Home
```

**What each step does:**

| Step | In charge of |
|---|---|
| **Is someone signed in?** | Checking the phone for a saved session (the token from Auth). No session means the person is new or signed out. |
| **Has this person finished onboarding?** | Looking at their row in `profiles`. If `onboarding_completed_at` is empty, they signed in but haven't finished setup. |
| **Save profile** | Saving the onboarding answers and stamping `onboarding_completed_at` with the current time, so the next launch goes straight to Discover. |

This check lives in the root layout, `app/src/app/_layout.tsx`, which every screen passes through.
d
---

## 5. The database

**What it shows:** the tables and how they connect. This is a **proposal** until the schema is locked at the Friday meeting.

**How to read the lines:** `||--o{` means "one to many". For example, one game has many players.

**Key idea:** "3 of 10 spots filled" is **not stored anywhere**. The app counts the rows in `GAME_PLAYERS` instead.

```mermaid
erDiagram
  PROFILES ||--o{ GAMES : "hosts"
  PROFILES ||--o{ GAME_PLAYERS : "joins as"
  GAMES ||--o{ GAME_PLAYERS : "has"
  LOCATIONS ||--o{ GAMES : "is played at"
  SPORTS ||--o{ GAMES : "is a"
  PROFILES ||--o{ PROFILE_SPORTS : "plays"
  SPORTS ||--o{ PROFILE_SPORTS : "played by"
  PROFILES ||--o{ NOTIFICATIONS : "receives"
  GAMES ||--o{ NOTIFICATIONS : "is about"
  PROFILES ||--o{ BLOCKS : "blocks"
  PROFILES ||--o{ REPORTS : "files"
  PROFILES ||--o{ PUSH_TOKENS : "has devices"

  PROFILES {
    uuid id PK "same as the signed-in user id"
    text full_name
    text avatar_url
    campus home_campus "MMC or BBC"
    timestamptz onboarding_completed_at
  }
  GAMES {
    uuid id PK
    uuid host_id FK
    text title "shown on the game card, up to 60 chars"
    text sport FK
    uuid location_id FK
    timestamptz starts_at "always with timezone"
    int duration_minutes "60, 90 or 120"
    int max_players
    int min_players "game confirms at this count"
    skill_level skill_level
    text notes
    game_status status "open, confirmed, full, cancelled, completed"
  }
  GAME_PLAYERS {
    uuid game_id PK "with user_id, stops double-joining"
    uuid user_id PK
    player_status status "joined, waitlisted, left, no_show"
    timestamptz joined_at
  }
  LOCATIONS {
    uuid id PK
    campus campus
    text name "e.g. Panther Field"
    text photo_url "the photo belongs to the place"
  }
  SPORTS {
    text code PK "soccer, basketball…"
    text name
  }
  PROFILE_SPORTS {
    uuid user_id PK
    text sport PK
    skill_level level
  }
  NOTIFICATIONS {
    uuid id PK
    uuid user_id FK
    text type
    uuid game_id FK
    timestamptz read_at
  }
  BLOCKS {
    uuid blocker_id PK
    uuid blocked_id PK
  }
  REPORTS {
    uuid id PK
    uuid reporter_id FK
    uuid target_user_id FK
    uuid target_game_id FK
    text reason
  }
  PUSH_TOKENS {
    text token PK
    uuid user_id FK
    text platform
  }
```

**Reading the boxes:** `PK` (primary key) is the column that uniquely identifies a row. `FK` (foreign key) points to a row in another table; for example, `host_id` points to the host's profile.

**What each table stores:**

| Table | In charge of |
|---|---|
| **PROFILES** | One row per student: name, photo, home campus. Its `id` is the same as their sign-in id, which links the login to the profile. |
| **GAMES** | One row per posted game: title, who hosts, sport, place, start time, length, player limits and status. |
| **GAME_PLAYERS** | Who is in which game: one row per person per game, with their status (joined, waitlisted, left, no-show). Counting the `joined` rows gives the spots filled. |
| **LOCATIONS** | The fixed list of campus spots (Panther Field, Rec Center…) and their photos. Games pick one, which is why there's no map API. |
| **SPORTS** | The list of sports the app offers. |
| **PROFILE_SPORTS** | Which sports each student plays and at what level, from onboarding. Used to set Discover's defaults. |
| **NOTIFICATIONS** | Each student's in-app notification list, and which ones they've read. |
| **BLOCKS** | Who blocked whom, so blocked people's games and profiles are hidden. |
| **REPORTS** | Reports of bad behavior or fake games for the team to review. Required by the App Store. |
| **PUSH_TOKENS** | Each phone's address for push notifications. One student can have several phones. |

---

## 6. Joining a game, step by step

**What it shows:** what happens when two people tap **Join** on the last spot at the same moment.

**Key idea:** the **database decides** who gets the spot, not the app. The `join_game` function locks the game so the two requests run one after the other.

```mermaid
sequenceDiagram
  autonumber
  actor Ana as Ana's phone
  actor Ben as Ben's phone
  participant DB as Supabase<br/>join_game()
  participant RT as Realtime

  Note over Ana,Ben: 9 of 10 spots filled. Both tap "Join" at once.
  Ana->>DB: join_game(game)
  Ben->>DB: join_game(game)
  Note over DB: Locks the game row.<br/>Ben's request waits in line.
  DB->>DB: count joined = 9 < 10 → Ana joins
  DB-->>Ana: "joined" ✅
  DB->>DB: count joined = 10 → Ben waitlisted
  DB-->>Ben: "waitlisted" ⏳
  DB->>RT: game_players changed
  RT-->>Ana: spots bar → 10 of 10 (Full)
  RT-->>Ben: spots bar → 10 of 10 (Full)
```

**What each participant does:**

| Participant | In charge of |
|---|---|
| **Ana's / Ben's phone** | Sending the join request and showing the answer. It never decides who gets the spot. |
| **`join_game()`** | A function that runs inside the database. It locks the game (like a "one at a time" sign on the door) so joins are handled in order, counts the players, and puts you in `joined` or `waitlisted`. |
| **Realtime** | Telling every phone viewing this game that the player list changed, so everyone's spots bar updates. |

**Why not check in the app?** Both phones would see "9 of 10" and both would think there's room. Only the database sees every request, so only it can decide fairly.

---

## 7. A game's life

**What it shows:** the statuses a game moves through, and what moves it.

**Key idea:** these are the badges you see in the UI ("Almost full", "Full", "Cancelled"), and they're also the `status` column in `GAMES`.

```mermaid
stateDiagram-v2
  [*] --> Open: host posts game
  Open --> Confirmed: players reach min_players
  Confirmed --> Full: players reach max_players
  Full --> Confirmed: someone leaves
  Confirmed --> Open: drops below min_players
  Open --> Cancelled: host cancels
  Confirmed --> Cancelled: host cancels
  Full --> Cancelled: host cancels
  Open --> Cancelled: not enough players by cutoff
  Confirmed --> Completed: game time ends
  Full --> Completed: game time ends
  Cancelled --> [*]
  Completed --> [*]
```

**What each status means:**

| Status | For players |
|---|---|
| **Open** | Posted, but it still needs more players before it's on. |
| **Confirmed** | Enough players (`min_players`) have joined, so it's happening. |
| **Full** | Every spot is taken. New joiners go on the waitlist. |
| **Cancelled** | It's off, either because the host cancelled or not enough people joined in time. Everyone who joined gets notified. |
| **Completed** | The game time is over. Post-game steps like rating the host happen after this. |

The database functions (`join_game`, `leave_game`, `cancel_game`) change the status, never the app directly. How a game moves to Completed, or gets cancelled at the cutoff, isn't decided yet.

---

## 8. How my code reaches users

**What it shows:** the path from your laptop to a student's phone.

**Key idea:** nobody pushes straight to `main`. Every change goes through a branch, a pull request, automatic checks and one teammate's review.

```mermaid
flowchart LR
  A["💻 Your laptop<br/>git checkout -b feat/join-button"] --> B["Push branch"]
  B --> C["Open Pull Request"]
  C --> D{"CI checks<br/>lint · typecheck · tests"}
  D -- fail --> A
  D -- pass --> E{"1 teammate reviews<br/>(within 24h)"}
  E -- changes requested --> A
  E -- approved --> F["Merge to main"]
  F --> G["EAS Build"]
  G --> H["TestFlight / internal testing"]
  H --> I["App Store & Google Play"]

  DBChange["Database change?<br/>add a file in supabase/migrations/"] -.-> C
```

**What each step does:**

| Step | In charge of |
|---|---|
| **Your laptop / branch** | Your own copy of the code. A branch is a separate line of work, so you can't break `main` while you build. |
| **Pull Request (PR)** | Asking to merge your branch into `main`. It's where teammates see your changes and comment. |
| **CI checks** | Automatic checks on every PR: lint (style mistakes), typecheck (TypeScript errors) and tests. Not set up yet. |
| **Review** | One teammate reads your code within 24 hours and approves it or asks for changes. |
| **Merge to main** | Adding your change to `main`, the shared working version that everyone branches from. |
| **EAS Build** | Expo's cloud service that turns the code into real iPhone and Android apps. |
| **TestFlight / internal testing** | Apple's and Google's beta channels, where testers install the app before it's public. |
| **App Store & Google Play** | The public release. |
| **Database change?** | A schema change goes in a new file in `supabase/migrations/` in the same PR, so it's reviewed like code. |

---

## 9. Who owns what

**What it shows:** each person's area. Ask the owner before changing their area.

**Key idea:** dashed boxes have **no owner yet**. Assign them at the next meeting.

```mermaid
flowchart TB
  subgraph Felipe["Felipe — team lead"]
    F1["Home / Discover / Feed"]
    F2["Design system + Figma library"]
  end
  subgraph Josue["Josue"]
    J1["Home / Discover / Feed"]
  end
  subgraph Ayman["Ayman — co-lead"]
    A1["Map"]
  end
  subgraph Ricky["Ricky"]
    R1["Map"]
  end
  subgraph Igor["Igor"]
    I1["Social tab<br/>(friends / chat; scope pending)"]
  end
  subgraph Asad["Asad"]
    S1["Profile"]
  end
  subgraph Bryan["Bryan"]
    B1["Create game"]
  end
  subgraph Unowned["⚠️ Needs an owner"]
    U1["Auth + onboarding"]
    U2["My Games"]
    U3["Settings"]
    U4["Game detail states"]
    U5["Database schema doc"]
    U6["Empty / loading / error states"]
  end

  classDef pending stroke-dasharray: 5 5,color:#5A6B7D
  class I1,U1,U2,U3,U4,U5,U6 pending
```

**What the unowned areas cover:**

| Area | In charge of |
|---|---|
| **Auth + onboarding** | The Welcome and Sign in screens, the four onboarding screens, the auth gate, and `app/src/lib/auth.ts`. |
| **My Games** | The list of games you've joined or host, upcoming and past. |
| **Settings** | Notification preferences, sign out, delete account, and blocked users. |
| **Game detail states** | The versions of Game detail not designed yet: joined (Leave button), full (join waitlist), waitlisted, cancelled, started, and the host's view (edit, cancel, remove a player). |
| **Database schema doc** | Keeping diagram 5 and the migrations in sync, and running the schema review. |
| **Empty / loading / error states** | What screens show with no data, while loading, or when something fails. "No games today" on Discover matters most, since it's what the first users will see. |

---

## Keeping this file honest

- **Who updates it:** whoever changes the thing the diagram shows, in the same PR.
- **Felipe reviews** diagram changes, the same way he approves new Figma components.
- When a pending decision is made (Social tab scope, My Games, waitlist), **remove the dashed style** and update the labels.
- The reasons behind each big decision are recorded as ADRs in [`docs/adr/`](./adr/).
