import { getGamesPlayed, getMyGames, getMyGamesPlayed, getPlayer } from '@/api/profile';
import type { GameRow } from '@/api/rows';
import { getUserId } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/auth', () => ({ getUserId: jest.fn() }));
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

const from = supabase.from as jest.Mock;
type Result = { data: unknown; error: { message: string; code?: string } | null };

// A stand-in for one supabase.from() query: every filter returns the query; awaiting it gives `result`.
function queue(result: Result) {
  const query: Record<string, unknown> = {
    then: (onDone: (r: Result) => unknown, onFail: (e: unknown) => unknown) => Promise.resolve(result).then(onDone, onFail),
    maybeSingle: jest.fn(async () => result),
  };
  for (const name of ['select', 'eq', 'neq', 'lt', 'gt', 'or', 'in', 'order']) query[name] = jest.fn(() => query);
  from.mockReturnValueOnce(query);
  return query as Record<'select' | 'eq' | 'neq' | 'lt' | 'gt' | 'or' | 'in' | 'order' | 'maybeSingle', jest.Mock>;
}

beforeEach(() => {
  from.mockReset();
  jest.mocked(getUserId).mockResolvedValue('me');
});

describe('getPlayer', () => {
  test('reads one profile by id, in the contract shape', async () => {
    const query = queue({ data: { id: 'p1', display_name: 'Maya T.', avatar_url: null, campus: 'BBC' }, error: null });
    expect(await getPlayer('p1')).toEqual({ id: 'p1', fullName: 'Maya T.', avatarUrl: null, campus: 'BBC' });
    expect(from).toHaveBeenCalledWith('profiles');
    expect(query.eq).toHaveBeenCalledWith('id', 'p1');
  });

  test('returns null for a missing player or an id that is not valid', async () => {
    queue({ data: null, error: null });
    expect(await getPlayer('gone')).toBeNull();
    queue({ data: null, error: { message: 'invalid input syntax for type uuid', code: '22P02' } });
    expect(await getPlayer('nope')).toBeNull();
  });

  test('throws on any other error', async () => {
    queue({ data: null, error: { message: 'Network request failed' } });
    await expect(getPlayer('p1')).rejects.toThrow('Network request failed');
  });
});

describe('getGamesPlayed', () => {
  const now = new Date('2026-11-25T20:00:00Z');

  test('counts joined, not-cancelled games that have ended, leaving out one still being played', async () => {
    const query = queue({
      data: [
        { game: { starts_at: '2026-11-20T18:00:00Z', duration_minutes: 90 } },
        { game: { starts_at: '2026-11-25T18:00:00Z', duration_minutes: 120 } }, // ended exactly now
        { game: { starts_at: '2026-11-25T19:30:00Z', duration_minutes: 60 } }, // still being played
      ],
      error: null,
    });
    expect(await getGamesPlayed('p1', now)).toBe(2);
    expect(from).toHaveBeenCalledWith('game_players');
    expect(query.eq).toHaveBeenCalledWith('user_id', 'p1');
    expect(query.eq).toHaveBeenCalledWith('status', 'joined');
    expect(query.neq).toHaveBeenCalledWith('game.status', 'cancelled');
    expect(query.lt).toHaveBeenCalledWith('game.starts_at', now.toISOString());
  });

  test('no games is 0, and an error throws', async () => {
    queue({ data: [], error: null });
    expect(await getGamesPlayed('p1', now)).toBe(0);
    queue({ data: null, error: { message: 'JWT expired' } });
    await expect(getGamesPlayed('p1', now)).rejects.toThrow('JWT expired');
  });
});

describe('getMyGamesPlayed', () => {
  test('counts for the signed-in user, and is 0 when nobody is signed in', async () => {
    const query = queue({ data: [{ game: { starts_at: '2020-01-01T18:00:00Z', duration_minutes: 60 } }], error: null });
    expect(await getMyGamesPlayed()).toBe(1);
    expect(query.eq).toHaveBeenCalledWith('user_id', 'me');

    jest.mocked(getUserId).mockResolvedValueOnce(null);
    expect(await getMyGamesPlayed()).toBe(0);
  });
});

describe('getMyGames', () => {
  const now = new Date('2026-11-25T20:00:00Z');
  const me = { id: 'me', display_name: 'Panther Student', avatar_url: null, campus: 'MMC' as const };
  const row = (id: string, startsAt: string, duration: 60 | 90 | 120 = 60): GameRow => ({
    id,
    starts_at: startsAt,
    duration_minutes: duration,
    skill_level: 'beginner',
    max_players: 10,
    notes: null,
    status: 'open',
    host: me,
    sport: { code: 'soccer', name: 'Soccer' },
    location: { id: 'loc', campus: 'MMC', name: 'Field', photo_url: null, latitude: 0, longitude: 0 },
    players: [{ status: 'joined', joined_at: startsAt, profile: me }],
  });

  test('asks for games I host or joined, not cancelled, soonest first, and drops ones that ended', async () => {
    const players = queue({ data: [{ game_id: 'g1' }, { game_id: 'g2' }], error: null });
    const games = queue({ data: [row('ended', '2026-11-25T18:30:00Z'), row('playing', '2026-11-25T19:30:00Z'), row('later', '2026-11-26T18:00:00Z')], error: null });
    queue({ data: [], error: null }); // the hosts' game counts
    expect((await getMyGames(now)).map((g) => g.id)).toEqual(['playing', 'later']);
    expect(players.eq).toHaveBeenCalledWith('user_id', 'me');
    expect(players.eq).toHaveBeenCalledWith('status', 'joined');
    expect(games.or).toHaveBeenCalledWith('host_id.eq.me,id.in.(g1,g2)');
    expect(games.neq).toHaveBeenCalledWith('status', 'cancelled');
    expect(games.gt).toHaveBeenCalledWith('starts_at', '2026-11-25T18:00:00.000Z');
    expect(games.order).toHaveBeenCalledWith('starts_at');
  });

  test('with no joined games it still finds games I host', async () => {
    queue({ data: [], error: null });
    const games = queue({ data: [], error: null });
    expect(await getMyGames(now)).toEqual([]);
    expect(games.or).toHaveBeenCalledWith('host_id.eq.me');
  });

  test('nobody signed in has no games, and either request failing throws', async () => {
    jest.mocked(getUserId).mockResolvedValueOnce(null);
    expect(await getMyGames(now)).toEqual([]);
    expect(from).not.toHaveBeenCalled();

    queue({ data: null, error: { message: 'Network request failed' } });
    await expect(getMyGames(now)).rejects.toThrow('Network request failed');

    queue({ data: [], error: null });
    queue({ data: null, error: { message: 'JWT expired' } });
    await expect(getMyGames(now)).rejects.toThrow('JWT expired');
  });
});
