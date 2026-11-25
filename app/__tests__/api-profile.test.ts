import { getGamesPlayed, getPlayer } from '@/api/profile';
import { supabase } from '@/lib/supabase';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

const from = supabase.from as jest.Mock;
type Result = { data: unknown; error: { message: string; code?: string } | null };

// A stand-in for one supabase.from() query: every filter returns the query; awaiting it gives `result`.
function queue(result: Result) {
  const query: Record<string, unknown> = {
    then: (onDone: (r: Result) => unknown, onFail: (e: unknown) => unknown) => Promise.resolve(result).then(onDone, onFail),
    maybeSingle: jest.fn(async () => result),
  };
  for (const name of ['select', 'eq', 'neq', 'lt']) query[name] = jest.fn(() => query);
  from.mockReturnValueOnce(query);
  return query as Record<'select' | 'eq' | 'neq' | 'lt' | 'maybeSingle', jest.Mock>;
}

beforeEach(() => from.mockReset());

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
