// A stand-in for src/api/games.ts that works on the mock games, for screen tests that aren't
// about the database. In a test: jest.mock('@/api/games', () => require('@/mock/games-api'));
import { delay } from '@/api/delay';
import { SPORTS } from '@/api/sports';
import type { Game, GameRecord, JoinResult, NewGame } from '@/api/types';
import type { Campus } from '@/components/campus-toggle';

import { mockGames } from './games';
import { LOCATIONS } from './locations';
import { ME } from './people';

let created = 0;

function withCounts(record: GameRecord): Game {
  const mine = record.players.find((p) => p.profile.id === ME.id)?.status;
  return {
    ...record,
    spotsFilled: record.players.filter((p) => p.status === 'joined').length,
    hostGamesCount: mockGames().filter((g) => g.host.id === record.host.id && g.status !== 'cancelled').length,
    myStatus: mine === 'joined' || mine === 'waitlisted' ? mine : null,
  };
}

function find(id: string): GameRecord {
  const record = mockGames().find((g) => g.id === id);
  if (!record) throw new Error('Game not found');
  return record;
}

export async function getGames(campus: Campus): Promise<Game[]> {
  await delay();
  return mockGames()
    .filter((g) => g.location.campus === campus && g.status !== 'cancelled')
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .map(withCounts);
}

export async function getGame(id: string): Promise<Game | null> {
  await delay();
  const record = mockGames().find((g) => g.id === id);
  return record ? withCounts(record) : null;
}

// Plays the part of join_game: joined if there is room, waitlisted if full.
export async function joinGame(id: string): Promise<JoinResult> {
  await delay();
  const record = find(id);
  if (record.status === 'cancelled') throw new Error('Game is cancelled');
  const mine = record.players.find((p) => p.profile.id === ME.id);
  if (mine?.status === 'joined' || mine?.status === 'waitlisted') return mine.status;
  const status: JoinResult = withCounts(record).spotsFilled >= record.maxPlayers ? 'waitlisted' : 'joined';
  if (mine) Object.assign(mine, { status, joinedAt: new Date().toISOString() });
  else record.players.push({ profile: ME, status, joinedAt: new Date().toISOString() });
  return status;
}

export async function leaveGame(id: string): Promise<void> {
  await delay();
  const mine = find(id).players.find((p) => p.profile.id === ME.id);
  if (mine) mine.status = 'left';
}

export async function createGame(input: NewGame): Promise<string> {
  await delay();
  const location = LOCATIONS.find((l) => l.id === input.locationId);
  const sport = SPORTS.find((s) => s.code === input.sport);
  if (!location || !sport) throw new Error('Unknown location or sport');
  created += 1;
  const { locationId, ...rest } = input;
  const id = `new-${created}`;
  mockGames().push({
    ...rest,
    id,
    host: ME,
    sport,
    location,
    notes: rest.notes.trim() || null,
    status: 'open',
    players: [{ profile: ME, status: 'joined', joinedAt: new Date().toISOString() }],
  });
  return id;
}
