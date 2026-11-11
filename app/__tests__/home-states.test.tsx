import { fireEvent, render, screen } from '@testing-library/react-native';

import { getGames } from '@/api/games';
import type { Game } from '@/api/types';
import DiscoverScreen from '@/app/(tabs)/index';
import { mockGames } from '@/mock/games';

jest.mock('expo-router', () => ({ router: { push: jest.fn() }, useFocusEffect: (effect: () => void) => require('react').useEffect(effect, [effect]) }));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('@/api/games', () => ({ ...jest.requireActual('@/api/games'), getGames: jest.fn() }));

const GAMES: Game[] = mockGames()
  .slice(0, 3)
  .map((game) => ({ ...game, spotsFilled: game.players.length, myStatus: null, hostGamesCount: 1 }));

const load = jest.mocked(getGames);

afterEach(() => load.mockReset().mockResolvedValue(GAMES));

test('shows a spinner while games load', async () => {
  load.mockReturnValueOnce(new Promise<Game[]>(() => {}));
  await render(<DiscoverScreen />);
  expect(screen.getByLabelText('Loading games')).toBeTruthy();
  expect(screen.queryByText('No games today. Be the first to post one.')).toBeNull();
});

test('shows an error when loading fails, and Try again reloads the games', async () => {
  load.mockRejectedValueOnce(new Error('offline'));
  await render(<DiscoverScreen />);
  expect(screen.getByText("Couldn't load games.")).toBeTruthy();

  load.mockResolvedValueOnce(GAMES);
  await fireEvent.press(screen.getByText('Try again'));
  expect(screen.queryByText("Couldn't load games.")).toBeNull();
  expect(screen.getByText('Soccer')).toBeTruthy();
});

test('shows the empty message when there are no games', async () => {
  load.mockResolvedValueOnce([]);
  await render(<DiscoverScreen />);
  expect(screen.getByText('No games today. Be the first to post one.')).toBeTruthy();
});

test('a 60-character title and a day with 47 games both render', async () => {
  const title = 'A'.repeat(60);
  const games = Array.from({ length: 47 }, (_, i) => ({ ...GAMES[0], id: `g${i}`, sport: { ...GAMES[0].sport, name: i === 0 ? title : `Game ${i}` } }));
  load.mockResolvedValueOnce(games);
  await render(<DiscoverScreen />);
  expect(screen.getByText(title)).toBeTruthy();
  expect(screen.getByText('Game 1')).toBeTruthy();
});

test('switching campus loads that campus', async () => {
  await render(<DiscoverScreen />);
  load.mockResolvedValueOnce([]);
  await fireEvent.press(screen.getByRole('button', { name: 'BBC' }));
  expect(load).toHaveBeenLastCalledWith('BBC');
});
