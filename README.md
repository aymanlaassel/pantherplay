# 🐾 FIU PantherPlay

A mobile app for organizing pickup sports games on FIU's campus.

Turn "we need 2 more for 5v5 tonight" group chats into a live board students actually check.

> 🚧 In development

## Features
- **Post & join games**: soccer, basketball, flag football, volleyball
- **Real-time board**: see what's happening on campus right now
- **Filters**: location (Rec Center, Panther Field, MMC/BBC courts), skill level, headcount needed
- **Recurring squads**: build regular groups for weekly runs
- **Lightweight rep system**: attendance rate + quick post-game ratings to build trust

## Planned
- **FIU-email login** to keep it a trusted, students-only space (pending school authorization)

## Tech Stack
| Layer | Tech |
|---|---|
| Mobile app | React Native + Expo |
| Backend | Node.js + Express |
| Database | PostgreSQL or MongoDB (users, games, RSVPs) |
| Real-time sync & notifications | Firebase or Supabase |
| Maps & location | Google Maps API or Mapbox |

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) (LTS)
- [Expo Go](https://expo.dev/go) on your phone, or an iOS/Android emulator
- Access to the project's database and Firebase/Supabase (ask a team lead for keys)

### Setup
```bash
git clone https://github.com/aymanlaassel/pantherplay
cd pantherplay
```

### Backend
```bash
cd server
npm install
cp .env.example .env   # fill in your values
npm start
```

### Mobile app (new terminal)
```bash
cd app
npm install
cp .env.example .env   # fill in your values
npx expo start
```

Scan the QR code with Expo Go to run the app.

## Why
Existing meetup apps are open to anyone, which creates trust and safety gaps. PantherPlay is built around FIU students and rewards showing up.

## Team
Built by FIU students via INIT FIU Build.
