import { act, fireEvent, render, screen } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

import { finishOnboarding, hasFinishedOnboarding } from '@/api/profile';
import NotificationsOnboardingScreen from '@/app/(onboarding)/enable-notifications';
import PhotoScreen from '@/app/(onboarding)/photo';
import TabLayout from '@/app/(tabs)/_layout';
import { getProviderProfile, getUserId } from '@/lib/auth';
import { registerPushToken } from '@/lib/push-token';

import { supabase } from '@/lib/supabase';

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
jest.mock('@/lib/auth', () => ({ getProviderProfile: jest.fn(), getUserId: jest.fn() }));
jest.mock('@/lib/push-token', () => ({ registerPushToken: jest.fn(async () => {}) }));

const mockGetProviderProfile = getProviderProfile as jest.Mock;
const mockRequestPermissions = Notifications.requestPermissionsAsync as jest.Mock;

// A tiny stand-in for the profiles table: user id -> adult_confirmed_at and onboarding_completed_at.
// It only understands the two queries profile.ts makes here: read one row, and update one row.
// Being in the database (not on the phone) is what lets a second phone see that onboarding is done.
type FakeProfile = { adult_confirmed_at: string | null; onboarding_completed_at: string | null };
let profiles: Record<string, FakeProfile> = {};
let failReads = false;

function fakeProfilesTable() {
  let newValues: Partial<FakeProfile> | null = null;
  let userId = '';
  const query = {
    select: () => query,
    update: (values: Partial<FakeProfile>) => {
      newValues = values;
      return query;
    },
    // .eq('id', ...) ends an update (it's awaited right away), but a read goes on to maybeSingle().
    eq: (_column: string, id: string) => {
      userId = id;
      if (newValues) {
        profiles[id] = { ...profiles[id], ...newValues };
        return Promise.resolve({ error: null });
      }
      return query;
    },
    maybeSingle: async () => {
      if (failReads) return { data: null, error: { message: 'Network request failed' } };
      return { data: profiles[userId] ?? null, error: null };
    },
  };
  return query;
}

// Signs in as `id` (the Supabase user id is what profile.ts keys on).
function signInAs(id: string) {
  jest.mocked(getUserId).mockResolvedValue(id);
}

beforeEach(() => {
  jest.clearAllMocks();
  profiles = { ana: { adult_confirmed_at: null, onboarding_completed_at: null } }; // the sign-up trigger made Ana's row
  failReads = false;
  signInAs('ana');
  jest.mocked(supabase.from).mockImplementation(() => fakeProfilesTable() as never);
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

  test('if saving fails, stays on the step and says so', async () => {
    jest.mocked(supabase.from).mockImplementation(() => {
      throw new Error('offline');
    });
    await render(<NotificationsOnboardingScreen />);
    await act(async () => {
      fireEvent.press(screen.getByText('Not now'));
    });
    expect(screen.getByText("Couldn't finish setting up. Try again.")).toBeTruthy();
    expect(router.replace).not.toHaveBeenCalled();
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
  const CONFIRMED = '2026-11-20T17:00:00Z';
  const FINISHED = '2026-11-20T18:00:00Z';

  test('a brand-new user is sent to the 18+ step first', async () => {
    await render(<TabLayout />);
    expect(await screen.findByText('redirect:/adult')).toBeTruthy();
    expect(screen.queryByText('tabs')).toBeNull();
    expect(registerPushToken).not.toHaveBeenCalled();
  });

  test('a user who confirmed 18+ but has not finished onboarding goes to the campus step', async () => {
    profiles.ana.adult_confirmed_at = CONFIRMED;
    await render(<TabLayout />);
    expect(await screen.findByText('redirect:/campus')).toBeTruthy();
  });

  test('a user who never confirmed 18+ can\'t reach the tabs, even if onboarding is finished', async () => {
    profiles.ana.onboarding_completed_at = FINISHED; // e.g. finished before the 18+ step existed
    await render(<TabLayout />);
    expect(await screen.findByText('redirect:/adult')).toBeTruthy();
    expect(screen.queryByText('tabs')).toBeNull();
  });

  test('a returning user skips onboarding, and their push token is saved again', async () => {
    profiles.ana = { adult_confirmed_at: CONFIRMED, onboarding_completed_at: FINISHED };
    await render(<TabLayout />);
    expect(await screen.findByText('tabs')).toBeTruthy();
    expect(registerPushToken).toHaveBeenCalledTimes(1);
  });

  test('finishing on one phone skips onboarding on another (it is saved in the database)', async () => {
    profiles.ana.adult_confirmed_at = CONFIRMED;
    await finishOnboarding(); // phone 1
    expect(profiles.ana.onboarding_completed_at).not.toBeNull();

    // Phone 2: nothing on the phone, same account.
    await render(<TabLayout />);
    expect(await screen.findByText('tabs')).toBeTruthy();
  });

  test('is keyed on who is signed in: another account still gets onboarding', async () => {
    profiles.ana = { adult_confirmed_at: CONFIRMED, onboarding_completed_at: FINISHED };
    profiles.ben = { adult_confirmed_at: null, onboarding_completed_at: null };
    signInAs('ben');
    await render(<TabLayout />);
    expect(await screen.findByText('redirect:/adult')).toBeTruthy();
  });

  test('if the check fails (offline), shows Try again instead of letting them in', async () => {
    profiles.ana = { adult_confirmed_at: CONFIRMED, onboarding_completed_at: FINISHED };
    failReads = true;
    await render(<TabLayout />);
    expect(await screen.findByText("Couldn't load your account.")).toBeTruthy();
    expect(screen.queryByText('tabs')).toBeNull();

    failReads = false;
    await fireEvent.press(screen.getByText('Try again'));
    expect(await screen.findByText('tabs')).toBeTruthy();
  });
});
