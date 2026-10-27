import { act } from '@testing-library/react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { Stepper } from '@/components/stepper';
import { MAX_PLAYERS, MIN_PLAYERS, NOTES_MAX } from '@/features/create-game/options';
import { withDate, withTime } from '@/features/create-game/when-parse';
import { WhenFields } from '@/features/create-game/when-fields';
import { summarize } from '@/features/create-game/summarize';
import { validateGame, type GameForm } from '@/features/create-game/validate';
import CreateGameScreen from '@/app/game/create';

jest.mock('@react-native-community/datetimepicker', () => ({
  __esModule: true,
  default: () => null,
  DateTimePickerAndroid: { open: jest.fn() },
}));

jest.mock('expo-router', () => ({ router: { back: jest.fn(), replace: jest.fn(), canGoBack: jest.fn(() => true) } }));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

const now = new Date('2030-01-01T12:00:00');
const valid: GameForm = {
  sport: 'Soccer',
  otherSport: '',
  startsAt: new Date('2030-01-01T13:00:00'),
  durationMinutes: 60,
  customMinutes: '',
  campus: 'MMC',
  location: 'Panther Field',
  players: 4,
  skill: 'Any',
  notes: '',
};

test('a complete form has no errors', () => {
  expect(validateGame(valid, now)).toEqual({});
});

test('sport is required', () => {
  expect(validateGame({ ...valid, sport: null }, now).sport).toBeTruthy();
});

test('location is required', () => {
  expect(validateGame({ ...valid, location: '  ' }, now).location).toBeTruthy();
});

test('"Other" sport needs a name', () => {
  expect(validateGame({ ...valid, sport: 'Other' }, now).otherSport).toBeTruthy();
  expect(validateGame({ ...valid, sport: 'Other', otherSport: 'Cricket' }, now).otherSport).toBeUndefined();
});

test.each([['', false], ['14', false], ['15', true], ['480', true], ['481', false]])(
  'custom duration "%s" valid: %s',
  (customMinutes, ok) => {
    const errors = validateGame({ ...valid, durationMinutes: null, customMinutes }, now);
    expect(errors.duration === undefined).toBe(ok);
  },
);

test('start time cannot be in the past', () => {
  expect(validateGame({ ...valid, startsAt: new Date('2030-01-01T11:00:00') }, now).startsAt).toBeTruthy();
});

test.each([MIN_PLAYERS - 1, MAX_PLAYERS + 1])('players %i is rejected', (players) => {
  expect(validateGame({ ...valid, players }, now).players).toBeTruthy();
});

test.each([MIN_PLAYERS, MAX_PLAYERS])('players %i is accepted', (players) => {
  expect(validateGame({ ...valid, players }, now).players).toBeUndefined();
});

test('notes over the limit are rejected', () => {
  expect(validateGame({ ...valid, notes: 'x'.repeat(NOTES_MAX + 1) }, now).notes).toBeTruthy();
  expect(validateGame({ ...valid, notes: 'x'.repeat(NOTES_MAX) }, now).notes).toBeUndefined();
});

test('stepper cannot go below min or above max', async () => {
  const onChange = jest.fn();
  const { rerender } = await render(<Stepper label="Players" value={2} min={2} max={5} onChange={onChange} />);
  await fireEvent.press(screen.getByLabelText('Decrease Players'));
  expect(onChange).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByLabelText('Increase Players'));
  expect(onChange).toHaveBeenCalledWith(3);

  onChange.mockClear();
  await rerender(<Stepper label="Players" value={5} min={2} max={5} onChange={onChange} />);
  await fireEvent.press(screen.getByLabelText('Increase Players'));
  expect(onChange).not.toHaveBeenCalled();
});

test('Post game reveals the sport error until a sport is picked', async () => {
  await render(<CreateGameScreen />);
  expect(screen.queryByText('Pick a sport')).toBeNull();
  await fireEvent.press(screen.getByText('Post game'));
  expect(screen.getByText('Pick a sport')).toBeTruthy();
  expect(screen.getByText(/Still needed: .*sport/)).toBeTruthy();
  await fireEvent.press(screen.getByText('Soccer'));
  expect(screen.queryByText('Pick a sport')).toBeNull();
});

test('picking Other shows the sport name and minutes inputs', async () => {
  await render(<CreateGameScreen />);
  await fireEvent.press(screen.getAllByText('Other')[0]);
  expect(screen.getByLabelText('Which sport?')).toBeTruthy();
  await fireEvent.press(screen.getAllByText('Other')[1]);
  expect(screen.getByLabelText('Minutes')).toBeTruthy();
});

test('the screen shows the notes limit message', async () => {
  await render(<CreateGameScreen />);
  await fireEvent.changeText(screen.getByLabelText('Notes'), 'x'.repeat(NOTES_MAX + 1));
  expect(screen.getByText(`Keep notes under ${NOTES_MAX} characters`)).toBeTruthy();
});

test('Close leaves straight away when nothing was changed', async () => {
  const alert = jest.spyOn(Alert, 'alert');
  await render(<CreateGameScreen />);
  await fireEvent.press(screen.getByLabelText('Close'));
  expect(router.back).toHaveBeenCalled();
  expect(alert).not.toHaveBeenCalled();
  alert.mockRestore();
});

test('Close asks before discarding changes', async () => {
  const alert = jest.spyOn(Alert, 'alert');
  (router.back as jest.Mock).mockClear();
  await render(<CreateGameScreen />);
  await fireEvent.press(screen.getByText('Soccer'));
  await fireEvent.press(screen.getByLabelText('Close'));
  expect(alert).toHaveBeenCalledWith('Discard this game?', expect.any(String), expect.any(Array));
  expect(router.back).not.toHaveBeenCalled();
  alert.mock.calls[0][2]?.find((b) => b.text === 'Discard')?.onPress?.();
  expect(router.back).toHaveBeenCalled();
  alert.mockRestore();
});

test('Close goes home when there is no screen to go back to', async () => {
  (router.canGoBack as jest.Mock).mockReturnValueOnce(false);
  await render(<CreateGameScreen />);
  await fireEvent.press(screen.getByLabelText('Close'));
  expect(router.replace).toHaveBeenCalledWith('/');
});

test('summary joins sport, time, place and players', () => {
  const text = summarize({ ...valid, players: 1 });
  expect(text).toContain('Soccer - ');
  expect(text).toContain(' - Panther Field - 1 player');
});

test('summary uses the typed name for Other', () => {
  expect(summarize({ ...valid, sport: 'Other', otherSport: ' Cricket ' })).toMatch(/^Cricket - /);
});

test('footer shows the summary once the form is valid', async () => {
  await render(<CreateGameScreen />);
  await fireEvent.press(screen.getByText('Soccer'));
  await fireEvent.changeText(screen.getByLabelText('Location'), 'Panther Field');
  expect(screen.getByText(/^Soccer - .* - Panther Field - 1 player$/)).toBeTruthy();
});

describe('on Android', () => {
  const open = DateTimePickerAndroid.open as jest.Mock;
  beforeEach(() => {
    open.mockClear();
    jest.replaceProperty(Platform, 'OS', 'android');
  });
  afterEach(() => jest.restoreAllMocks());

  test('Date opens the native dialog and reports the picked date', async () => {
    const onChange = jest.fn();
    await render(<WhenFields value={valid.startsAt} onChange={onChange} />);
    await fireEvent.press(screen.getByLabelText(/^Date/));
    expect(open).toHaveBeenCalledWith(expect.objectContaining({ mode: 'date', value: valid.startsAt }));
    const picked = new Date('2030-02-02T09:00:00');
    open.mock.calls[0][0].onValueChange({}, picked);
    expect(onChange).toHaveBeenCalledWith(picked);
  });

  test('a past time picked through the screen shows the error', async () => {
    await render(<CreateGameScreen />);
    await fireEvent.press(screen.getByLabelText(/^Time/));
    await act(async () => open.mock.calls[0][0].onValueChange({}, new Date('2000-01-01T09:00:00')));
    expect(screen.getByText('Pick a time in the future')).toBeTruthy();
  });
});

describe('web date and time parsing', () => {
  const current = new Date('2030-01-01T13:30:00');

  test('withDate changes the day and keeps the time', () => {
    const next = withDate(current, '2030-03-05');
    expect([next.getFullYear(), next.getMonth(), next.getDate(), next.getHours()]).toEqual([2030, 2, 5, 13]);
  });

  test('withTime changes the time and keeps the day', () => {
    const next = withTime(current, '08:15');
    expect([next.getDate(), next.getHours(), next.getMinutes()]).toEqual([1, 8, 15]);
  });

  test.each([withDate, withTime])('a cleared input keeps the current value', (fn) => {
    expect(fn(current, '')).toBe(current);
  });
});
