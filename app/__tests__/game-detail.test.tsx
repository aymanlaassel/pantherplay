import { router, useLocalSearchParams } from 'expo-router';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { getGame } from '@/api/games';
import GameDetailScreen from '@/app/game/[id]';
import { BADGE_STATUS_LABEL } from '@/components/badge-status';
import { MAX_SEGMENTS, SpotsBar } from '@/components/spots-bar';
import { ACTION_LABEL } from '@/features/game-detail/action-bar';
import { gameState } from '@/lib/game-state';
import { mockGames, resetMockGames } from '@/mock/games';

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

beforeEach(() => {
  resetMockGames();
  (router.back as jest.Mock).mockClear();
  (router.replace as jest.Mock).mockClear();
});

test('shows the game from the Figma frame', async () => {
  await open('1');
  expect(screen.getByText('Soccer')).toBeTruthy();
  expect(screen.getByText('Hosted by Alex R.')).toBeTruthy();
  expect(screen.getByText(/^Today, 7:00\sPM - 8:00\sPM$/)).toBeTruthy();
  expect(screen.getByText('7 of 10 spots filled')).toBeTruthy();
  expect(screen.getByText('+2 more')).toBeTruthy();
  expect(screen.getByText('From the host')).toBeTruthy();
  expect(screen.getByText('Cancellation')).toBeTruthy();
});

test.each(['1', '2', '3', 'full', 'cancelled', 'soon', 'long-text'])('game %s shows the button and badge for its state', async (id) => {
  const state = gameState((await getGame(id))!);
  await open(id);
  expect(screen.getByText(ACTION_LABEL[state])).toBeTruthy();
  if (state === 'open') return;
  expect(screen.getByText(BADGE_STATUS_LABEL[state])).toBeTruthy();
});

test('the mock games cover every state', async () => {
  const games = await Promise.all(mockGames().map((game) => getGame(game.id)));
  const states = new Set(games.map((game) => gameState(game!)));
  expect(states).toEqual(new Set(['open', 'almost-full', 'starting-soon', 'full', 'joined', 'cancelled']));
});

test('a very long host name and place name still render', async () => {
  await open('long-text');
  expect(screen.getByText(/^Hosted by Bartholomew/)).toBeTruthy();
  expect(screen.getByLabelText(/^The Very Long Named/)).toBeTruthy();
});

test('an unknown game shows a not found message', async () => {
  await open('nope');
  expect(screen.getByText('Game not found')).toBeTruthy();
  expect(await getGame('nope')).toBeNull();
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
