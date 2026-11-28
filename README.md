# 🐾 FIU PantherPlay

A mobile app for organizing pickup sports games on FIU's campus.

Turn "we need 2 more for 5v5 tonight" group chats into a live board students actually check.

> 🚧 In development

## Features
- **Post & join games**: soccer, basketball, flag football, volleyball
- **Real-time board**: see what's happening on campus right now
- **Filters**: location (Rec Center, Panther Field, MMC/BBC courts), skill level, headcount needed
- **Recurring squads**: build regular groups for weekly runs
- **Games played**: a count on each profile (no reliability score)

## Planned
- **FIU login** replacing Google sign-in (PantherSoft, after handover)

## Tech Stack
| Layer | Tech |
|---|---|
| Mobile app | React Native + Expo |
| Backend | Supabase only (no custom server): Postgres, Row Level Security, Edge Functions |
| Database | Supabase (PostgreSQL) for users, games, RSVPs; schema changes in `supabase/migrations/` |
| Auth, real-time sync & notifications | Supabase |
| Maps & location | `react-native-maps` with a fixed table of campus spots, no paid map API ([ADR 0004](docs/adr/0004-map-tab.md)) |

## Getting Started

**New to the project, or taking it over (PantherSoft)?** Start with the [handover guide](docs/HANDOVER.md): running the app, deploying migrations, secrets, accounts and open items.

### Prerequisites
- [Node.js](https://nodejs.org) (LTS)
- [Expo Go](https://expo.dev/go) on your phone, or an iOS/Android emulator
- Access to the project's Supabase database (ask a team lead for keys)

### Setup
```bash
git clone https://github.com/aymanlaassel/pantherplay
cd pantherplay
```

### Mobile app
```bash
cd app
npm install
cp .env.example .env   # fill in your values
npx expo start
```

## Supabase local

Follow these steps to set up Supabase locally for development.

### 1. Install Docker

Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/).

Make sure Docker Desktop is running before starting Supabase.

### 2. Install the Supabase CLI

If you haven't installed the Supabase CLI, run:

```bash
brew install supabase/tap/supabase
```

### 3. Set up environment variables

From the repository root, run:

```bash
cp app/.env.example app/.env
```

Replace the placeholder values in `app/.env` with the Supabase Project URL and publishable key shared by Felipe in the announcements channel.

### 4. Start Supabase locally

Make sure Docker Desktop is running, then run:

```bash
supabase start
```

The first run may take longer because Supabase needs to download PostgreSQL, Authentication, and other services.

You can access the local dashboard at http://127.0.0.1:54323 when done.

### 5. To reset the local database

To clear your local data and recreate the tables from migrations, run:

```bash
supabase db reset
```

This only resets your local database, not the team's hosted database.

### 6. To Stop Supabase

When you're finished developing, run:

```bash
supabase stop
```

Scan the QR code with Expo Go to run the app.

## Why
Existing meetup apps are open to anyone, which creates trust and safety gaps. PantherPlay is built around FIU students and rewards showing up.

## Team
Built by FIU students via INIT FIU Build.
