// Every screen gets games from here, from Supabase. Join, Leave and Create go through the
// database's functions, which decide capacity; the reads use RLS-protected selects.
import type { Campus } from '@/components/campus-toggle';
import { getUserId } from '@/lib/auth';
import { endsAt } from '@/lib/format-time';
import { supabase } from '@/lib/supabase';

import { myPlace } from './my-place';
import { GAME_COLUMNS, toGameRecord, type GameRow } from './rows';
import type { Game, GameRecord, JoinResult, NewGame } from './types';

// Postgres's code for text that isn't a valid id, like a mistyped link.
const INVALID_ID = '22P02';
// The longest a game can last (2 hours), so a game that started this long ago has surely ended.
const LONGEST_GAME_MS = 120 * 60_000;

// The database can only filter by start: ask for games that started after this, then drop the ended ones with notEnded.
export const startedAfter = (now: Date) => new Date(now.getTime() - LONGEST_GAME_MS).toISOString();
export const notEnded = (games: Game[], now: Date) => games.filter((game) => new Date(endsAt(game.startsAt, game.durationMinutes)) > now);

// Spots filled and my place are counted from the players, not stored.
function withCounts(record: GameRecord, me: string | null, hostGames: Map<string, number>): Game {
  return {
    ...record,
    spotsFilled: record.players.filter((p) => p.status === 'joined').length,
    hostGamesCount: hostGames.get(record.host.id) ?? 0,
    ...myPlace(record, me),
  };
}

// How many games each host has posted, not counting cancelled ones. One request for all hosts.
async function countHostGames(hostIds: string[]): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (hostIds.length === 0) return counts;
  const { data, error } = await supabase.from('games').select('host_id').in('host_id', [...new Set(hostIds)]).neq('status', 'cancelled');
  if (error) throw new Error(error.message);
  for (const { host_id } of data as { host_id: string }[]) counts.set(host_id, (counts.get(host_id) ?? 0) + 1);
  return counts;
}

// Rows from a GAME_COLUMNS select, as screens get them: counted, with my place in each.
export async function toGames(rows: GameRow[]): Promise<Game[]> {
  const records = rows.map(toGameRecord);
  const [me, hostGames] = await Promise.all([getUserId(), countHostGames(records.map((r) => r.host.id))]);
  return records.map((record) => withCounts(record, me, hostGames));
}

// Games on a campus that haven't ended, soonest first. Cancelled and completed games are not listed.
export async function getGames(campus: Campus, now: Date = new Date()): Promise<Game[]> {
  const { data, error } = await supabase
    .from('games')
    .select(GAME_COLUMNS)
    .eq('location.campus', campus)
    .neq('status', 'cancelled')
    .neq('status', 'completed')
    .gt('starts_at', startedAfter(now))
    .order('starts_at');
  if (error) throw new Error(error.message);
  return notEnded(await toGames(data as unknown as GameRow[]), now);
}

// One game, or null if no game has this id. A cancelled game is still returned, so its page can say so.
export async function getGame(id: string): Promise<Game | null> {
  const { data, error } = await supabase.from('games').select(GAME_COLUMNS).eq('id', id).maybeSingle();
  if (error?.code === INVALID_ID) return null;
  if (error) throw new Error(error.message);
  if (!data) return null;
  const [game] = await toGames([data as unknown as GameRow]);
  return game;
}

// The database decides Joined or Waitlisted: join_game locks the game and counts its spots.
export async function joinGame(id: string): Promise<JoinResult> {
  const { data, error } = await supabase.rpc('join_game', { p_game_id: id });
  if (error) throw new Error(error.message);
  if (data !== 'joined' && data !== 'waitlisted') throw new Error('Unexpected answer from join_game');
  return data;
}

// If you had a spot, leave_game gives it to the first waitlisted player.
export async function leaveGame(id: string): Promise<void> {
  const { error } = await supabase.rpc('leave_game', { p_game_id: id });
  if (error) throw new Error(error.message);
}

// Only the host may cancel; cancel_game checks that, so a player's call comes back as an error.
export async function cancelGame(id: string): Promise<void> {
  const { error } = await supabase.rpc('cancel_game', { p_game_id: id });
  if (error) throw new Error(error.message);
}

// Each subscription needs its own channel name: Discover and Map can listen at the same time.
let channels = 0;

// Realtime: calls `onChange` whenever any game is posted or changed. Returns a function that stops listening.
export function onGamesChange(onChange: () => void): () => void {
  const channel = supabase
    .channel(`games-${++channels}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'games' }, () => onChange())
    .subscribe();
  return () => void supabase.removeChannel(channel);
}

// Realtime: calls `onChange` whenever someone joins, leaves or is moved off the waitlist of one game.
export function onGamePlayersChange(gameId: string, onChange: () => void): () => void {
  const channel = supabase
    .channel(`game-players-${++channels}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'game_players', filter: `game_id=eq.${gameId}` }, () => onChange())
    .subscribe();
  return () => void supabase.removeChannel(channel);
}

// Posts the game with you as host and first player, and returns its id.
// The database checks the time, duration, location and sport, so errors come back from there.
export async function createGame(input: NewGame): Promise<string> {
  const { data, error } = await supabase.rpc('create_game', {
    p_sport: input.sport,
    p_location_id: input.locationId,
    p_starts_at: input.startsAt,
    p_duration_minutes: input.durationMinutes,
    p_max_players: input.maxPlayers,
    p_skill_level: input.skillLevel,
    p_notes: input.notes,
  });
  if (error) throw new Error(error.message);
  if (typeof data !== 'string') throw new Error('Unexpected answer from create_game');
  return data;
}
