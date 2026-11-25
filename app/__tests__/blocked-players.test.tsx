import { router } from 'expo-router';
import { fireEvent, render, screen } from '@testing-library/react-native';

import * as safety from '@/api/safety';
import BlockedPlayersScreen from '@/app/settings/blocked';
import { mockBlocked, resetMockBlocked } from '@/mock/blocks';

jest.mock('expo-router', () => ({
  router: { back: jest.fn() },
  useFocusEffect: (effect: () => void) => require('react').useEffect(effect, [effect]),
}));
jest.mock('@/api/delay', () => ({ delay: () => Promise.resolve() }));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

beforeEach(() => resetMockBlocked());
afterEach(() => jest.restoreAllMocks());

test('lists the players I blocked, each with Unblock', async () => {
  await render(<BlockedPlayersScreen />);
  expect(await screen.findByText('Chris M.')).toBeTruthy();
  expect(screen.getByText('Dana K.')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Unblock Chris M.' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Unblock Dana K.' })).toBeTruthy();
});

test('Unblock removes the player from the list and from the saved blocks', async () => {
  await render(<BlockedPlayersScreen />);
  await fireEvent.press(await screen.findByRole('button', { name: 'Unblock Chris M.' }));
  expect(screen.queryByText('Chris M.')).toBeNull();
  expect(screen.getByText('Dana K.')).toBeTruthy();
  expect(mockBlocked().map((p) => p.fullName)).toEqual(['Dana K.']);
});

test('unblocking the last player shows the empty state', async () => {
  resetMockBlocked([mockBlocked()[0]]);
  await render(<BlockedPlayersScreen />);
  await fireEvent.press(await screen.findByRole('button', { name: 'Unblock Chris M.' }));
  expect(screen.getByText("You haven't blocked anyone")).toBeTruthy();
});

test('an empty list says so', async () => {
  resetMockBlocked([]);
  await render(<BlockedPlayersScreen />);
  expect(await screen.findByText("You haven't blocked anyone")).toBeTruthy();
});

test('a failed unblock keeps the player and shows a message', async () => {
  jest.spyOn(safety, 'unblockUser').mockRejectedValueOnce(new Error('offline'));
  await render(<BlockedPlayersScreen />);
  await fireEvent.press(await screen.findByRole('button', { name: 'Unblock Chris M.' }));
  expect(screen.getByText("Couldn't unblock. Try again.")).toBeTruthy();
  expect(screen.getByText('Chris M.')).toBeTruthy();
});

test('a failed load shows an error, and Try again loads the list', async () => {
  jest.spyOn(safety, 'getBlockedUsers').mockRejectedValueOnce(new Error('offline'));
  await render(<BlockedPlayersScreen />);
  expect(await screen.findByText("Couldn't load blocked players.")).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
  expect(await screen.findByText('Chris M.')).toBeTruthy();
});

test('Back returns to Settings', async () => {
  await render(<BlockedPlayersScreen />);
  await fireEvent.press(screen.getByRole('button', { name: 'Back' }));
  expect(router.back).toHaveBeenCalled();
});
