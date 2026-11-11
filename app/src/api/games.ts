// Every screen gets games from here. These return mock data and are replaced by Supabase calls in W3-08.
import type { Campus } from '@/components/campus-toggle';
import { mockGames } from '@/mock/games';
import { LOCATIONS } from '@/mock/locations';

import { SPORTS } from './sports';
import { ME } from '@/mock/people';

import { delay } from './delay';
import type { Game, GameRecord, JoinResult, NewGame } from './types';

let created = 0;

// Spots filled and my place are counted from the players, not stored.
function withCounts(record: GameRecord): Game {
  const mine = record.players.find((p) => p.profile.id === ME.id)?.status;
  return {
    ...record,
    spotsFilled: record.players.filter((p) => p.status === 'joined').length,
    myStatus: mine === 'joined' || mine === 'waitlisted' ? mine : null,
  };
}

function find(id: string): GameRecord {
  const record = mockGames().find((g) => g.id === id);
  if (!record) throw new Error('Game not found');
  return record;
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

// Imitates the join_game RPC: the database, not the app, decides Joined or Waitlisted.
export async function joinGame(id: string): Promise<JoinResult> {
  await delay();
  const record = find(id);
  if (record.status === 'cancelled') throw new Error('Game is cancelled');
  const mine = record.players.find((p) => p.profile.id === ME.id);
  if (mine?.status === 'joined' || mine?.status === 'waitlisted') return mine.status;
  const full = withCounts(record).spotsFilled >= record.maxPlayers;
  const status = full ? 'waitlisted' : 'joined';
  if (mine) Object.assign(mine, { status, joinedAt: new Date().toISOString() });
  else record.players.push({ profile: ME, status, joinedAt: new Date().toISOString() });
  return status;
}

export async function leaveGame(id: string): Promise<void> {
  await delay();
  const mine = find(id).players.find((p) => p.profile.id === ME.id);
  if (mine) mine.status = 'left';
}

export async function createGame(input: NewGame): Promise<Game> {
  await delay();
  // Like the location_id foreign key: only a spot from the fixed list is accepted.
  const location = LOCATIONS.find((l) => l.id === input.locationId);
  if (!location) throw new Error('Unknown location');
  const sport = SPORTS.find((s) => s.code === input.sport);
  if (!sport) throw new Error('Unknown sport');
  created += 1;
  const { locationId, ...rest } = input;
  const record: GameRecord = {
    ...rest,
    id: `new-${created}`,
    host: ME,
    sport,
    location,
    notes: rest.notes || null,
    status: 'open',
    players: [{ profile: ME, status: 'joined', joinedAt: new Date().toISOString() }],
  };
  mockGames().push(record);
  return withCounts(record);
}
