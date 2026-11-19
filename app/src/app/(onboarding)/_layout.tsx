// The onboarding steps, shown after signing in: photo first, then notifications.
import { Stack } from 'expo-router';

export const unstable_settings = { initialRouteName: 'photo' };

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="photo" />
      <Stack.Screen name="enable-notifications" />
    </Stack>
  );
}
