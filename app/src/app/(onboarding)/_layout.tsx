// The onboarding steps, shown after signing in: campus, sports & level, photo, then notifications.
import { Stack } from 'expo-router';

export const unstable_settings = { initialRouteName: 'campus' };

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="campus" />
      <Stack.Screen name="sports" />
      <Stack.Screen name="photo" />
      <Stack.Screen name="enable-notifications" />
    </Stack>
  );
}
