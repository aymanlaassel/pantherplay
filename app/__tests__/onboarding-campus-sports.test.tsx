import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { getMyCampus, getMySports, saveCampus, saveSports } from '@/api/profile';
import CampusScreen from '@/app/(onboarding)/campus';
import SportsScreen from '@/app/(onboarding)/sports';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => true) } }));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('@/api/profile', () => ({
  getMyCampus: jest.fn(),
  saveCampus: jest.fn(),
  getMySports: jest.fn(),
  saveSports: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(router.canGoBack).mockReturnValue(true);
  jest.mocked(getMyCampus).mockResolvedValue(null);
  jest.mocked(getMySports).mockResolvedValue([]);
  jest.mocked(saveCampus).mockResolvedValue();
  jest.mocked(saveSports).mockResolvedValue();
});

// Next is disabled until the step is answered.
function nextIsDisabled() {
  return screen.getByRole('button', { name: 'Next' }).props.accessibilityState.disabled;
}

describe('campus step', () => {
  test('Next stays off until a campus is picked, then saves it and goes to Sports', async () => {
    await render(<CampusScreen />);
    expect(nextIsDisabled()).toBe(true);

    await fireEvent.press(screen.getByText('Biscayne Bay Campus (BBC)'));
    expect(nextIsDisabled()).toBe(false);
    await fireEvent.press(screen.getByText('Next'));

    expect(saveCampus).toHaveBeenCalledWith('BBC');
    expect(router.push).toHaveBeenCalledWith('./sports');
  });

  test('starts with the campus they saved before', async () => {
    jest.mocked(getMyCampus).mockResolvedValue('MMC');
    await render(<CampusScreen />);
    const mmc = await screen.findByRole('button', { name: 'Modesto Maidique Campus (MMC)', selected: true });
    expect(mmc).toBeTruthy();
  });

  test('stays on the step and says so when saving fails', async () => {
    jest.mocked(saveCampus).mockRejectedValue(new Error('offline'));
    await render(<CampusScreen />);
    await fireEvent.press(screen.getByText('Modesto Maidique Campus (MMC)'));
    await fireEvent.press(screen.getByText('Next'));
    expect(screen.getByText("Couldn't save your campus. Try again.")).toBeTruthy();
    expect(router.push).not.toHaveBeenCalled();
  });

  test('has no Back button when the gate opened it directly (nothing behind it)', async () => {
    jest.mocked(router.canGoBack).mockReturnValue(false);
    await render(<CampusScreen />);
    expect(screen.queryByLabelText('Back')).toBeNull();
  });
});

describe('sports step', () => {
  test('needs a level for every picked sport, then saves them and goes to Photo', async () => {
    await render(<SportsScreen />);
    expect(nextIsDisabled()).toBe(true);

    await fireEvent.press(screen.getByText('Soccer'));
    await fireEvent.press(screen.getByText('Tennis'));
    expect(screen.getByText('Pick a level for each sport')).toBeTruthy();
    expect(nextIsDisabled()).toBe(true);

    await fireEvent.press(screen.getAllByText('Intermediate')[0]); // Soccer's levels come first
    await fireEvent.press(screen.getAllByText('Beginner')[1]); // then Tennis's
    expect(screen.getByText('2 sports picked · you can change these later')).toBeTruthy();

    await fireEvent.press(screen.getByText('Next'));
    expect(saveSports).toHaveBeenCalledWith([
      { sport: 'soccer', level: 'intermediate' },
      { sport: 'tennis', level: 'beginner' },
    ]);
    expect(router.push).toHaveBeenCalledWith('./photo');
  });

  test('tapping a picked sport again removes it', async () => {
    await render(<SportsScreen />);
    await fireEvent.press(screen.getByText('Soccer'));
    expect(screen.getByText('Soccer level')).toBeTruthy();
    await fireEvent.press(screen.getByText('Soccer'));
    expect(screen.queryByText('Soccer level')).toBeNull();
    expect(nextIsDisabled()).toBe(true);
  });

  test('starts with the sports and levels they saved before', async () => {
    jest.mocked(getMySports).mockResolvedValue([{ sport: 'volleyball', level: 'advanced' }]);
    await render(<SportsScreen />);
    expect(await screen.findByText('Volleyball level')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Advanced', selected: true })).toBeTruthy();
    expect(nextIsDisabled()).toBe(false);
  });

  test('stays on the step and says so when saving fails', async () => {
    jest.mocked(saveSports).mockRejectedValue(new Error('offline'));
    await render(<SportsScreen />);
    await fireEvent.press(screen.getByText('Basketball'));
    await fireEvent.press(screen.getByText('Advanced'));
    await fireEvent.press(screen.getByText('Next'));
    expect(screen.getByText("Couldn't save your sports. Try again.")).toBeTruthy();
    expect(router.push).not.toHaveBeenCalled();
  });

  test('Back goes to the previous step', async () => {
    await render(<SportsScreen />);
    await fireEvent.press(screen.getByLabelText('Back'));
    expect(router.back).toHaveBeenCalled();
  });
});
