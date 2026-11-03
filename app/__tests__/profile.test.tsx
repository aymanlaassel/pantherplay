import { router } from 'expo-router';
import { fireEvent, render, screen } from '@testing-library/react-native';

import ProfileScreen from '@/app/(tabs)/profile';
import SettingsScreen from '@/app/settings/index';
import { BADGE_STATUS_LABEL } from '@/components/badge-status';
import { ProfileContent, profileInitials } from '@/features/profile/profile-content';
import { formatTimeRange } from '@/lib/format-time';
import { MOCK_USER, MOCK_USER_LONG_NAME, MOCK_USER_NULL_AVATAR } from '@/mock/profile';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

beforeEach(() => {
  (router.push as jest.Mock).mockClear();
  (router.back as jest.Mock).mockClear();
});

test('renders the identity and every section from the mock user', async () => {
  await render(<ProfileScreen />);
  const { firstName, lastName, username, scheduledGame, record, reliability } = MOCK_USER;

  expect(screen.getByText(`Greetings ${firstName}!`)).toBeTruthy();
  expect(screen.getByText(`${firstName} ${lastName}`)).toBeTruthy();
  expect(screen.getByText(`@${username}`)).toBeTruthy();

  expect(screen.getByText('GAMES SCHEDULED')).toBeTruthy();
  expect(screen.getByText(scheduledGame.title)).toBeTruthy();
  expect(screen.getByText(scheduledGame.location)).toBeTruthy();

  expect(screen.getByText('WIN / LOSS RECORD')).toBeTruthy();
  expect(screen.getByText(String(record.wins))).toBeTruthy();
  expect(screen.getByText(String(record.losses))).toBeTruthy();
  expect(screen.getByText(record.winRate)).toBeTruthy();

  expect(screen.getByText('RELIABILITY')).toBeTruthy();
  expect(screen.getByText(String(reliability.cancellations))).toBeTruthy();
});

test('the game time comes from real timestamps, not placeholder text', async () => {
  await render(<ProfileScreen />);
  const { startsAt, endsAt } = MOCK_USER.scheduledGame;
  expect(screen.getByText(`Today, ${formatTimeRange(startsAt, endsAt)}`)).toBeTruthy();
  expect(screen.queryByText(/0:00/)).toBeNull();
});

test('the gear opens Settings', async () => {
  await render(<ProfileScreen />);
  await fireEvent.press(screen.getByRole('button', { name: 'Settings' }));
  expect(router.push).toHaveBeenCalledWith('/settings');
});

test('a null avatar shows initials inside the split ring', async () => {
  await render(<ProfileContent user={MOCK_USER_NULL_AVATAR} />);
  expect(screen.getByText('MG')).toBeTruthy();
  expect(screen.queryByTestId('avatar-photo')).toBeNull();
  expect(screen.getByTestId('avatar-ring')).toBeTruthy();
});

test('a user with a photo shows the image instead of initials', async () => {
  const avatarUrl = 'https://example.com/maria.jpg';
  await render(<ProfileContent user={{ ...MOCK_USER, avatarUrl }} />);
  expect(screen.getByTestId('avatar-photo').props.source).toEqual([expect.objectContaining({ uri: avatarUrl })]);
  expect(screen.queryByText('MG')).toBeNull();
  expect(screen.getByTestId('avatar-ring')).toBeTruthy();
});

test('a very long name renders with limits on its lines', async () => {
  const { firstName, lastName, username } = MOCK_USER_LONG_NAME;
  await render(<ProfileContent user={MOCK_USER_LONG_NAME} />);

  expect(screen.getByText(`Greetings ${firstName}!`).props.numberOfLines).toBe(2);
  expect(screen.getByText(`${firstName} ${lastName}`).props.numberOfLines).toBe(2);
  expect(screen.getByText(`@${username}`).props.numberOfLines).toBe(1);
  expect(screen.getByText('MF')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Settings' })).toBeTruthy();
});

test.each([
  ['Maria', 'Gonzalez', 'MG'],
  ['maria', '', 'M'],
  ['', 'gonzalez', 'G'],
  ['  ', '  ', '?'],
  ['', '', '?'],
])('initials of "%s" "%s" are "%s"', (firstName, lastName, expected) => {
  expect(profileInitials(firstName, lastName)).toBe(expected);
});

test('empty names do not crash the screen', async () => {
  await render(<ProfileContent user={{ ...MOCK_USER, firstName: '', lastName: '', username: '' }} />);
  expect(screen.getByText('?')).toBeTruthy();
});

test('the Joined badge shows only when the user joined', async () => {
  const view = await render(<ProfileContent user={MOCK_USER} />);
  expect(screen.getByText(BADGE_STATUS_LABEL.joined)).toBeTruthy();

  const notJoined = { ...MOCK_USER, scheduledGame: { ...MOCK_USER.scheduledGame, joined: false } };
  await view.rerender(<ProfileContent user={notJoined} />);
  expect(screen.queryByText(BADGE_STATUS_LABEL.joined)).toBeNull();
});

test('there is no dark-mode button', async () => {
  await render(<ProfileScreen />);
  expect(screen.queryByLabelText(/dark mode/i)).toBeNull();
});

test('the Settings placeholder renders and Back goes back', async () => {
  await render(<SettingsScreen />);
  expect(screen.getByText('Settings')).toBeTruthy();
  expect(screen.getByText('Coming soon')).toBeTruthy();

  await fireEvent.press(screen.getByRole('button', { name: 'Back' }));
  expect(router.back).toHaveBeenCalledTimes(1);
});
