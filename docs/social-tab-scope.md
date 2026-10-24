# Social tab: v1 scope

**Status: Proposed, needs Felipe's sign-off.** Nothing here is final until Felipe says yes.

## What Social is for

Pickup games are more fun with people you know. The Social tab answers two questions:
"who are my friends on PantherPlay?" and "what are they playing soon?"

## In v1 (proposed)

1. **Friends list with search.** A list of your friends: photo (or initials if there is no
   photo), name and home campus. A search bar at the top filters the list as you type.
2. **Playing soon.** Upcoming games that your friends host or have joined, soonest first.
   Tapping one opens the normal game screen, so you can join them.
3. **Add friend.** Search other students by name and send a request. Until they accept,
   they show in your list with a "Pending" badge.

The first skeleton (W2-09) builds all three on mock data. The "Add friend" button is there
but does nothing yet.

## Not in v1

- **In-app chat.** CLAUDE.md says chat needs Felipe's go-ahead before anyone builds it.
- **Friend-requests backend.** No table, no RPC, no notifications yet. The screen uses mock data.
- **Groups**, **DMs** (direct messages) and an **activity feed** ("Ana joined a game").

## Open questions for Felipe

1. **Friends or followers?** Friends means both people must accept (like Facebook).
   Followers means one-way, no approval needed (like Instagram). This changes the data model.
2. **What does a FRIENDS table look like?** One row per pair (Ana-Ben stored once, plus a
   status like `pending` / `accepted`), or two rows, one per direction? One row per pair is
   simpler to keep consistent; two rows are simpler to query.
3. **Privacy of "Playing soon".** Can any friend see every game you join, or should there be
   a setting to hide it? This decides the RLS policy (the database rule for who can read which row).
4. **Is chat ever in Social?** If yes later, does Social become two sections (friends + chat)?

Once these are answered, the FRIENDS table goes in `supabase/migrations/` with its RLS
policies, and `docs/ARCHITECTURE.md` drops "scope pending" from the Social box.
