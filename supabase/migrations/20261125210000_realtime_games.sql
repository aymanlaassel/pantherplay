-- Realtime: lets the app hear inserts and updates on games and game_players, so Discover, Map and an
-- open Game detail update live. Realtime still applies each table's RLS, so a phone only hears rows it may read.
alter publication supabase_realtime add table public.games, public.game_players;
