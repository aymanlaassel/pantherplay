# Architecture Decision Records (ADRs)

An ADR is a short note explaining **one important decision**: what we chose, why, and what we gave up. Future teammates (and PantherSoft) read these to understand why the app is built the way it is. Keeping them is good practice for any project that will be handed off, and PantherPlay will be handed to PantherSoft.

## When to write one
When a choice would be expensive to change later: a library, a database design, how login works, a scope cut.

## How
Copy `0000-template.md` to the next number (`0001-...md`), fill it in, and include it in your PR.

## Decisions waiting for an ADR
Status in brackets. "Decided" means the choice is made and only the write-up is missing.

- 0001 Platform: React Native + Expo **[decided]**
- 0002 Backend: Supabase **[pending: depends on 0007]**
- 0003 Auth: Google sign-in now, FIU login later (PantherSoft) **[decided]**
- 0004 Map tab: uses the fixed campus locations table, no paid map API **[decided: react-native-maps, see 0004]**
- 0005 Navigation: Expo Router, a Stack at the root with Tabs inside **[decided: built in #13]**
- 0006 Server-state library (TanStack Query recommended) **[open]**
- 0007 What happens to `server/` (Express + Prisma): remove or keep **[open: ticket W2-12]**
