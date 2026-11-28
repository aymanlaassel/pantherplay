// The only file that knows we sign in with Google or Apple. Swapping in FIU login later means
// changing this file, not the screens.
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
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

// Apple's own sign-in sheet: asks for name and email, then hands the token to Supabase.
async function signInWithAppleSheet(): Promise<SignInResult> {
  let credential: AppleAuthentication.AppleAuthenticationCredential;
  try {
    credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
  } catch (error) {
    // Closing Apple's sheet is not an error.
    if ((error as { code?: string }).code === 'ERR_REQUEST_CANCELED') {
      return { status: 'cancelled' };
    }
    throw error;
  }

  if (!credential.identityToken) {
    return { status: 'error', message: 'Sign-in failed.' };
  }

  const { error } = await supabase.auth.signInWithIdToken({ provider: 'apple', token: credential.identityToken });
  if (error) {
    return { status: 'error', message: error.message };
  }

  // Apple only shares the name the very first time someone signs in, and the token never has it.
  // Save it now so getProviderProfile() can prefill it. If this fails they are still signed in.
  const fullName = credential.fullName ? AppleAuthentication.formatFullName(credential.fullName) : '';
  if (fullName) {
    await supabase.auth.updateUser({ data: { full_name: fullName } });
  }

  return { status: 'signed-in' };
}

// Turns anything thrown into an error result.
function failed(error: unknown): SignInResult {
  return { status: 'error', message: error instanceof Error ? error.message : 'Sign-in failed.' };
}

// Never throws, so the screen can't get stuck with its button disabled.
export async function signIn(): Promise <SignInResult> {
  try {
    return await signInWithGoogle();
  } catch (error) {
    return failed(error);
  }
}

// Sign in with Apple only works on iPhone and iPad, so screens show its button only when this is true.
export function canSignInWithApple(): boolean {
  return Platform.OS === 'ios';
}

// Same promise as signIn(): never throws.
export async function signInWithApple(): Promise<SignInResult> {
  try {
    return await signInWithAppleSheet();
  } catch (error) {
    return failed(error);
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

// The signed-in user's Supabase id (what everything is keyed on), or null if nobody is signed in.
export async function getUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user.id ?? null;
}

// Calls `callback` whenever someone signs in or out, or their session is refreshed.
// Returns a function that stops listening; call it when the screen goes away.
export function onAuthChange(callback: (session: Session | null) => void): () => void {
  const {data} = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

// The name and photo the login provider (Google or Apple) gave us, so onboarding can prefill them.
// Either can be null: not every account has a photo.
export type ProviderProfile = { name: string | null; photoUrl: string | null };

export async function getProviderProfile(): Promise<ProviderProfile> {
  const session = await getSession();
  if (!session) {
    return { name: null, photoUrl: null };
  }
  // Google puts these in user_metadata. Some accounts use `picture` instead of `avatar_url`.
  // Apple never gives a photo; its name is saved as full_name by signInWithAppleSheet().
  const metadata = session.user.user_metadata;
  return {
    name: metadata.full_name ?? metadata.name ?? null,
    photoUrl: metadata.avatar_url ?? metadata.picture ?? null,
  };
}
