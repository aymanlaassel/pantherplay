import { BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed/700Bold';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { getSession, onAuthChange, type Session } from '@/lib/auth';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    BarlowCondensed_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // The auth gate: who is signed in, and whether we've checked the phone for a saved session yet.
  const [session, setSession] = useState<Session | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    getSession().then((saved) => {
      setSession(saved);
      setSessionChecked(true);
    });
    return onAuthChange(setSession);
  }, []);

  // Rendering nothing keeps the native splash up (the overlay hides it), so text never flashes in a fallback font.
  // On a font error we continue with system fonts rather than block the app on the splash.
  if (!fontsLoaded && !fontError) {
    return null;
  } 
  // Same for the session check, so a signed-in person never sees Welcome flash by.
  if (!sessionChecked) {
    return null;
  } 
  const signedIn = session !== null;

  return (
    <>
      <AnimatedSplashOverlay />
      <Stack>
        <Stack.Protected guard={signedIn}>
          <Stack.Screen name="(tabs)" options={{headerShown: false}} />
          <Stack.Screen name="game/[id]" options={{headerShown: false}} />
          <Stack.Screen name="notifications" options={{headerShown: false}} />
          <Stack.Screen name="settings/index" options={{headerShown: false}} />
          <Stack.Screen name="settings/delete-account" options={{headerShown: false}} />
          <Stack.Screen name="game/create" options={{presentation: 'fullScreenModal', headerShown: false}} />
        </Stack.Protected>
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="(auth)" options={{headerShown: false}} />
        </Stack.Protected>
      </Stack>
    </>
  );
}
