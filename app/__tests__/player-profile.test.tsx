import { router, useLocalSearchParams } from 'expo-router';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { getGamesPlayed, getPlayer } from '@/api/profile';
import GameDetailScreen from '@/app/game/[id]';
import PlayerProfileScreen from '@/app/player/[id]';
import { mockGames, resetMockGames } from '@/mock/games';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), replace: jest.fn(), push: jest.fn(), canGoBack: jest.fn(() => true) },
  useLocalSearchParams: jest.fn(),
}));
jest.mock('@/api/delay', () => ({ delay: () => Promise.resolve() }));
jest.mock('@/api/games', () => require('@/mock/games-api'));
jest.mock('@/lib/auth', () => ({ getUserId: jest.fn(async () => 'me') }));
jest.mock('@/api/profile', () => ({ getPlayer: jest.fn(), getGamesPlayed: jest.fn() }));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

const MAYA = { id: 'p2', fullName: 'Maya T.', avatarUrl: null, campus: 'BBC' as const };

const openPlayer = async (id: string) => {
  (useLocalSearchParams as jest.Mock).mockReturnValue({ id });
  await render(<PlayerProfileScreen />);
};

beforeEach(() => {
  resetMockGames();
  jest.clearAllMocks();
  jest.mocked(getPlayer).mockResolvedValue(MAYA);
  jest.mocked(getGamesPlayed).mockResolvedValue(12);
});

test('shows the name, initials, campus and games played', async () => {
  await openPlayer('p2');
  expect(await screen.findByText('Maya T.')).toBeTruthy();
  expect(screen.getByText('MT')).toBeTruthy();
  expect(screen.getByText('BBC')).toBeTruthy();
  expect(screen.getByText('12')).toBeTruthy();
  expect(screen.getByText('Games played')).toBeTruthy();
  expect(getPlayer).toHaveBeenCalledWith('p2');
  expect(getGamesPlayed).toHaveBeenCalledWith('p2');
});

test('one game reads "Game played", and no campus shows no campus line', async () => {
  jest.mocked(getPlayer).mockResolvedValue({ ...MAYA, campus: null });
  jest.mocked(getGamesPlayed).mockResolvedValue(1);
  await openPlayer('p2');
  expect(await screen.findByText('Game played')).toBeTruthy();
  expect(screen.queryByText('BBC')).toBeNull();
});

test('shows a spinner while loading', async () => {
  jest.mocked(getPlayer).mockReturnValue(new Promise(() => {}));
  await openPlayer('p2');
  expect(screen.getByLabelText('Loading player')).toBeTruthy();
});

test('a missing or deleted player shows "This player isn\'t available"', async () => {
  jest.mocked(getPlayer).mockResolvedValue(null);
  await openPlayer('gone');
  expect(await screen.findByText("This player isn't available")).toBeTruthy();
});

test('a failed load shows an error, and Try again loads the player', async () => {
  jest.mocked(getPlayer).mockRejectedValueOnce(new Error('offline'));
  await openPlayer('p2');
  expect(await screen.findByText("Couldn't load this player.")).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
  expect(await screen.findByText('Maya T.')).toBeTruthy();
});

test('Back goes back', async () => {
  await openPlayer('p2');
  await fireEvent.press(screen.getByRole('button', { name: 'Back' }));
  expect(router.back).toHaveBeenCalled();
});

describe('from Game detail', () => {
  const openGame = async (id: string) => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id });
    await render(<GameDetailScreen />);
  };

  test('tapping the host opens their profile', async () => {
    await openGame('2');
    await fireEvent.press(screen.getByRole('button', { name: 'Hosted by Maya T., open profile' }));
    expect(router.push).toHaveBeenCalledWith('/player/p2');
  });

  test('tapping a player opens their profile', async () => {
    const first = mockGames().find((g) => g.id === '2')!.players[0].profile;
    await openGame('2');
    await fireEvent.press(screen.getByRole('button', { name: `${first.fullName}'s profile` }));
    expect(router.push).toHaveBeenCalledWith(`/player/${first.id}`);
  });
});
