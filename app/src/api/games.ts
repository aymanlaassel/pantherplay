// Every screen gets games from here. Join, Leave and Create call the database's functions;
// the reads still return mock data until they are swapped for Supabase calls (W3-08).
import type { Campus } from '@/components/campus-toggle';
import { supabase } from '@/lib/supabase';
import { mockGames } from '@/mock/games';
import { ME } from '@/mock/people';

import { delay } from './delay';
import type { Game, GameRecord, JoinResult, NewGame } from './types';

// Spots filled and my place are counted from the players, not stored.
function withCounts(record: GameRecord): Game {
  const mine = record.players.find((p) => p.profile.id === ME.id)?.status;
  return {
    ...record,
    spotsFilled: record.players.filter((p) => p.status === 'joined').length,
    hostGamesCount: mockGames().filter((g) => g.host.id === record.host.id && g.status !== 'cancelled').length,
    myStatus: mine === 'joined' || mine === 'waitlisted' ? mine : null,
  };
}

// Games on a campus, soonest first. Cancelled games are not listed.
export async function getGames(campus: Campus): Promise<Game[]> {
  await delay();
  return mockGames()
    .filter((g) => g.location.campus === campus && g.status !== 'cancelled')
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .map(withCounts);
}

// One game, or null if no game has this id.
export async function getGame(id: string): Promise<Game | null> {
  await delay();
  const record = mockGames().find((g) => g.id === id);
  return record ? withCounts(record) : null;
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
