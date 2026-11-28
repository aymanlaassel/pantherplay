import { act, render, screen } from '@testing-library/react-native';

import * as notifications from '@/api/notifications';
import DiscoverScreen from '@/app/(tabs)/index';
import NotificationsScreen from '@/app/notifications';
import { resetMockNotifications } from '@/mock/notifications';

type Effect = () => void | (() => void);
const mockEffects: Effect[] = [];

// Like the real hook it runs on mount, and the test can fire it again to simulate coming back to the tab.
jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  useFocusEffect: (effect: Effect) => {
    mockEffects.push(effect);
    require('react').useEffect(effect, [effect]);
  },
}));
jest.mock('@/api/delay', () => ({ delay: () => Promise.resolve() }));
jest.mock('@/api/games', () => require('@/mock/games-api'));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

beforeEach(() => {
  resetMockNotifications();
  mockEffects.length = 0;
});
afterEach(() => jest.restoreAllMocks());

test('the bell shows a dot when there are unread notifications', async () => {
  await render(<DiscoverScreen />);
  expect(screen.getByTestId('unread-dot')).toBeTruthy();
});

test('the bell shows no dot when nothing is unread', async () => {
  jest.spyOn(notifications, 'hasUnreadNotifications').mockResolvedValueOnce(false);
  await render(<DiscoverScreen />);
  expect(screen.queryByTestId('unread-dot')).toBeNull();
});

test('a failed unread check leaves the dot off instead of crashing', async () => {
  jest.spyOn(notifications, 'hasUnreadNotifications').mockRejectedValueOnce(new Error('offline'));
  await render(<DiscoverScreen />);
  expect(screen.queryByTestId('unread-dot')).toBeNull();
  expect(screen.getByLabelText('Notifications')).toBeTruthy();
});

test('opening Notifications clears the dot when you come back to Discover', async () => {
  const discover = await render(<DiscoverScreen />);
  expect(discover.getByTestId('unread-dot')).toBeTruthy();

  await render(<NotificationsScreen />);
  expect(await notifications.hasUnreadNotifications()).toBe(false);
  // Discover hasn't been focused again yet, so it still shows the old answer.
  expect(discover.getByTestId('unread-dot')).toBeTruthy();

  await act(async () => {
    for (const effect of [...mockEffects]) effect();
  });
  expect(discover.queryByTestId('unread-dot')).toBeNull();
});
