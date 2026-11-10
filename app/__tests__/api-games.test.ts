import { createGame, getGame, getGames, joinGame, leaveGame } from '@/api/games';
import { resetMockGames } from '@/mock/games';

jest.mock('@/api/delay', () => ({ delay: () => Promise.resolve() }));

beforeEach(() => resetMockGames());

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

describe('joinGame and leaveGame', () => {
  test('joining a game with room answers joined and takes a spot', async () => {
    expect(await joinGame('1')).toBe('joined');
    expect(await getGame('1')).toMatchObject({ spotsFilled: 8, myStatus: 'joined' });
  });

  test('joining a full game answers waitlisted and takes no spot', async () => {
    expect(await joinGame('full')).toBe('waitlisted');
    expect(await getGame('full')).toMatchObject({ spotsFilled: 10, myStatus: 'waitlisted' });
  });

  test('joining twice does not add a second spot', async () => {
    await joinGame('1');
    expect(await joinGame('1')).toBe('joined');
    expect(await getGame('1')).toMatchObject({ spotsFilled: 8 });
  });

  test('leaving gives the spot back, and leaving a waitlist keeps the game full', async () => {
    await joinGame('1');
    await leaveGame('1');
    expect(await getGame('1')).toMatchObject({ spotsFilled: 7, myStatus: null });

    await joinGame('full');
    await leaveGame('full');
    expect(await getGame('full')).toMatchObject({ spotsFilled: 10, myStatus: null });
  });

  test('a game can be joined again after leaving it', async () => {
    await joinGame('1');
    await leaveGame('1');
    expect(await joinGame('1')).toBe('joined');
    expect(await getGame('1')).toMatchObject({ spotsFilled: 8, myStatus: 'joined' });
  });

  test('a cancelled game cannot be joined', async () => {
    await expect(joinGame('cancelled')).rejects.toThrow('cancelled');
  });

  test('an unknown game cannot be joined or left', async () => {
    await expect(joinGame('nope')).rejects.toThrow();
    await expect(leaveGame('nope')).rejects.toThrow();
  });
});

describe('createGame', () => {
  test('the new game can be read, is listed on its campus, and has the host in it', async () => {
    const created = await createGame({
      sport: 'Tennis',
      campus: 'BBC',
      location: 'Courts',
      startsAt: new Date(Date.now() + 3_600_000).toISOString(),
      durationMinutes: 90,
      maxPlayers: 4,
      skillLevel: 'advanced',
      notes: '',
    });
    expect(created).toMatchObject({ sport: 'Tennis', maxPlayers: 4, spotsFilled: 1, myStatus: 'joined', notes: null });
    expect(await getGame(created.id)).toMatchObject({ location: { name: 'Courts', campus: 'BBC' } });
    expect((await getGames('BBC')).map((game) => game.id)).toContain(created.id);
  });
});
