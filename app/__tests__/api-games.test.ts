import { createGame, getGame, getGames, joinGame, leaveGame } from '@/api/games';
import { getLocations } from '@/api/locations';
import type { NewGame } from '@/api/types';
import { supabase } from '@/lib/supabase';
import { mockGames, resetMockGames } from '@/mock/games';

jest.mock('@/api/delay', () => ({ delay: () => Promise.resolve() }));

const rpc = supabase.rpc as jest.Mock;
// What supabase.rpc resolves to: the function's answer, or the error Postgres raised.
const answers = (data: unknown) => rpc.mockResolvedValueOnce({ data, error: null });
const fails = (message: string) => rpc.mockResolvedValueOnce({ data: null, error: { message } });

beforeEach(() => {
  resetMockGames();
  rpc.mockClear();
});

describe('getGames', () => {
  test('lists a campus soonest first and hides cancelled games', async () => {
    const games = await getGames('MMC');
    const ids = games.map((game) => game.id);
    expect(ids).toEqual(expect.arrayContaining(['1', '2', 'full']));
    expect(ids).not.toContain('cancelled');
    expect(ids).not.toContain('3');
    const times = games.map((game) => game.startsAt);
    expect(times).toEqual([...times].sort());
  });

  test('can return an empty list', async () => {
    resetMockGames([]);
    expect(await getGames('MMC')).toEqual([]);
  });

  test('counts spots filled from the joined players, not stored', async () => {
    expect(await getGame('1')).toMatchObject({ spotsFilled: 7, myStatus: null });
    expect(await getGame('full')).toMatchObject({ spotsFilled: 10 });
  });
});

describe('getGame', () => {
  test('returns null for an unknown id', async () => {
    expect(await getGame('nope')).toBeNull();
  });

  test('still returns a cancelled game, so its page can say so', async () => {
    expect(await getGame('cancelled')).toMatchObject({ status: 'cancelled' });
  });
});

describe('joinGame', () => {
  test('asks join_game and answers joined', async () => {
    answers('joined');
    expect(await joinGame('game-1')).toBe('joined');
    expect(rpc).toHaveBeenCalledWith('join_game', { p_game_id: 'game-1' });
  });

  test('answers waitlisted when the database says the game is full', async () => {
    answers('waitlisted');
    expect(await joinGame('game-1')).toBe('waitlisted');
  });

  test('passes on what the database rejected, like a cancelled or started game', async () => {
    fails('Game is cancelled');
    await expect(joinGame('game-1')).rejects.toThrow('Game is cancelled');
    fails('Game has already started');
    await expect(joinGame('game-1')).rejects.toThrow('Game has already started');
  });

  test('throws when the network or the session fails', async () => {
    rpc.mockRejectedValueOnce(new TypeError('Network request failed'));
    await expect(joinGame('game-1')).rejects.toThrow('Network request failed');
    fails('permission denied for function join_game'); // signed out mid-action
    await expect(joinGame('game-1')).rejects.toThrow();
  });

  test('throws instead of guessing when the answer is not joined or waitlisted', async () => {
    answers(null);
    await expect(joinGame('game-1')).rejects.toThrow('Unexpected answer');
    answers('left');
    await expect(joinGame('game-1')).rejects.toThrow('Unexpected answer');
  });
});

describe('leaveGame', () => {
  test('asks leave_game', async () => {
    answers(null);
    await expect(leaveGame('game-1')).resolves.toBeUndefined();
    expect(rpc).toHaveBeenCalledWith('leave_game', { p_game_id: 'game-1' });
  });

  test('passes on a database error', async () => {
    fails('Game not found');
    await expect(leaveGame('nope')).rejects.toThrow('Game not found');
  });
});

describe('createGame', () => {
  const input: NewGame = {
    sport: 'flag_football',
    locationId: 'a3f1c2d4-0000-4000-8000-000000000001',
    startsAt: '2026-12-01T23:00:00.000Z',
    durationMinutes: 90,
    maxPlayers: 14,
    skillLevel: 'intermediate',
    notes: 'Bring cleats',
  };

  test('sends every field to create_game, sport by code, and returns the new id', async () => {
    answers('new-game-id');
    expect(await createGame(input)).toBe('new-game-id');
    expect(rpc).toHaveBeenCalledWith('create_game', {
      p_sport: 'flag_football',
      p_location_id: 'a3f1c2d4-0000-4000-8000-000000000001',
      p_starts_at: '2026-12-01T23:00:00.000Z',
      p_duration_minutes: 90,
      p_max_players: 14,
      p_skill_level: 'intermediate',
      p_notes: 'Bring cleats',
    });
  });

  test('passes on what the database rejected', async () => {
    fails('Start time must be in the future');
    await expect(createGame(input)).rejects.toThrow('Start time must be in the future');
  });

  test('throws when no id comes back', async () => {
    answers(null);
    await expect(createGame(input)).rejects.toThrow('Unexpected answer');
  });
});

describe('no write counts spots in the app', () => {
  test('joining, leaving and creating leave the local games untouched', async () => {
    const before = JSON.stringify(mockGames());
    answers('joined');
    await joinGame('full');
    answers(null);
    await leaveGame('2');
    answers('new-game-id');
    await createGame({ sport: 'tennis', locationId: 'loc-bbc', startsAt: '2026-12-01T23:00:00.000Z', durationMinutes: 60, maxPlayers: 4, skillLevel: 'beginner', notes: '' });
    expect(JSON.stringify(mockGames())).toBe(before);
  });
});

describe('getLocations', () => {
  test('lists only the spots on the asked campus', async () => {
    expect((await getLocations('BBC')).map((l) => l.id)).toEqual(['loc-bbc']);
    expect((await getLocations('MMC')).every((l) => l.campus === 'MMC')).toBe(true);
  });
});

describe('hostGamesCount', () => {
  test("counts the host's games but not cancelled ones", async () => {
    const all = mockGames();
    const alex = all[0].host.id;
    const notCancelled = all.filter((g) => g.host.id === alex && g.status !== 'cancelled').length;
    expect(all.some((g) => g.host.id === alex && g.status === 'cancelled')).toBe(true); // so the exclusion is really tested
    expect((await getGame('1'))?.hostGamesCount).toBe(notCancelled);
  });
});
