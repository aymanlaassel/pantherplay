import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import CreateGameScreen from '@/app/game/create';
import { latestStart, MAX_DAYS_AHEAD } from '@/features/create-game/options';
import { validateGame, type GameForm } from '@/features/create-game/validate';
import { WhenFields } from '@/features/create-game/when-fields';
import { FIELD } from '@/mock/locations';

jest.mock('@react-native-community/datetimepicker', () => ({
  __esModule: true,
  default: jest.fn(() => null),
  DateTimePickerAndroid: { open: jest.fn() },
}));
jest.mock('@/api/delay', () => ({ delay: () => Promise.resolve() }));
jest.mock('@/api/locations', () => require('@/mock/locations-api'));
jest.mock('@/api/games', () => require('@/mock/games-api'));
jest.mock('expo-router', () => ({ router: { back: jest.fn(), replace: jest.fn(), canGoBack: jest.fn(() => true) } }));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.setTimeout(20_000);

const DAY = 24 * 60 * 60_000;
const now = new Date('2030-01-01T12:00:00');
const form = (startsAt: Date): GameForm => ({
  sport: 'soccer',
  startsAt,
  durationMinutes: 60,
  campus: 'MMC',
  location: FIELD,
  players: 4,
  skill: 'Beginner',
  notes: '',
});

// The latest start the picker offers, which is computed from the real clock when it opens.
const expectAboutTwoWeeksOut = (date: Date) => {
  expect(Math.abs(date.getTime() - (Date.now() + MAX_DAYS_AHEAD * DAY))).toBeLessThan(5_000);
};

test('a game exactly 14 days ahead is fine, a minute later is not', () => {
  expect(validateGame(form(new Date(now.getTime() + 14 * DAY)), now).startsAt).toBeUndefined();
  expect(validateGame(form(new Date(now.getTime() + 14 * DAY + 60_000)), now).startsAt).toBe('Games can be up to 14 days ahead');
  expect(latestStart(now)).toEqual(new Date(now.getTime() + 14 * DAY));
});

test('the iOS picker stops at 14 days from now', async () => {
  await render(<WhenFields value={now} onChange={jest.fn()} />);
  await fireEvent.press(screen.getByLabelText(/^Date/));
  const props = jest.mocked(DateTimePicker).mock.calls.at(-1)![0];
  expectAboutTwoWeeksOut(props.maximumDate!);
});

describe('on Android', () => {
  const open = DateTimePickerAndroid.open as jest.Mock;
  beforeEach(() => {
    open.mockClear();
    jest.replaceProperty(Platform, 'OS', 'android');
  });
  afterEach(() => jest.restoreAllMocks());

  test('the date dialog stops at 14 days from now', async () => {
    await render(<WhenFields value={now} onChange={jest.fn()} />);
    await fireEvent.press(screen.getByLabelText(/^Date/));
    expectAboutTwoWeeksOut(open.mock.calls[0][0].maximumDate);
  });

  test('a date past 14 days picked through the screen shows the error', async () => {
    await render(<CreateGameScreen />);
    await fireEvent.press(screen.getByLabelText(/^Date/));
    await act(async () => open.mock.calls[0][0].onValueChange({}, new Date(Date.now() + 20 * DAY)));
    expect(screen.getByText('Games can be up to 14 days ahead')).toBeTruthy();
  });
});
