import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { savePushToken } from '@/api/notifications';
import { registerPushToken } from '@/lib/push-token';

// The EAS project id normally comes from app.json; tests set it here.
const mockConfig = { expoConfig: { extra: { eas: { projectId: 'test-project' as string | undefined } } } };
// A getter, because jest.mock runs before mockConfig above is set.
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    get expoConfig() {
      return mockConfig.expoConfig;
    },
  },
}));
jest.mock('expo-device', () => ({ isDevice: true }));
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
}));
jest.mock('@/api/notifications', () => ({ savePushToken: jest.fn() }));

const getPermissions = Notifications.getPermissionsAsync as jest.Mock;
const getToken = Notifications.getExpoPushTokenAsync as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  Platform.OS = 'ios';
  (Device as { isDevice: boolean }).isDevice = true;
  mockConfig.expoConfig.extra.eas.projectId = 'test-project';
  getPermissions.mockResolvedValue({ status: 'granted' });
  getToken.mockResolvedValue({ data: 'ExponentPushToken[first]' });
});

test('granted: gets the token for our Expo project and saves it with the platform', async () => {
  await registerPushToken();
  expect(getToken).toHaveBeenCalledWith({ projectId: 'test-project' });
  expect(savePushToken).toHaveBeenCalledWith('ExponentPushToken[first]', 'ios');
});

test('denied: saves nothing and never asks again', async () => {
  getPermissions.mockResolvedValue({ status: 'denied' });
  await registerPushToken();
  expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  expect(getToken).not.toHaveBeenCalled();
  expect(savePushToken).not.toHaveBeenCalled();
});

test('changed: a new token on the next start is saved again', async () => {
  await registerPushToken();
  getToken.mockResolvedValue({ data: 'ExponentPushToken[second]' });
  await registerPushToken();
  expect(savePushToken).toHaveBeenLastCalledWith('ExponentPushToken[second]', 'ios');
  expect(savePushToken).toHaveBeenCalledTimes(2);
});

test('saves the Android platform on Android', async () => {
  Platform.OS = 'android';
  await registerPushToken();
  expect(savePushToken).toHaveBeenCalledWith('ExponentPushToken[first]', 'android');
});

test('skips simulators, the web, and a missing EAS project id', async () => {
  (Device as { isDevice: boolean }).isDevice = false;
  await registerPushToken();

  (Device as { isDevice: boolean }).isDevice = true;
  Platform.OS = 'web';
  await registerPushToken();

  Platform.OS = 'ios';
  mockConfig.expoConfig.extra.eas.projectId = undefined;
  await registerPushToken();

  expect(getToken).not.toHaveBeenCalled();
  expect(savePushToken).not.toHaveBeenCalled();
});
