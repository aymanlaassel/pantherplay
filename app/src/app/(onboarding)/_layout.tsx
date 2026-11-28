// The onboarding steps, shown after signing in: 18+, campus, sports & level, photo, then notifications.
// No initialRouteName: the gate in (tabs)/_layout.tsx opens the right step, and Back only goes to steps
// the person actually visited.
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="adult" />
      <Stack.Screen name="campus" />
      <Stack.Screen name="sports" />
      <Stack.Screen name="photo" />
      <Stack.Screen name="enable-notifications" />
    </Stack>
  );
}
