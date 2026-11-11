// The one mock games set. It is hostile on purpose: full, cancelled, starting soon, long text,
// no avatars, and 47 games on one day. Behind src/api/games.ts until Supabase is wired in (W3-08).
import { SPORTS } from '@/api/sports';
import type { GameRecord, SportCode } from '@/api/types';

import { BBC_FIELD, FIELD, LONG_NAME, REC } from './locations';
import { crowd, me, person } from './people';
import { todayAt } from './today-at';

const sport = (code: SportCode) => SPORTS.find((s) => s.code === code)!;

const game = (id: string, over: Partial<GameRecord> = {}): GameRecord => ({
  id,
  host: person(1, 'Alex R.'),
  sport: sport('soccer'),
  location: FIELD,
  startsAt: todayAt(19),
  durationMinutes: 60,
  skillLevel: 'beginner',
  maxPlayers: 10,
  notes: 'Bring a white and a dark shirt. We split teams on arrival.',
  status: 'open',
  players: crowd(7),
  ...over,
});

const seed = (): GameRecord[] => [
  game('1', { status: 'confirmed' }),
  game('2', { sport: sport('basketball'), host: person(2, 'Maya T.'), location: REC, startsAt: todayAt(18, 30), durationMinutes: 90, skillLevel: 'intermediate', players: [...crowd(8), me('joined')] }),
  game('3', { sport: sport('volleyball'), host: person(3, 'Jordan P.'), location: BBC_FIELD, startsAt: todayAt(17), skillLevel: 'advanced', players: crowd(5) }),
  game('full', { players: crowd(10) }),
  game('cancelled', { status: 'cancelled' }),
  game('soon', { startsAt: new Date(Date.now() + 5 * 60_000).toISOString() }),
  game('long-text', { host: person(4, 'Bartholomew Maximilian Fitzgerald-Montgomery III'), location: LONG_NAME, notes: 'N'.repeat(140) }),
  ...Array.from({ length: 47 }, (_, i) =>
    game(`day-${i + 1}`, { sport: SPORTS[i % SPORTS.length], location: BBC_FIELD, startsAt: todayAt(6 + (i % 17), (i % 2) * 30), players: crowd(i % 10) }),
  ),
];

const games = seed();

export const mockGames = () => games;

// Back to the starting set, or to the games given (an empty list shows the empty state).
export const resetMockGames = (next: GameRecord[] = seed()) => games.splice(0, games.length, ...next);
