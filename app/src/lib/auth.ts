// The only file that knows we sign in with Google. Swapping in FIU login later means
// changing this file, not the screens.
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import type { Session } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

export type { Session };

export type SignInResult = 
  { status: 'signed-in' } |
  { status: 'cancelled' } |
  { status: 'error'; message: string };


// Where Google sends the person back to: pantherplay://auth/callback.
// It must be in the Supabase dashboard's list of allowed redirect URLs.
const redirectTo = Linking.createURL('auth/callback');

// Reads key=value pairs from both the ?query and the #fragment of the URL.
// Supabase puts the tokens in the fragment, and errors can be in either part.
function readParams(url: string) : URLSearchParams {
  const [beforeHash, hash = ''] = url.split('#')
  const query = beforeHash.split('?')[1] ?? '';
  return new URLSearchParams(`${query}&${hash}`)
}

async function signInWithGoogle(): Promise<SignInResult> {
  const {data, error} = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {redirectTo, skipBrowserRedirect: true},
  });
  if (error) {
    return {status: 'error', message: error.message}
  }

  // Opens Google in a sheet on top of the app and waits until it comes back to redirectTo.
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') {
    return {status: 'cancelled'}
  } 


  const params = readParams(result.url);

  if (params.get('error') === 'access_denied') {
    return {status: 'cancelled'}
  }

  if (params.get('error')) {
    return {status: 'error', message: params.get('error_description') ?? 'Sign-in failed.'}
  }

  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  if (!accessToken || !refreshToken) {
    return {status: 'error', message: 'Sign-in failed.'};
  }

  const {error: sessionError} = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (sessionError) {
    return {status: 'error', message: sessionError.message}
  }

  return {status: 'signed-in'}
}

// Never throws, so the screen can't get stuck with its button disabled.
export async function signIn(): Promise <SignInResult> {
  try {
    return await signInWithGoogle();
  } catch (error) {
    return {status: 'error', message: error instanceof Error ? error.message : 'Sign-in failed.'}
  }
}

// Forgets the saved session on this phone. The next launch shows Welcome.
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

// Who is signed in right now, read from the session saved on the phone. null means nobody.
export async function getSession(): Promise<Session | null> {
  const {data} = await supabase.auth.getSession();
  return data.session;
}


// Calls `callback` whenever someone signs in or out, or their session is refreshed.
// Returns a function that stops listening; call it when the screen goes away.
export function onAuthChange(callback: (session: Session | null) => void): () => void {
  const {data} = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}
