import { fireEvent, render, screen } from '@testing-library/react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import RootLayout from '@/app/_layout';

jest.mock('expo-font', () => ({ useFonts: jest.fn() }));
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
}));
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
// The navigator itself is not under test; render a marker instead.
jest.mock('expo-router', () => {
  const { Text } = jest.requireActual('react-native');
  const Stack = () => <Text>app</Text>;
  Stack.Screen = () => null;
  return { Stack };
});

const mockUseFonts = useFonts as jest.Mock;

beforeEach(() => jest.mocked(SplashScreen.hideAsync).mockClear());

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
