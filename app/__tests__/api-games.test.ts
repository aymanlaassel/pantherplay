import { createGame, getGame, getGames, joinGame, leaveGame } from '@/api/games';
import { getLocations } from '@/api/locations';
import { mockGames, resetMockGames } from '@/mock/games';

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
      sport: 'tennis',
      locationId: 'loc-bbc',
      startsAt: new Date(Date.now() + 3_600_000).toISOString(),
      durationMinutes: 90,
      maxPlayers: 4,
      skillLevel: 'advanced',
      notes: '',
    });
    expect(created).toMatchObject({ sport: { code: 'tennis', name: 'Tennis' }, maxPlayers: 4, spotsFilled: 1, myStatus: 'joined', notes: null });
    // The game gets the real spot, coordinates included, not a made-up one at 0,0.
    expect(await getGame(created.id)).toMatchObject({ location: { id: 'loc-bbc', campus: 'BBC', latitude: 25.9111 } });
    expect((await getGames('BBC')).map((game) => game.id)).toContain(created.id);
  });

  test('a location that is not in the fixed list is rejected', async () => {
    const before = (await getGames('MMC')).length;
    await expect(
      createGame({
        sport: 'tennis',
        locationId: 'made-up',
        startsAt: new Date(Date.now() + 3_600_000).toISOString(),
        durationMinutes: 60,
        maxPlayers: 4,
        skillLevel: 'beginner',
        notes: '',
      }),
    ).rejects.toThrow('Unknown location');
    expect(await getGames('MMC')).toHaveLength(before);
  });
});

describe('getLocations', () => {
  test('lists only the spots on the asked campus', async () => {
    expect((await getLocations('BBC')).map((l) => l.id)).toEqual(['loc-bbc']);
    expect((await getLocations('MMC')).every((l) => l.campus === 'MMC')).toBe(true);
  });
});

describe('hostGamesCount', () => {
  test("counts the host's games but not cancelled ones, and grows when they post", async () => {
    const all = mockGames();
    const alex = all[0].host.id;
    const notCancelled = all.filter((g) => g.host.id === alex && g.status !== 'cancelled').length;
    expect(all.some((g) => g.host.id === alex && g.status === 'cancelled')).toBe(true); // so the exclusion is really tested
    expect((await getGame('1'))?.hostGamesCount).toBe(notCancelled);

    const first = await createGame({
      sport: 'tennis',
      locationId: 'loc-bbc',
      startsAt: new Date(Date.now() + 3_600_000).toISOString(),
      durationMinutes: 60,
      maxPlayers: 4,
      skillLevel: 'beginner',
      notes: '',
    });
    expect(first.hostGamesCount).toBe(1);
  });
});
