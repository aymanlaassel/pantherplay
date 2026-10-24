import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

import { getGame, listGames, setMockScenario } from '@/api';
import { getMockGames } from '@/api/mock-data';

afterEach(() => setMockScenario('default'));

const games = getMockGames();
const byId = (id: string) => games.find((g) => g.id === id)!;

test('listGames() returns games soonest first after a delay', async () => {
  const list = await listGames();
  expect(list.length).toBe(games.length);
  const starts = list.map((g) => g.starts_at);
  expect(starts).toEqual([...starts].sort());
});

test('listGames() can return an empty list', async () => {
  setMockScenario('empty');
  expect(await listGames()).toEqual([]);
});

test('getGame() finds a game by id and returns null for an unknown id', async () => {
  expect((await getGame('g-full'))?.title).toBe('Basketball run');
  expect(await getGame('nope')).toBeNull();
});

describe('hostile mock cases', () => {
  test('a host with no avatar', () => {
    expect(games.some((g) => g.host.avatar_url === null)).toBe(true);
  });

  test('a 60-character title', () => {
    expect(byId('g-long').title).toHaveLength(60);
  });

  test('a very long host name', () => {
    expect(byId('g-long').host.full_name.length).toBeGreaterThanOrEqual(50);
  });

  test('47 games on one day', () => {
    const perDay = new Map<string, number>();
    for (const g of games) {
      const day = new Date(g.starts_at).toDateString();
      perDay.set(day, (perDay.get(day) ?? 0) + 1);
    }
    expect(Math.max(...perDay.values())).toBeGreaterThanOrEqual(47);
  });

  test('a full game', () => {
    expect(byId('g-full').status).toBe('full');
  });

  test('a cancelled game', () => {
    expect(byId('g-cancelled').status).toBe('cancelled');
  });

  test('a game starting in 5 minutes', () => {
    const minutes = (new Date(byId('g-soon').starts_at).getTime() - Date.now()) / 60000;
    expect(minutes).toBeGreaterThan(4);
    expect(minutes).toBeLessThanOrEqual(5);
  });
});

test('stored status always agrees with the player count', () => {
  for (const g of games) {
    expect(g.players_joined).toBeLessThanOrEqual(g.max_players);
    expect(g.status === 'full').toBe(g.players_joined === g.max_players);
    if (g.status === 'confirmed') expect(g.players_joined).toBeGreaterThanOrEqual(g.min_players);
    if (g.status === 'open') expect(g.players_joined).toBeLessThan(g.min_players);
  }
});

test('no screen or component imports Supabase', () => {
  const src = join(__dirname, '..', 'src');
  const files = (readdirSync(src, { recursive: true }) as string[]).filter(
    (f) => /\.tsx?$/.test(f) && !f.startsWith('api/') && !f.startsWith('lib/'),
  );
  for (const file of files) {
    expect(readFileSync(join(src, file), 'utf8')).not.toMatch(/@supabase\//);
  }
});
