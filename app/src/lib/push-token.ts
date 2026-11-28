// Gets this phone's Expo push token and saves it, so push notifications can reach it (W8-17).
// Never asks for permission itself: onboarding asks once, and a "no" is respected after that.
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { savePushToken } from '@/api/notifications';

// The Expo (EAS) project id from app.json, which Expo needs to make a push token.
// Missing until `eas init` is run under the shared Expo account.
function easProjectId(): string | null {
  return Constants.expoConfig?.extra?.eas?.projectId ?? null;
}

// Runs after the onboarding prompt and on every app start. Saving on every start means a token that
// changed (after a reinstall or restore) is saved again. Saving the same token twice is harmless.
// Returns quietly when there's nothing to save, so callers don't need to check anything first.
export async function registerPushToken(): Promise<void> {
  // Push only works on real iPhones and Android phones, not on simulators or the web.
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return;
  if (!Device.isDevice) return;

  // Only read the permission here, never request it.
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return;

  const projectId = easProjectId();
  if (!projectId) return;

  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  await savePushToken(token, Platform.OS);
}
