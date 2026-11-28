import {
  confirmAdult,
  finishOnboarding,
  getGamesPlayed,
  getMyCampus,
  getMyGames,
  getMyGamesPlayed,
  getMySports,
  getPlayer,
  getProfile,
  hasConfirmedAdult,
  hasFinishedOnboarding,
  saveCampus,
  saveSports,
} from '@/api/profile';
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
  for (const name of ['select', 'eq', 'neq', 'lt', 'gt', 'or', 'in', 'order', 'update', 'delete', 'insert']) query[name] = jest.fn(() => query);
  from.mockReturnValueOnce(query);
  return query as Record<'select' | 'eq' | 'neq' | 'lt' | 'gt' | 'or' | 'in' | 'order' | 'update' | 'delete' | 'insert' | 'maybeSingle', jest.Mock>;
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

describe('onboarding: campus', () => {
  test('saveCampus writes the campus on my profile row', async () => {
    const query = queue({ data: null, error: null });
    await saveCampus('BBC');
    expect(from).toHaveBeenCalledWith('profiles');
    expect(query.update).toHaveBeenCalledWith({ campus: 'BBC' });
    expect(query.eq).toHaveBeenCalledWith('id', 'me');
  });

  test('saveCampus throws when the database says no', async () => {
    queue({ data: null, error: { message: 'permission denied' } });
    await expect(saveCampus('MMC')).rejects.toThrow('permission denied');
  });

  test('getMyCampus reads my campus, and is null when nobody is signed in', async () => {
    queue({ data: { campus: 'MMC' }, error: null });
    expect(await getMyCampus()).toBe('MMC');
    jest.mocked(getUserId).mockResolvedValue(null);
    expect(await getMyCampus()).toBeNull();
  });
});

describe('onboarding: sports', () => {
  test('saveSports removes my old rows, then adds one row per sport', async () => {
    const remove = queue({ data: null, error: null });
    const add = queue({ data: null, error: null });
    await saveSports([
      { sport: 'soccer', level: 'intermediate' },
      { sport: 'tennis', level: 'beginner' },
    ]);
    expect(from).toHaveBeenNthCalledWith(1, 'profile_sports');
    expect(remove.delete).toHaveBeenCalled();
    expect(remove.eq).toHaveBeenCalledWith('user_id', 'me');
    expect(add.insert).toHaveBeenCalledWith([
      { user_id: 'me', sport: 'soccer', level: 'intermediate' },
      { user_id: 'me', sport: 'tennis', level: 'beginner' },
    ]);
  });

  test('saveSports stops if removing the old rows fails', async () => {
    queue({ data: null, error: { message: 'Network request failed' } });
    await expect(saveSports([{ sport: 'soccer', level: 'advanced' }])).rejects.toThrow('Network request failed');
    expect(from).toHaveBeenCalledTimes(1);
  });

  test('saveSports throws when adding the new rows fails', async () => {
    queue({ data: null, error: null });
    queue({ data: null, error: { message: 'violates foreign key' } });
    await expect(saveSports([{ sport: 'soccer', level: 'advanced' }])).rejects.toThrow('violates foreign key');
  });

  test('getMySports reads my rows of profile_sports', async () => {
    const query = queue({ data: [{ sport: 'volleyball', level: 'beginner' }], error: null });
    expect(await getMySports()).toEqual([{ sport: 'volleyball', level: 'beginner' }]);
    expect(from).toHaveBeenCalledWith('profile_sports');
    expect(query.eq).toHaveBeenCalledWith('user_id', 'me');
  });
});

describe('getProfile', () => {
  test('reads the signed-in user\'s row: real name, photo and campus', async () => {
    const query = queue({
      data: { id: 'me', display_name: 'Ana Lopez', avatar_url: 'https://example.com/ana.png', campus: 'MMC' },
      error: null,
    });
    expect(await getProfile()).toEqual({ id: 'me', fullName: 'Ana Lopez', avatarUrl: 'https://example.com/ana.png', campus: 'MMC' });
    expect(from).toHaveBeenCalledWith('profiles');
    expect(query.eq).toHaveBeenCalledWith('id', 'me');
  });

  test('throws when the row is missing, on an error, or when nobody is signed in', async () => {
    queue({ data: null, error: null });
    await expect(getProfile()).rejects.toThrow('Profile not found');
    queue({ data: null, error: { message: 'Network request failed' } });
    await expect(getProfile()).rejects.toThrow('Network request failed');
    jest.mocked(getUserId).mockResolvedValue(null);
    await expect(getProfile()).rejects.toThrow('Not signed in');
  });
});

describe('onboarding status', () => {
  test('finishOnboarding stamps onboarding_completed_at on my row', async () => {
    const query = queue({ data: null, error: null });
    await finishOnboarding();
    expect(from).toHaveBeenCalledWith('profiles');
    expect(query.update).toHaveBeenCalledWith({ onboarding_completed_at: expect.any(String) });
    expect(query.eq).toHaveBeenCalledWith('id', 'me');
  });

  test('finishOnboarding throws when the database says no', async () => {
    queue({ data: null, error: { message: 'permission denied' } });
    await expect(finishOnboarding()).rejects.toThrow('permission denied');
  });

  test('hasFinishedOnboarding: new user false, returning user true', async () => {
    queue({ data: { onboarding_completed_at: null }, error: null });
    expect(await hasFinishedOnboarding()).toBe(false);
    queue({ data: { onboarding_completed_at: '2026-11-20T18:00:00Z' }, error: null });
    expect(await hasFinishedOnboarding()).toBe(true);
  });

  test('hasFinishedOnboarding is false when signed out, and throws on an error', async () => {
    queue({ data: null, error: { message: 'Network request failed' } });
    await expect(hasFinishedOnboarding()).rejects.toThrow('Network request failed');
    jest.mocked(getUserId).mockResolvedValue(null);
    expect(await hasFinishedOnboarding()).toBe(false);
  });
});

describe('18+ confirmation', () => {
  test('confirmAdult stamps adult_confirmed_at on my row', async () => {
    const query = queue({ data: null, error: null });
    await confirmAdult();
    expect(from).toHaveBeenCalledWith('profiles');
    expect(query.update).toHaveBeenCalledWith({ adult_confirmed_at: expect.any(String) });
    expect(query.eq).toHaveBeenCalledWith('id', 'me');
  });

  test('confirmAdult throws when the database says no, or nobody is signed in', async () => {
    queue({ data: null, error: { message: 'permission denied' } });
    await expect(confirmAdult()).rejects.toThrow('permission denied');
    jest.mocked(getUserId).mockResolvedValue(null);
    await expect(confirmAdult()).rejects.toThrow('Not signed in');
  });

  test('hasConfirmedAdult: false until confirmed, then true', async () => {
    queue({ data: { adult_confirmed_at: null }, error: null });
    expect(await hasConfirmedAdult()).toBe(false);
    queue({ data: { adult_confirmed_at: '2026-11-20T17:00:00Z' }, error: null });
    expect(await hasConfirmedAdult()).toBe(true);
  });
});
