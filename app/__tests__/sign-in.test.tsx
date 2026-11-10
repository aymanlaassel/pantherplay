import { router } from 'expo-router';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';

import SignInScreen, { PRIVACY_URL, TERMS_URL } from '@/app/(auth)/sign-in';
import { signIn } from '@/lib/auth';

jest.mock('expo-router', () => ({ router: { replace: jest.fn(), back: jest.fn() } }));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('@/lib/auth', () => ({ signIn: jest.fn() }));

const mockSignIn = signIn as jest.Mock;
const google = () => screen.getByRole('button', { name: 'Continue with Google' });

beforeEach(() => jest.clearAllMocks());

async function pressGoogle() {
  await act(async () => {
    fireEvent.press(google());
  });
}

test('signing in leaves navigation to the auth gate and shows no error', async () => {
  mockSignIn.mockResolvedValue({ status: 'signed-in' });
  await render(<SignInScreen />);
  await pressGoogle();
  expect(mockSignIn).toHaveBeenCalledTimes(1);
  expect(router.replace).not.toHaveBeenCalled();
  expect(screen.queryByRole('alert')).toBeNull();
});

test('cancelling the Google sheet stays on Sign in with no error', async () => {
  mockSignIn.mockResolvedValue({ status: 'cancelled' });
  await render(<SignInScreen />);
  await pressGoogle();
  expect(router.replace).not.toHaveBeenCalled();
  expect(screen.queryByRole('alert')).toBeNull();
  expect(google()).toBeEnabled();
});

test('a failed sign-in shows a message on Sign in and lets the person retry', async () => {
  mockSignIn.mockResolvedValue({ status: 'error', message: 'Boom' });
  await render(<SignInScreen />);
  await pressGoogle();
  expect(router.replace).not.toHaveBeenCalled();
  expect(screen.getByText("Couldn't sign in. Please try again.")).toBeTruthy();

  mockSignIn.mockResolvedValue({ status: 'cancelled' });
  await pressGoogle();
  expect(screen.queryByRole('alert')).toBeNull();
});

test('Back returns to Welcome', async () => {
  await render(<SignInScreen />);
  fireEvent.press(screen.getByRole('button', { name: 'Back' }));
  expect(router.back).toHaveBeenCalled();
});

test.each([
  ['Terms of Service', TERMS_URL],
  ['Privacy Policy', PRIVACY_URL],
])('%s opens its page', async (label, url) => {
  const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  await render(<SignInScreen />);
  fireEvent.press(screen.getByText(label));
  expect(openURL).toHaveBeenCalledWith(url);
});
