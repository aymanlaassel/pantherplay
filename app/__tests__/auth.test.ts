import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { canSignInWithApple, getSession, onAuthChange, signIn, signInWithApple, signOut } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

jest.mock('expo-linking', () => ({ createURL: () => 'pantherplay://auth/callback' }));
jest.mock('expo-web-browser', () => ({ openAuthSessionAsync: jest.fn() }));
// A stand-in for Apple's sign-in sheet, so tests never open the real one.
jest.mock('expo-apple-authentication', () => ({
  signInAsync: jest.fn(),
  formatFullName: (name: { givenName: string | null; familyName: string | null }) =>
    [name.givenName, name.familyName].filter(Boolean).join(' '),
  AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
}));
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: jest.fn(),
      setSession: jest.fn(),
      signInWithIdToken: jest.fn(),
      updateUser: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

const openSheet = WebBrowser.openAuthSessionAsync as jest.Mock;
const signInWithOAuth = supabase.auth.signInWithOAuth as jest.Mock;
const setSession = supabase.auth.setSession as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  signInWithOAuth.mockResolvedValue({ data: { url: 'https://supabase.test/authorize' }, error: null });
  setSession.mockResolvedValue({ error: null });
});

test.each(['cancel', 'dismiss'])('closing the Google sheet (%s) is a cancel, not an error', async (type) => {
  openSheet.mockResolvedValue({ type });
  expect(await signIn()).toEqual({ status: 'cancelled' });
  expect(setSession).not.toHaveBeenCalled();
});

test('pressing Cancel on Google consent is a cancel, not an error', async () => {
  openSheet.mockResolvedValue({ type: 'success', url: 'pantherplay://auth/callback?error=access_denied' });
  expect(await signIn()).toEqual({ status: 'cancelled' });
});

test('saves the session from the tokens Google returns', async () => {
  openSheet.mockResolvedValue({
    type: 'success',
    url: 'pantherplay://auth/callback#access_token=a1&refresh_token=r1&token_type=bearer',
  });
  expect(await signIn()).toEqual({ status: 'signed-in' });
  expect(setSession).toHaveBeenCalledWith({ access_token: 'a1', refresh_token: 'r1' });
});

test('reports other errors from Google', async () => {
  openSheet.mockResolvedValue({
    type: 'success',
    url: 'pantherplay://auth/callback#error=server_error&error_description=Boom',
  });
  expect(await signIn()).toEqual({ status: 'error', message: 'Boom' });
});

test('reports an error when the tokens are missing', async () => {
  openSheet.mockResolvedValue({ type: 'success', url: 'pantherplay://auth/callback' });
  expect(await signIn()).toEqual({ status: 'error', message: 'Sign-in failed.' });
});

test('turns a thrown error into an error result', async () => {
  openSheet.mockRejectedValue(new Error('offline'));
  expect(await signIn()).toEqual({ status: 'error', message: 'offline' });
});

test('signOut clears the Supabase session', async () => {
  await signOut();
  expect(supabase.auth.signOut).toHaveBeenCalled();
});

test('getSession returns the saved session, or null when nobody is signed in', async () => {
  const session = { user: { id: 'user-1' } };
  (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({ data: { session } });
  expect(await getSession()).toBe(session);

  (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({ data: { session: null } });
  expect(await getSession()).toBeNull();
});

test('onAuthChange passes each new session to the callback and can stop listening', () => {
  const unsubscribe = jest.fn();
  let listener: (event: string, session: unknown) => void = () => {};
  (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((fn) => {
    listener = fn;
    return { data: { subscription: { unsubscribe } } };
  });

  const callback = jest.fn();
  const stop = onAuthChange(callback);
  listener('SIGNED_IN', { user: { id: 'user-1' } });
  listener('SIGNED_OUT', null);
  expect(callback).toHaveBeenNthCalledWith(1, { user: { id: 'user-1' } });
  expect(callback).toHaveBeenNthCalledWith(2, null);

  stop();
  expect(unsubscribe).toHaveBeenCalled();
});

describe('Sign in with Apple', () => {
  const appleSheet = AppleAuthentication.signInAsync as jest.Mock;
  const signInWithIdToken = supabase.auth.signInWithIdToken as jest.Mock;
  const updateUser = supabase.auth.updateUser as jest.Mock;

  beforeEach(() => {
    signInWithIdToken.mockResolvedValue({ error: null });
    updateUser.mockResolvedValue({ error: null });
  });

  test('hands Apple\'s token to Supabase and saves the name Apple shares the first time', async () => {
    appleSheet.mockResolvedValue({ identityToken: 'apple-token', fullName: { givenName: 'Ana', familyName: 'Lopez' } });
    expect(await signInWithApple()).toEqual({ status: 'signed-in' });
    expect(appleSheet).toHaveBeenCalledWith({ requestedScopes: [0, 1] });
    expect(signInWithIdToken).toHaveBeenCalledWith({ provider: 'apple', token: 'apple-token' });
    expect(updateUser).toHaveBeenCalledWith({ data: { full_name: 'Ana Lopez' } });
  });

  test('does not touch the name when Apple sends none (every sign-in after the first)', async () => {
    appleSheet.mockResolvedValue({ identityToken: 'apple-token', fullName: { givenName: null, familyName: null } });
    expect(await signInWithApple()).toEqual({ status: 'signed-in' });
    expect(updateUser).not.toHaveBeenCalled();
  });

  test('closing Apple\'s sheet is a cancel, not an error', async () => {
    appleSheet.mockRejectedValue(Object.assign(new Error('canceled'), { code: 'ERR_REQUEST_CANCELED' }));
    expect(await signInWithApple()).toEqual({ status: 'cancelled' });
    expect(signInWithIdToken).not.toHaveBeenCalled();
  });

  test('a missing token or a Supabase error is an error', async () => {
    appleSheet.mockResolvedValue({ identityToken: null, fullName: null });
    expect(await signInWithApple()).toEqual({ status: 'error', message: 'Sign-in failed.' });

    appleSheet.mockResolvedValue({ identityToken: 'apple-token', fullName: null });
    signInWithIdToken.mockResolvedValue({ error: { message: 'Provider is not enabled' } });
    expect(await signInWithApple()).toEqual({ status: 'error', message: 'Provider is not enabled' });
  });

  test('never throws, even when Apple\'s sheet fails', async () => {
    appleSheet.mockRejectedValue(new Error('not available'));
    expect(await signInWithApple()).toEqual({ status: 'error', message: 'not available' });
  });

  test('is offered on iOS only', () => {
    const original = Platform.OS;
    Platform.OS = 'ios';
    expect(canSignInWithApple()).toBe(true);
    Platform.OS = 'android';
    expect(canSignInWithApple()).toBe(false);
    Platform.OS = original;
  });
});
