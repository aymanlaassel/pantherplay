import { router, useLocalSearchParams } from 'expo-router';
import { fireEvent, render, screen } from '@testing-library/react-native';

import GameDetailScreen from '@/app/game/[id]';
import { BADGE_STATUS_LABEL } from '@/components/badge-status';
import { ACTION_LABEL } from '@/features/game-detail/action-bar';
import { MOCK_GAME_DETAILS, getMockGame } from '@/features/game-detail/mock-games';
import { MAX_SEGMENTS, SpotsBar } from '@/features/game-detail/spots-bar';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), replace: jest.fn(), canGoBack: jest.fn(() => true) },
  useLocalSearchParams: jest.fn(),
}));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

const open = async (id: string) => {
  (useLocalSearchParams as jest.Mock).mockReturnValue({ id });
  await render(<GameDetailScreen />);
};

beforeEach(() => {
  (router.back as jest.Mock).mockClear();
  (router.replace as jest.Mock).mockClear();
});

test('shows the game from the Figma frame', async () => {
  await open('1');
  expect(screen.getByText('5v5 Soccer')).toBeTruthy();
  expect(screen.getByText('Hosted by Alex R.')).toBeTruthy();
  expect(screen.getByText('Today, 7:00 - 8:00 PM')).toBeTruthy();
  expect(screen.getByText('7 of 10 spots filled')).toBeTruthy();
  expect(screen.getByText('+2 more')).toBeTruthy();
  expect(screen.getByText('From the host')).toBeTruthy();
  expect(screen.getByText('Cancellation')).toBeTruthy();
});

test.each(MOCK_GAME_DETAILS)('game $id ($state) shows its action button and badge', async (game) => {
  await open(game.id);
  expect(screen.getByText(ACTION_LABEL[game.state])).toBeTruthy();
  if (game.state === 'open') return;
  expect(screen.getByText(BADGE_STATUS_LABEL[game.state])).toBeTruthy();
});

test('the mock games cover every state', () => {
  const states = new Set(MOCK_GAME_DETAILS.map((game) => game.state));
  expect(states).toEqual(new Set(['open', 'almost-full', 'full', 'joined', 'cancelled']));
});

test('an unknown game shows a not found message', async () => {
  await open('nope');
  expect(screen.getByText('Game not found')).toBeTruthy();
  expect(getMockGame('nope')).toBeUndefined();
});

test('Back goes back, or home when there is nothing to go back to', async () => {
  await open('1');
  await fireEvent.press(screen.getByLabelText('Back'));
  expect(router.back).toHaveBeenCalled();

  (router.canGoBack as jest.Mock).mockReturnValueOnce(false);
  await fireEvent.press(screen.getByLabelText('Back'));
  expect(router.replace).toHaveBeenCalledWith('/');
});

describe('spots bar', () => {
  test('draws one segment per spot with the right number filled', async () => {
    await render(<SpotsBar filled={3} max={10} />);
    expect(screen.getByRole('progressbar').props.children).toHaveLength(10);
    expect(screen.getByRole('progressbar').props.accessibilityValue).toEqual({ min: 0, max: 10, now: 3 });
  });

  test('uses a plain bar when the max is too large to draw', async () => {
    await render(<SpotsBar filled={12} max={MAX_SEGMENTS + 20} />);
    expect(screen.getByText(`12 of ${MAX_SEGMENTS + 20} spots filled`)).toBeTruthy();
    expect(screen.getByRole('progressbar').props.children).toHaveLength(2);
  });
});
