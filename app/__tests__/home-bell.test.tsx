import { render, screen } from '@testing-library/react-native';

import * as notifications from '@/api/notifications';
import DiscoverScreen from '@/app/(tabs)/index';

jest.mock('expo-router', () => ({ router: { push: jest.fn() }, useFocusEffect: (effect: () => void) => require('react').useEffect(effect, [effect]) }));
jest.mock('@/api/delay', () => ({ delay: () => Promise.resolve() }));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

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
