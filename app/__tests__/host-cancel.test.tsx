import { useLocalSearchParams } from 'expo-router';
import { Alert } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import * as api from '@/api/games';
import GameDetailScreen from '@/app/game/[id]';
import { mockGames, resetMockGames } from '@/mock/games';
import { ME } from '@/mock/people';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), replace: jest.fn(), canGoBack: jest.fn(() => true) },
  useLocalSearchParams: jest.fn(),
}));
jest.mock('@/api/delay', () => ({ delay: () => Promise.resolve() }));
jest.mock('@/api/games', () => require('@/mock/games-api'));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

const open = async (id: string) => {
  (useLocalSearchParams as jest.Mock).mockReturnValue({ id });
  await render(<GameDetailScreen />);
};

// Game 1 hosted by the signed-in user.
const hostGame1 = () => {
  mockGames().find((g) => g.id === '1')!.host = ME;
};

// Taps Cancel game in the sheet, then the given button in the confirm alert.
const cancelAndAnswer = async (answer: 'Cancel game' | 'Keep game') => {
  const alert = jest.spyOn(Alert, 'alert');
  await fireEvent.press(screen.getByLabelText('Host options'));
  await fireEvent.press(screen.getByRole('button', { name: 'Cancel game' }));
  expect(alert).toHaveBeenCalledWith('Cancel this game?', expect.any(String), expect.any(Array));
  await act(async () => alert.mock.calls[0][2]!.find((b) => b.text === answer)!.onPress?.());
  return alert;
};

beforeEach(() => resetMockGames());
afterEach(() => jest.restoreAllMocks());

test('a player who is not the host sees no host options', async () => {
  await open('1');
  expect(screen.queryByLabelText('Host options')).toBeNull();
  expect(screen.queryByText('Cancel game')).toBeNull();
});

test('the host cancels after confirming, and the game shows as cancelled', async () => {
  hostGame1();
  jest.spyOn(api, 'cancelGame');
  await open('1');
  await cancelAndAnswer('Cancel game');
  expect(api.cancelGame).toHaveBeenCalledWith('1');
  expect(await screen.findByRole('button', { name: 'Game cancelled', disabled: true })).toBeTruthy();
  expect(screen.getByText('Cancelled')).toBeTruthy();
  expect(screen.queryByLabelText('Host options')).toBeNull();
});

test('choosing Keep game leaves the game as it was', async () => {
  hostGame1();
  jest.spyOn(api, 'cancelGame');
  await open('1');
  await cancelAndAnswer('Keep game');
  expect(api.cancelGame).not.toHaveBeenCalled();
  expect(screen.queryByText('Cancelled')).toBeNull();
});

test('Close shuts the sheet without asking', async () => {
  hostGame1();
  const alert = jest.spyOn(Alert, 'alert');
  await open('1');
  await fireEvent.press(screen.getByLabelText('Host options'));
  await fireEvent.press(screen.getByRole('button', { name: 'Close' }));
  expect(screen.queryByRole('button', { name: 'Cancel game' })).toBeNull();
  expect(alert).not.toHaveBeenCalled();
});

test('a database error shows a message instead of crashing', async () => {
  hostGame1();
  jest.spyOn(api, 'cancelGame').mockRejectedValueOnce(new Error('Only the host can cancel this game'));
  await open('1');
  await cancelAndAnswer('Cancel game');
  expect(await screen.findByText("That didn't work. Try again.")).toBeTruthy();
  expect(screen.queryByText('Cancelled')).toBeNull();
});
