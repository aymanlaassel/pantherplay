import * as WebBrowser from 'expo-web-browser';

import { getSession, onAuthChange, signIn, signOut } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

jest.mock('expo-linking', () => ({ createURL: () => 'pantherplay://auth/callback' }));
jest.mock('expo-web-browser', () => ({ openAuthSessionAsync: jest.fn() }));
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: jest.fn(),
      setSession: jest.fn(),
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
