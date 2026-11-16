import { unstable_settings } from '@/app/(auth)/_layout';

test('a signed-out person always starts on Welcome, with Sign in on top of it', () => {
  expect(unstable_settings.initialRouteName).toBe('welcome');
});
