import { router } from 'expo-router';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { createGame } from '@/api/games';
import CreateGameScreen from '@/app/game/create';
import { MIN_PLAYERS } from '@/features/create-game/options';

jest.mock('@react-native-community/datetimepicker', () => ({
  __esModule: true,
  default: () => null,
  DateTimePickerAndroid: { open: jest.fn() },
}));
jest.mock('@/api/games', () => ({ createGame: jest.fn() }));
jest.mock('@/api/delay', () => ({ delay: () => Promise.resolve() }));
jest.mock('expo-router', () => ({ router: { back: jest.fn(), replace: jest.fn(), canGoBack: jest.fn(() => true) } }));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

describe('posting', () => {
  const fill = async () => {
    await render(<CreateGameScreen />);
    await fireEvent.press(screen.getByText('Soccer'));
    await fireEvent.press(await screen.findByText('Panther Field'));
  };

  test('Post game creates the game and opens its page', async () => {
    jest.mocked(createGame).mockResolvedValueOnce({ id: 'new-1' } as Awaited<ReturnType<typeof createGame>>);
    await fill();
    await fireEvent.press(screen.getByText('Post game'));
    expect(createGame).toHaveBeenCalledWith({
      sport: 'soccer',
      locationId: 'loc-field',
      startsAt: expect.any(String),
      durationMinutes: 60,
      maxPlayers: MIN_PLAYERS,
      skillLevel: 'beginner',
      notes: '',
    });
    expect(router.replace).toHaveBeenCalledWith('/game/new-1');
  });

  test('an invalid form does not post', async () => {
    jest.mocked(createGame).mockClear();
    await render(<CreateGameScreen />);
    await fireEvent.press(screen.getByText('Post game'));
    expect(createGame).not.toHaveBeenCalled();
  });

  test('a failed post shows a message and stays on the form', async () => {
    jest.mocked(createGame).mockRejectedValueOnce(new Error('offline'));
    (router.replace as jest.Mock).mockClear();
    await fill();
    await fireEvent.press(screen.getByText('Post game'));
    expect(screen.getByText("Couldn't post your game. Try again.")).toBeTruthy();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
