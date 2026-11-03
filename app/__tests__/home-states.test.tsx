import { fireEvent, render, screen } from '@testing-library/react-native';

import DiscoverScreen from '@/app/(tabs)/index';
import { listMockGames, MOCK_GAMES, type HomeGame } from '@/features/home/mock-games';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('@/features/home/mock-games', () => {
  const actual = jest.requireActual('@/features/home/mock-games');
  return { ...actual, listMockGames: jest.fn(actual.listMockGames) };
});

const load = jest.mocked(listMockGames);

afterEach(() => load.mockReset().mockResolvedValue(MOCK_GAMES));

test('shows a spinner while games load', async () => {
  load.mockReturnValueOnce(new Promise<HomeGame[]>(() => {}));
  await render(<DiscoverScreen />);
  expect(screen.getByLabelText('Loading games')).toBeTruthy();
  expect(screen.queryByText('No games today. Be the first to post one.')).toBeNull();
});

test('shows an error when loading fails, and Try again reloads the games', async () => {
  load.mockRejectedValueOnce(new Error('offline'));
  await render(<DiscoverScreen />);
  expect(screen.getByText("Couldn't load games.")).toBeTruthy();

  load.mockResolvedValueOnce(MOCK_GAMES);
  await fireEvent.press(screen.getByText('Try again'));
  expect(screen.queryByText("Couldn't load games.")).toBeNull();
  expect(screen.getByText('5v5 Soccer')).toBeTruthy();
});

test('shows the empty message when there are no games', async () => {
  load.mockResolvedValueOnce([]);
  await render(<DiscoverScreen />);
  expect(screen.getByText('No games today. Be the first to post one.')).toBeTruthy();
});

test('a 60-character title and a day with 47 games both render', async () => {
  const title = 'A'.repeat(60);
  const games = Array.from({ length: 47 }, (_, i) => ({ ...MOCK_GAMES[0], id: `g${i}`, title: i === 0 ? title : `Game ${i}` }));
  load.mockResolvedValueOnce(games);
  await render(<DiscoverScreen />);
  expect(screen.getByText(title)).toBeTruthy();
  expect(screen.getByText('Game 1')).toBeTruthy();
});
