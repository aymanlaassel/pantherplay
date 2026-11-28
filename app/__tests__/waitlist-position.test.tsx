import { useLocalSearchParams } from 'expo-router';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { myPlace } from '@/api/my-place';
import type { GameRecord, Player } from '@/api/types';
import GameDetailScreen from '@/app/game/[id]';
import { ordinal } from '@/lib/ordinal';
import { mockGames, resetMockGames } from '@/mock/games';
import { ME, person } from '@/mock/people';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), replace: jest.fn(), canGoBack: jest.fn(() => true) },
  useLocalSearchParams: jest.fn(),
}));
jest.mock('@/api/delay', () => ({ delay: () => Promise.resolve() }));
jest.mock('@/api/games', () => require('@/mock/games-api'));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

const waiting = (id: string, minute: number): Player => ({
  profile: id === ME.id ? ME : person(Number(id.slice(1))),
  status: 'waitlisted',
  joinedAt: `2026-11-25T12:${String(minute).padStart(2, '0')}:00.000Z`,
});

const record = (players: Player[]): GameRecord => ({ ...mockGames()[0], players });

const open = async (id: string) => {
  (useLocalSearchParams as jest.Mock).mockReturnValue({ id });
  await render(<GameDetailScreen />);
};

beforeEach(() => resetMockGames());

test('ordinal wording for 1st, 2nd, 3rd, 11th and beyond', () => {
  expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 101, 111].map(ordinal)).toEqual([
    '1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '22nd', '23rd', '101st', '111th',
  ]);
});

describe('myPlace', () => {
  test('counts my place in line by when each waitlisted player joined, not list order', () => {
    const players = [waiting('p2', 5), waiting(ME.id, 9), waiting('p1', 1), { ...waiting('p3', 0), status: 'left' as const }];
    expect(myPlace(record(players), ME.id)).toMatchObject({ myStatus: 'waitlisted', waitlistPosition: 3 });
  });

  test('joined players, outsiders and signed-out users have no position', () => {
    const players: Player[] = [{ ...waiting(ME.id, 0), status: 'joined' }, waiting('p1', 1)];
    expect(myPlace(record(players), ME.id)).toMatchObject({ myStatus: 'joined', waitlistPosition: null });
    expect(myPlace(record([waiting('p1', 1)]), ME.id)).toMatchObject({ myStatus: null, waitlistPosition: null });
    expect(myPlace(record([waiting('p1', 1)]), null)).toMatchObject({ myStatus: null, waitlistPosition: null });
  });
});

describe('Game detail', () => {
  test('the first waitlisted player sees "1st on the waitlist"', async () => {
    await open('full');
    await fireEvent.press(screen.getByText('Join waitlist'));
    expect(screen.getByText('1st on the waitlist')).toBeTruthy();
  });

  test('shows 2nd, and moves up after someone ahead leaves and the game reloads', async () => {
    const full = mockGames().find((g) => g.id === 'full')!;
    full.players.push(waiting('p1', 1), waiting(ME.id, 2));
    await open('full');
    expect(screen.getByText('2nd on the waitlist')).toBeTruthy();

    full.players.find((p) => p.profile.id === 'p1')!.status = 'left';
    await screen.unmount();
    await open('full');
    expect(await screen.findByText('1st on the waitlist')).toBeTruthy();
  });

  test('joined players see no position', async () => {
    await open('2');
    expect(screen.queryByText(/on the waitlist/)).toBeNull();
  });
});
