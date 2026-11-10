import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import SettingsScreen from '@/app/settings';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));
jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn(() => Promise.resolve()) }));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
beforeEach(() => jest.clearAllMocks());

test('renders required sections, mock profile, and footer without excluded rows', async () => {
  await render(<SettingsScreen />);
  for (const title of ['Settings', 'Account', 'Preferences', 'Privacy & Safety', 'Support', 'User', 'Edit profile · Signed in with Google', 'PantherPlay 1.0 · Made at FIU']) expect(screen.getByText(title)).toBeTruthy();
  expect(screen.getByText('U')).toBeTruthy();
  for (const excluded of ['Language', 'Appearance', 'Who can message me']) expect(screen.queryByText(excluded)).toBeNull();
  expect(screen.queryByText(/chat/i)).toBeNull();
});

test('unfinished rows and sign out are labelled and inert', async () => {
  await render(<SettingsScreen />);
  for (const label of ['User, Edit profile, Signed in with Google', 'Sports & levels, 2 sports', 'Home campus, MMC', 'Notifications, On', 'Blocked players, 0', 'Help & feedback', 'Report a problem', 'Sign out']) await fireEvent.press(screen.getByRole('button', { name: label }));
  expect(router.push).not.toHaveBeenCalled();
  expect(router.back).not.toHaveBeenCalled();
  expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled();
});

test('Terms & Privacy Policy opens the placeholder browser URL', async () => {
  await render(<SettingsScreen />);
  await fireEvent.press(screen.getByRole('button', { name: 'Terms & Privacy Policy' }));
  expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith('https://example.com');
});

test('Delete account pushes confirmation and Back returns', async () => {
  await render(<SettingsScreen />);
  await fireEvent.press(screen.getByRole('button', { name: 'Delete account' }));
  expect(router.push).toHaveBeenCalledWith('/settings/delete-account');
  await fireEvent.press(screen.getByRole('button', { name: 'Back' }));
  expect(router.back).toHaveBeenCalledTimes(1);
});
