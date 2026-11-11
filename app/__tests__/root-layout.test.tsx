import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import RootLayout from '@/app/_layout';
import { getSession, onAuthChange, type Session } from '@/lib/auth';

jest.mock('expo-font', () => ({ useFonts: jest.fn() }));
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
}));
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
jest.mock('@/lib/auth', () => ({ getSession: jest.fn(), onAuthChange: jest.fn() }));
// The navigator itself is not under test. The mock shows an "app" marker plus one line per
// screen you can currently reach, so the tests can see what the auth gate lets through.
jest.mock('expo-router', () => {
  const { Text } = jest.requireActual('react-native');
  const Stack = ({ children }: { children: React.ReactNode }) => (
    <>
      <Text>app</Text>
      {children}
    </>
  );
  // `options` rides along as a prop so tests can read a screen's options from its testID.
  Stack.Screen = ({ name, options }: { name: string; options?: object }) => (
    <Text testID={`route-${name}`} {...{ options }}>{`screen:${name}`}</Text>
  );
  Stack.Protected = ({ guard, children }: { guard: boolean; children: React.ReactNode }) => (guard ? children : null);
  return { Stack };
});

const mockUseFonts = useFonts as jest.Mock;
const mockGetSession = getSession as jest.Mock;
const mockOnAuthChange = onAuthChange as jest.Mock;
const SESSION = { user: { id: 'user-1' } } as Session;

beforeEach(() => {
  jest.mocked(SplashScreen.hideAsync).mockClear();
  mockGetSession.mockResolvedValue(null);
  mockOnAuthChange.mockReturnValue(jest.fn());
});

test('keeps the splash up and renders nothing while fonts load', async () => {
  mockUseFonts.mockReturnValue([false, null]);
  await render(<RootLayout />);
  expect(screen.toJSON()).toBeNull();
  expect(SplashScreen.preventAutoHideAsync).toHaveBeenCalled();
  expect(SplashScreen.hideAsync).not.toHaveBeenCalled();
});

test('loads exactly the Figma fonts', async () => {
  mockUseFonts.mockReturnValue([false, null]);
  await render(<RootLayout />);
  expect(Object.keys(mockUseFonts.mock.calls[0][0]).sort()).toEqual([
    'BarlowCondensed_700Bold',
    'Inter_400Regular',
    'Inter_500Medium',
    'Inter_600SemiBold',
  ]);
});

test.each([
  ['fonts loaded', [true, null]],
  ['font error (falls back instead of hanging)', [false, new Error('x')]],
])('hides the splash once the app renders: %s', async (_, fontsResult) => {
  mockUseFonts.mockReturnValue(fontsResult);
  await render(<RootLayout />);
  expect(screen.getByText('app')).toBeTruthy();
  expect(SplashScreen.hideAsync).not.toHaveBeenCalled();
  // The splash overlay hides the native splash once it has laid out over the loaded app.
  await fireEvent(screen.getByTestId('splash-overlay'), 'layout');
  expect(SplashScreen.hideAsync).toHaveBeenCalledTimes(1);
});

describe('auth gate', () => {
  beforeEach(() => mockUseFonts.mockReturnValue([true, null]));

  test('keeps the splash up until the saved session has been checked', async () => {
    let finishCheck: (session: Session | null) => void = () => {};
    mockGetSession.mockReturnValue(new Promise((resolve) => (finishCheck = resolve)));
    await render(<RootLayout />);
    expect(screen.toJSON()).toBeNull();

    await act(async () => finishCheck(null));
    expect(screen.getByText('app')).toBeTruthy();
  });

  test('signed out: only the (auth) screens can be reached', async () => {
    await render(<RootLayout />);
    expect(screen.getByText('screen:(auth)')).toBeTruthy();
    expect(screen.queryByText('screen:(tabs)')).toBeNull();
    for (const route of ['game/[id]', 'game/create', 'notifications', 'settings/index', 'settings/delete-account']) {
      expect(screen.queryByText(`screen:${route}`)).toBeNull();
    }
  });

  test('signed in: the tabs can be reached and Welcome cannot', async () => {
    mockGetSession.mockResolvedValue(SESSION);
    await render(<RootLayout />);
    expect(screen.getByText('screen:(tabs)')).toBeTruthy();
    expect(screen.getByText('screen:game/[id]')).toBeTruthy();
    expect(screen.queryByText('screen:(auth)')).toBeNull();
  });

  test('switches when someone signs in, then back when they sign out', async () => {
    await render(<RootLayout />);
    const onChange = mockOnAuthChange.mock.lastCall[0];

    await act(async () => onChange(SESSION));
    expect(screen.getByText('screen:(tabs)')).toBeTruthy();
    expect(screen.queryByText('screen:(auth)')).toBeNull();

    await act(async () => onChange(null));
    expect(screen.getByText('screen:(auth)')).toBeTruthy();
    expect(screen.queryByText('screen:(tabs)')).toBeNull();
  });

  test('stops listening for sign-in changes when the layout goes away', async () => {
    const stop = jest.fn();
    mockOnAuthChange.mockReturnValue(stop);
    await render(<RootLayout />);
    await screen.unmount();
    expect(stop).toHaveBeenCalled();
  });

  test('registers Settings and Delete account as pushed screens with custom headers', async () => {
    mockGetSession.mockResolvedValue(SESSION);
    await render(<RootLayout />);
    for (const route of ['settings/index', 'settings/delete-account']) {
      expect(screen.getByTestId(`route-${route}`).props.options).toEqual({ headerShown: false });
    }
  });
});
