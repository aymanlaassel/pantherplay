// Mock until Supabase is wired in (W3-08). Then these read and write profiles.onboarding_completed_at.
// For now the time is saved on the phone, so reopening the app still skips onboarding.
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'mock:onboarding_completed_at';

// Called when the last onboarding step is done. Stamps the current time.
export async function finishOnboarding(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, new Date().toISOString());
}

// True once finishOnboarding() has run.
export async function hasFinishedOnboarding(): Promise<boolean> {
  const completedAt = await AsyncStorage.getItem(ONBOARDING_KEY);
  return completedAt !== null;
}
