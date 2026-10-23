# PantherPlay

A students-only app for organizing pickup sports games at FIU. React Native + Expo (TypeScript) and Supabase.

## Read first
- `docs/ARCHITECTURE.md`: visual diagrams of the system, folders, screen flow, database and owners.
- `docs/adr/`: why each big decision was made.

## The team is mostly beginners
- Explain what you changed and why in plain language, and keep PRs small (1–2 days of work).
- When you introduce a new concept (RLS, migrations, hooks, Realtime), add a one-line explanation in your reply.

## Rules
- **Open decisions:** if a task depends on something not yet decided, ask Felipe instead of picking.
- **Don't build without Felipe's go-ahead:** in-app chat, payments, a web app, FIU login.
- **Tabs (decided):** Discover · Map · [+] · Social · Profile. What Social contains (friends vs chat) and where My Games lives are still open: ask Felipe.
- **Auth:** only `src/lib/auth.ts` may know about the login provider (Google for now, FIU later). Key everything on the Supabase user id.
- **Game capacity** is enforced in the database (`join_game` RPC), never in the app.
- **Database changes** go in `supabase/migrations/` only, with matching RLS policies.
- **Design:** use the theme tokens in `src/theme`, never raw hex values. Component names match the Figma library. New components need Felipe's approval.
- **Times** are `timestamptz`, shown in the device timezone.
- **Docs stay current:** if a PR changes the architecture (a table, a screen, a service), update the matching diagram in `docs/ARCHITECTURE.md` in the same PR. Record significant choices as ADRs in `docs/adr/`.

## Commands
Fill these in once the Expo app is scaffolded:
- Start the app: `npx expo start`
- Lint / typecheck / test: _TBD_
- Supabase local: _TBD_
