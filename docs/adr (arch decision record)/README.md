# Architecture Decision Records (ADRs)

An ADR is a short note explaining **one important decision**: what we chose, why, and what we gave up. Future teammates (and PantherSoft) read these to understand why the app is built the way it is.

## When to write one
When a choice would be expensive to change later: a library, a database design, how login works, a scope cut.

## How
Copy `0000-template.md` to the next number (`0001-...md`), fill it in, and include it in your PR.

## Decisions waiting for an ADR (from HANDOVER.md)
- 0001 Platform: React Native + Expo
- 0002 Backend: Supabase
- 0003 Auth: Google sign-in now, FIU login later (PantherSoft)
- 0004 No map API for the MVP
- 0005 Navigation library (Expo Router recommended)
- 0006 Server-state library (TanStack Query recommended)
