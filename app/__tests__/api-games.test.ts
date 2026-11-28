import { cancelGame, createGame, getGame, getGames, joinGame, leaveGame, onGamePlayersChange, onGamesChange } from '@/api/games';
import { getLocations } from '@/api/locations';
import type { GameRow, LocationRow, ProfileRow } from '@/api/rows';
import type { NewGame } from '@/api/types';
import { getUserId } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/auth', () => ({ getUserId: jest.fn() }));

const rpc = supabase.rpc as jest.Mock;
const from = supabase.from as jest.Mock;
// What supabase.rpc resolves to: the function's answer, or the error Postgres raised.
const answers = (data: unknown) => rpc.mockResolvedValueOnce({ data, error: null });
const fails = (message: string) => rpc.mockResolvedValueOnce({ data: null, error: { message } });

type Result = { data: unknown; error: { message: string; code?: string } | null };
// A stand-in for one supabase.from() query: every filter returns the query, and awaiting it
// (or .maybeSingle()) gives `result`. Each call to from() takes the next queued query.
function queue(result: Result) {
  const query: Record<string, unknown> = {
    then: (onDone: (r: Result) => unknown, onFail: (e: unknown) => unknown) => Promise.resolve(result).then(onDone, onFail),
    maybeSingle: jest.fn(async () => result),
  };
  for (const name of ['select', 'eq', 'neq', 'gt', 'order', 'in']) query[name] = jest.fn(() => query);
  from.mockReturnValueOnce(query);
  return query as Record<'select' | 'eq' | 'neq' | 'gt' | 'order' | 'in' | 'maybeSingle', jest.Mock>;
}

const profile = (id: string, name: string): ProfileRow => ({ id, display_name: name, avatar_url: null, campus: 'MMC' });
const AT = '2026-11-25T23:00:00+00:00';
// An hour before AT, so the rows below are upcoming.
const NOW = new Date('2026-11-25T22:00:00Z');
const LOCATION: LocationRow = { id: 'loc-1', campus: 'MMC', name: 'Soccer Field 2', photo_url: null, latitude: 25.7596, longitude: -80.3794 };
const gameRow = (id: string, over: Partial<GameRow> = {}): GameRow => ({
  id,
  starts_at: AT,
  duration_minutes: 90,
  skill_level: 'beginner',
  max_players: 3,
  notes: null,
  status: 'open',
  host: profile('host-1', 'Alex Rivera'),
  sport: { code: 'soccer', name: 'Soccer' },
  location: LOCATION,
  players: [
    { status: 'joined', joined_at: AT, profile: profile('host-1', 'Alex Rivera') },
    { status: 'joined', joined_at: AT, profile: profile('me', 'Panther Student') },
    { status: 'left', joined_at: AT, profile: profile('p3', 'Left Early') },
    { status: 'waitlisted', joined_at: AT, profile: profile('p4', 'Wait Listed') },
  ],
  ...over,
});

beforeEach(() => {
  rpc.mockClear();
  from.mockReset();
  jest.mocked(getUserId).mockResolvedValue('me');
});

describe('getGames', () => {
  const minutesFromNow = (minutes: number) => new Date(NOW.getTime() + minutes * 60_000).toISOString();

  test('asks for the campus, without cancelled or completed games, soonest first', async () => {
    const games = queue({ data: [], error: null });
    await getGames('BBC', NOW);
    expect(from).toHaveBeenCalledWith('games');
    expect(games.eq).toHaveBeenCalledWith('location.campus', 'BBC');
    expect(games.neq).toHaveBeenCalledWith('status', 'cancelled');
    expect(games.neq).toHaveBeenCalledWith('status', 'completed');
    expect(games.gt).toHaveBeenCalledWith('starts_at', minutesFromNow(-120));
    expect(games.order).toHaveBeenCalledWith('starts_at');
  });

  test('leaves out games that ended, and keeps one still being played', async () => {
    queue({
      data: [
        gameRow('ended', { starts_at: minutesFromNow(-100), duration_minutes: 90 }),
        gameRow('playing', { starts_at: minutesFromNow(-30), duration_minutes: 90 }),
        gameRow('upcoming', { starts_at: minutesFromNow(60) }),
      ],
      error: null,
    });
    queue({ data: [], error: null });
    expect((await getGames('MMC', NOW)).map((g) => g.id)).toEqual(['playing', 'upcoming']);
  });

  test('turns each row into the contract, in camelCase', async () => {
    queue({ data: [gameRow('g1', { notes: 'Bring water' })], error: null });
    queue({ data: [{ host_id: 'host-1' }], error: null });
    const [game] = await getGames('MMC', NOW);
    expect(game).toMatchObject({
      id: 'g1',
      host: { id: 'host-1', fullName: 'Alex Rivera', avatarUrl: null, campus: 'MMC' },
      sport: { code: 'soccer', name: 'Soccer' },
      location: { id: 'loc-1', campus: 'MMC', name: 'Soccer Field 2', photoUrl: null, latitude: 25.7596, longitude: -80.3794 },
      startsAt: AT,
      durationMinutes: 90,
      skillLevel: 'beginner',
      maxPlayers: 3,
      notes: 'Bring water',
      status: 'open',
    });
    expect(game.players[1]).toEqual({ profile: { id: 'me', fullName: 'Panther Student', avatarUrl: null, campus: 'MMC' }, status: 'joined', joinedAt: AT });
  });

  test('counts spots from joined players only, and finds my place by my user id', async () => {
    queue({ data: [gameRow('g1')], error: null });
    queue({ data: [], error: null });
    expect((await getGames('MMC', NOW))[0]).toMatchObject({ spotsFilled: 2, myStatus: 'joined' });
  });

  test('my place is waitlisted, or empty after I left or when nobody is signed in', async () => {
    const rows = [gameRow('g1'), gameRow('g2'), gameRow('g3')];
    rows[0].players[1].status = 'waitlisted';
    rows[1].players[1].status = 'left';
    queue({ data: rows, error: null });
    queue({ data: [], error: null });
    expect((await getGames('MMC', NOW)).map((g) => g.myStatus)).toEqual(['waitlisted', null, 'joined']);

    jest.mocked(getUserId).mockResolvedValueOnce(null);
    queue({ data: [gameRow('g1')], error: null });
    queue({ data: [], error: null });
    expect((await getGames('MMC', NOW))[0].myStatus).toBeNull();
  });

  test("counts each host's games in one request, leaving out cancelled ones", async () => {
    queue({ data: [gameRow('g1'), gameRow('g2'), gameRow('g3', { host: profile('host-2', 'Maya T.') })], error: null });
    const counts = queue({ data: [{ host_id: 'host-1' }, { host_id: 'host-1' }, { host_id: 'host-1' }, { host_id: 'host-2' }], error: null });
    const games = await getGames('MMC', NOW);
    expect(counts.in).toHaveBeenCalledWith('host_id', ['host-1', 'host-2']);
    expect(counts.neq).toHaveBeenCalledWith('status', 'cancelled');
    expect(games.map((g) => g.hostGamesCount)).toEqual([3, 3, 1]);
  });

  test('an empty campus is an empty list, with no second request', async () => {
    queue({ data: [], error: null });
    expect(await getGames('MMC', NOW)).toEqual([]);
    expect(from).toHaveBeenCalledTimes(1);
  });

  test('throws when either request fails, so the screen shows its error state', async () => {
    queue({ data: null, error: { message: 'Network request failed' } });
    await expect(getGames('MMC', NOW)).rejects.toThrow('Network request failed');

    queue({ data: [gameRow('g1')], error: null });
    queue({ data: null, error: { message: 'JWT expired' } });
    await expect(getGames('MMC', NOW)).rejects.toThrow('JWT expired');
  });
});

describe('getGame', () => {
  test('reads one game by id, counted the same way', async () => {
    const game = queue({ data: gameRow('g1'), error: null });
    queue({ data: [{ host_id: 'host-1' }], error: null });
    expect(await getGame('g1')).toMatchObject({ id: 'g1', spotsFilled: 2, myStatus: 'joined', hostGamesCount: 1 });
    expect(game.eq).toHaveBeenCalledWith('id', 'g1');
    expect(game.maybeSingle).toHaveBeenCalled();
  });

  test('still returns a cancelled game, so its page can say so', async () => {
    const game = queue({ data: gameRow('g1', { status: 'cancelled' }), error: null });
    queue({ data: [], error: null });
    expect(await getGame('g1')).toMatchObject({ status: 'cancelled' });
    expect(game.neq).not.toHaveBeenCalled();
  });

  test('returns null for an id with no game, or one that is not a valid id at all', async () => {
    queue({ data: null, error: null });
    expect(await getGame('00000000-0000-0000-0000-000000000000')).toBeNull();
    queue({ data: null, error: { message: 'invalid input syntax for type uuid: "nope"', code: '22P02' } });
    expect(await getGame('nope')).toBeNull();
  });

  test('throws on any other error', async () => {
    queue({ data: null, error: { message: 'Network request failed' } });
    await expect(getGame('g1')).rejects.toThrow('Network request failed');
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

describe('cancelGame', () => {
  test('asks cancel_game', async () => {
    answers(null);
    await cancelGame('g1');
    expect(rpc).toHaveBeenCalledWith('cancel_game', { p_game_id: 'g1' });
  });

  test('passes on what the database rejected, like a player who is not the host', async () => {
    fails('Only the host can cancel this game');
    await expect(cancelGame('g1')).rejects.toThrow('Only the host can cancel this game');
  });
});

describe('isHost', () => {
  test('is true only for the game I host, and false when nobody is signed in', async () => {
    queue({ data: [gameRow('g1'), gameRow('g2', { host: profile('me', 'Panther Student') })], error: null });
    queue({ data: [], error: null });
    expect((await getGames('MMC', NOW)).map((g) => g.isHost)).toEqual([false, true]);

    jest.mocked(getUserId).mockResolvedValueOnce(null);
    queue({ data: gameRow('g2', { host: profile('me', 'Panther Student') }), error: null });
    queue({ data: [], error: null });
    expect((await getGame('g2'))?.isHost).toBe(false);
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

describe('getLocations', () => {
  test('reads the spots on one campus by name, in the contract shape', async () => {
    const query = queue({ data: [LOCATION], error: null });
    expect(await getLocations('MMC')).toEqual([{ id: 'loc-1', campus: 'MMC', name: 'Soccer Field 2', photoUrl: null, latitude: 25.7596, longitude: -80.3794 }]);
    expect(from).toHaveBeenCalledWith('locations');
    expect(query.eq).toHaveBeenCalledWith('campus', 'MMC');
    expect(query.order).toHaveBeenCalledWith('name');
  });

  test('throws when the request fails', async () => {
    queue({ data: null, error: { message: 'Network request failed' } });
    await expect(getLocations('BBC')).rejects.toThrow('Network request failed');
  });
});

describe('Realtime', () => {
  // A stand-in channel: remembers the filter and callback that .on() was given.
  const channel = { on: jest.fn(), subscribe: jest.fn() };
  const client = supabase as unknown as { channel: jest.Mock; removeChannel: jest.Mock };

  beforeEach(() => {
    channel.on.mockReset().mockReturnValue(channel);
    channel.subscribe.mockReset().mockReturnValue(channel);
    client.channel = jest.fn(() => channel);
    client.removeChannel = jest.fn(async () => 'ok');
  });

  test('onGamesChange listens to every change on games, and stops when asked', () => {
    const onChange = jest.fn();
    const stop = onGamesChange(onChange);
    expect(channel.on).toHaveBeenCalledWith('postgres_changes', { event: '*', schema: 'public', table: 'games' }, expect.any(Function));
    expect(channel.subscribe).toHaveBeenCalled();
    channel.on.mock.calls[0][2]({});
    expect(onChange).toHaveBeenCalledTimes(1);
    stop();
    expect(client.removeChannel).toHaveBeenCalledWith(channel);
  });

  test('onGamePlayersChange listens to one game only, and stops when asked', () => {
    const stop = onGamePlayersChange('g1', jest.fn());
    expect(channel.on).toHaveBeenCalledWith(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'game_players', filter: 'game_id=eq.g1' },
      expect.any(Function),
    );
    stop();
    expect(client.removeChannel).toHaveBeenCalledWith(channel);
  });

  test('two listeners at once get their own channels', () => {
    onGamesChange(jest.fn());
    onGamesChange(jest.fn());
    const [first, second] = client.channel.mock.calls.map(([name]) => name);
    expect(first).not.toBe(second);
  });
});
