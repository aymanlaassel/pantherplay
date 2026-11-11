import { mockGames } from '@/mock/games';

describe('the hostile mock set', () => {
  const games = mockGames();

  test('has a full game, a cancelled game and one starting in minutes', () => {
    expect(games.some((game) => game.players.length >= game.maxPlayers)).toBe(true);
    expect(games.some((game) => game.status === 'cancelled')).toBe(true);
    const soon = games.find((game) => game.id === 'soon')!;
    expect(new Date(soon.startsAt).getTime() - Date.now()).toBeLessThanOrEqual(10 * 60_000);
  });

  test('has a very long host name, a 60-character place name and no avatars', () => {
    expect(games.some((game) => game.host.fullName.length >= 40)).toBe(true);
    expect(games.some((game) => game.location.name.length >= 60)).toBe(true);
    expect(games.every((game) => game.host.avatarUrl === null)).toBe(true);
  });

  test('has 47 games on one day', () => {
    const day = games.filter((game) => game.id.startsWith('day-'));
    expect(day).toHaveLength(47);
    expect(new Set(day.map((game) => new Date(game.startsAt).toDateString())).size).toBe(1);
  });
});
