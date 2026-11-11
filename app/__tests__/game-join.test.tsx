import { useLocalSearchParams } from 'expo-router';
import { fireEvent, render, screen } from '@testing-library/react-native';

import * as api from '@/api/games';
import GameDetailScreen from '@/app/game/[id]';
import { resetMockGames } from '@/mock/games';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), replace: jest.fn(), canGoBack: jest.fn(() => true) },
  useLocalSearchParams: jest.fn(),
}));
jest.mock('@/api/delay', () => ({ delay: () => Promise.resolve() }));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

const open = async (id: string) => {
  (useLocalSearchParams as jest.Mock).mockReturnValue({ id });
  await render(<GameDetailScreen />);
};

beforeEach(() => resetMockGames());

describe('Join and Leave', () => {
  afterEach(() => jest.restoreAllMocks());

  test('joining a game with room shows Joined, then Leave', async () => {
    await open('1');
    expect(screen.queryByText('Joined')).toBeNull();
    await fireEvent.press(screen.getByText('Join game'));
    expect(screen.getAllByText('Joined').length).toBeGreaterThan(0);
    expect(screen.getByText('Leave game')).toBeTruthy();
    expect(screen.getByText('8 of 10 spots filled')).toBeTruthy();
  });

  test('joining a full game shows Waitlisted, and leaving brings Join back', async () => {
    await open('full');
    await fireEvent.press(screen.getByText('Join waitlist'));
    expect(screen.getByText('Waitlisted')).toBeTruthy();
    expect(screen.queryByText('Full')).toBeNull();
    expect(screen.getByText('Leave game')).toBeTruthy();

    await fireEvent.press(screen.getByText('Leave game'));
    expect(screen.queryByText('Waitlisted')).toBeNull();
    expect(screen.getByText('Join waitlist')).toBeTruthy();
  });

  test('leaving a joined game brings Join back', async () => {
    await open('2');
    await fireEvent.press(screen.getByText('Leave game'));
    expect(screen.getByText('Join game')).toBeTruthy();
    expect(screen.getByText('8 of 10 spots filled')).toBeTruthy();
  });

  test('a cancelled game cannot be joined', async () => {
    await open('cancelled');
    expect(screen.getByRole('button', { name: 'Game cancelled', disabled: true })).toBeTruthy();
  });

  test('a failed join shows a message instead of crashing', async () => {
    jest.spyOn(api, 'joinGame').mockRejectedValueOnce(new Error('offline'));
    await open('1');
    await fireEvent.press(screen.getByText('Join game'));
    expect(screen.getByText("That didn't work. Try again.")).toBeTruthy();
    expect(screen.getByText('Join game')).toBeTruthy();
  });

  test('a join that worked but could not be reloaded shows the load error, not a failed join', async () => {
    await open('1');
    jest.spyOn(api, 'getGame').mockRejectedValueOnce(new Error('offline'));
    await fireEvent.press(screen.getByText('Join game'));
    expect(screen.getByText("Couldn't load this game.")).toBeTruthy();
    expect(screen.queryByText("That didn't work. Try again.")).toBeNull();
  });

  test('a failed load shows an error, and Try again loads the game', async () => {
    jest.spyOn(api, 'getGame').mockRejectedValueOnce(new Error('offline'));
    await open('1');
    expect(screen.getByText("Couldn't load this game.")).toBeTruthy();
    await fireEvent.press(screen.getByText('Try again'));
    expect(screen.getByText('Soccer')).toBeTruthy();
  });

  test('shows a spinner while the game loads', async () => {
    jest.spyOn(api, 'getGame').mockReturnValueOnce(new Promise(() => {}));
    await open('1');
    expect(screen.getByLabelText('Loading game')).toBeTruthy();
  });
});
