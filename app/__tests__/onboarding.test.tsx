import { act, fireEvent, render, screen } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

import { finishOnboarding, hasFinishedOnboarding } from '@/api/profile';
import NotificationsOnboardingScreen from '@/app/(onboarding)/enable-notifications';
import PhotoScreen from '@/app/(onboarding)/photo';
import TabLayout from '@/app/(tabs)/_layout';
import { getProviderProfile } from '@/lib/auth';
import { registerPushToken } from '@/lib/push-token';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('expo-notifications', () => ({ requestPermissionsAsync: jest.fn() }));
jest.mock('expo-router', () => {
  const { Text } = jest.requireActual('react-native');
  const Tabs = () => <Text>tabs</Text>;
  Tabs.Screen = () => null;
  return {
    router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
    Redirect: ({ href }: { href: string }) => <Text>{`redirect:${href}`}</Text>,
    Tabs,
  };
});
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('@/lib/auth', () => ({ getProviderProfile: jest.fn() }));
jest.mock('@/lib/push-token', () => ({ registerPushToken: jest.fn(async () => {}) }));

const mockGetProviderProfile = getProviderProfile as jest.Mock;
const mockRequestPermissions = Notifications.requestPermissionsAsync as jest.Mock;

beforeEach(async () => {
  jest.clearAllMocks();
  const AsyncStorage = require('@react-native-async-storage/async-storage');
  await AsyncStorage.clear();
});

describe('photo step', () => {
  test('shows the Google photo, and skipping moves on', async () => {
    mockGetProviderProfile.mockResolvedValue({ name: 'Ana Lopez', photoUrl: 'https://example.com/ana.png' });
    await render(<PhotoScreen />);
    expect(await screen.findByTestId('avatar-photo')).toBeTruthy();
    fireEvent.press(screen.getByText('Skip for now'));
    expect(router.push).toHaveBeenCalledWith('./enable-notifications');
  });

  test('shows initials when Google has no photo', async () => {
    mockGetProviderProfile.mockResolvedValue({ name: 'Ana Lopez', photoUrl: null });
    await render(<PhotoScreen />);
    expect(await screen.findByText('AL')).toBeTruthy();
    expect(screen.queryByTestId('avatar-photo')).toBeNull();
  });
});

describe('notifications step', () => {
  test('does not ask for permission until a button is tapped', async () => {
    await render(<NotificationsOnboardingScreen />);
    expect(mockRequestPermissions).not.toHaveBeenCalled();
  });

  test('Finish asks for permission, then finishes onboarding and goes to Discover', async () => {
    let finishedWhenAsked: boolean | null = null;
    mockRequestPermissions.mockImplementation(async () => {
      finishedWhenAsked = await hasFinishedOnboarding();
    });
    await render(<NotificationsOnboardingScreen />);
    await act(async () => {
      fireEvent.press(screen.getByText('Finish'));
    });
    expect(finishedWhenAsked).toBe(false);
    expect(await hasFinishedOnboarding()).toBe(true);
    expect(router.replace).toHaveBeenCalledWith('/');
  });

  test('Finish saves the push token after the prompt (it skips saving if they said no)', async () => {
    await render(<NotificationsOnboardingScreen />);
    await act(async () => {
      fireEvent.press(screen.getByText('Finish'));
    });
    expect(registerPushToken).toHaveBeenCalledTimes(1);
    expect(mockRequestPermissions.mock.invocationCallOrder[0]).toBeLessThan(
      jest.mocked(registerPushToken).mock.invocationCallOrder[0],
    );
  });

  test('a failure saving the token still finishes onboarding', async () => {
    jest.mocked(registerPushToken).mockRejectedValueOnce(new Error('no project id'));
    await render(<NotificationsOnboardingScreen />);
    await act(async () => {
      fireEvent.press(screen.getByText('Finish'));
    });
    expect(router.replace).toHaveBeenCalledWith('/');
  });

  test('Not now finishes onboarding without asking for permission', async () => {
    await render(<NotificationsOnboardingScreen />);
    await act(async () => {
      fireEvent.press(screen.getByText('Not now'));
    });
    expect(mockRequestPermissions).not.toHaveBeenCalled();
    expect(registerPushToken).not.toHaveBeenCalled();
    expect(await hasFinishedOnboarding()).toBe(true);
    expect(router.replace).toHaveBeenCalledWith('/');
  });
});

describe('opening the app', () => {
  test('sends someone who has not finished onboarding to the campus step', async () => {
    await render(<TabLayout />);
    expect(await screen.findByText('redirect:/campus')).toBeTruthy();
  });

  test('skips onboarding once it is finished, and saves the push token again', async () => {
    await finishOnboarding();
    await render(<TabLayout />);
    expect(await screen.findByText('tabs')).toBeTruthy();
    expect(registerPushToken).toHaveBeenCalledTimes(1);
  });

  test('does not save a push token before onboarding is finished', async () => {
    await render(<TabLayout />);
    await screen.findByText('redirect:/campus');
    expect(registerPushToken).not.toHaveBeenCalled();
  });
});
