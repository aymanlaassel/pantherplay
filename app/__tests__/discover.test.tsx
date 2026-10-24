import { fireEvent, render, screen } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { listGames, setMockScenario, type GameWithDetails } from '@/api';
import { getMockGames } from '@/api/mock-data';
import DiscoverScreen from '@/app/(tabs)/index';
import { chipLabel, nextDays } from '@/components/date-chips';
import { badgeFor, GameCard, sportName } from '@/components/game-card';
import { SpotsBar } from '@/components/spots-bar';
import { colors } from '@/theme';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  useLocalSearchParams: jest.fn(() => ({})),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
// The screen filters by today's date, so feed it games that start right now instead of the
// W2-04 mock (whose "today" games can roll into tomorrow late at night).
jest.mock('@/api', () => ({ listGames: jest.fn(), setMockScenario: jest.fn() }));

const mockParams = useLocalSearchParams as jest.Mock;
const mockListGames = listGames as jest.Mock;
const mocks = getMockGames();
const byId = (id: string) => mocks.find((g) => g.id === id)!;

const game = (overrides: Partial<GameWithDetails> = {}): GameWithDetails => ({
  ...byId('g-day-1'),
  ...overrides,
});

// One MMC game with the 60-char notes and a no-avatar host, one BBC game, both starting now.
const longNotes = byId('g-long').notes!;
const todayGames = (): GameWithDetails[] => {
  const now = new Date().toISOString();
  const mmc = byId('g-day-2');
  return [
    { ...mmc, id: 'mmc-1', starts_at: now, notes: longNotes },
    { ...byId('g-long'), id: 'bbc-1', starts_at: now, notes: 'BBC only' },
  ];
};

beforeEach(() => {
  mockParams.mockReturnValue({});
  mockListGames.mockReset().mockImplementation(async () => todayGames());
  jest.mocked(setMockScenario).mockClear();
  jest.mocked(router.push).mockClear();
});

test('W2-04 mock data has the hostile cases Discover must survive', () => {
  expect(longNotes).toHaveLength(60);
  expect(mocks.some((g) => g.host.avatar_url === null)).toBe(true);
  expect(mocks.length).toBeGreaterThanOrEqual(47);
});

describe('Discover screen', () => {
  test('lists today’s MMC games and opens one on tap', async () => {
    await render(<DiscoverScreen />);
    await fireEvent.press(await screen.findByText(longNotes));
    expect(router.push).toHaveBeenCalledWith('/game/mmc-1');
    expect(screen.queryByText('BBC only')).toBeNull();
  });

  test('?mock=empty uses the API mock switch and shows the empty state', async () => {
    mockParams.mockReturnValue({ mock: 'empty' });
    mockListGames.mockResolvedValue([]);
    await render(<DiscoverScreen />);
    expect(await screen.findByText('No games today')).toBeTruthy();
    expect(setMockScenario).toHaveBeenCalledWith('empty');
  });

  test('shows the error state and retries', async () => {
    mockParams.mockReturnValue({ mock: 'error' });
    await render(<DiscoverScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Try again' }));
    expect(await screen.findByText("Couldn't load games")).toBeTruthy();
  });

  test('shows a spinner while loading', async () => {
    mockParams.mockReturnValue({ mock: 'loading' });
    await render(<DiscoverScreen />);
    expect(screen.getByLabelText('Loading games')).toBeTruthy();
  });

  test('switching campus changes the list', async () => {
    await render(<DiscoverScreen />);
    await screen.findByText(longNotes);
    await fireEvent.press(screen.getByRole('tab', { name: 'BBC' }));
    expect(screen.queryByText(longNotes)).toBeNull();
    expect(screen.getByText('BBC only')).toBeTruthy();
  });

  test('the bell opens notifications', async () => {
    await render(<DiscoverScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Notifications' }));
    expect(router.push).toHaveBeenCalledWith('/notifications');
  });
});

describe('Game card', () => {
  test('headline is the sport; falls back to initials when the host has no avatar', async () => {
    await render(<GameCard game={game({ host: { ...byId('g-day-1').host, full_name: 'Felipe Trujillo', avatar_url: null } })} />);
    expect(screen.getByText('Soccer')).toBeTruthy();
    expect(screen.getByTestId('avatar-fallback')).toBeTruthy();
    expect(screen.getByText('FT')).toBeTruthy();
  });

  test('sport codes read as names', () => {
    expect(sportName('basketball')).toBe('Basketball');
  });

  test('picks one badge, with cancelled and full winning', () => {
    const now = new Date('2026-10-23T12:00:00Z');
    const soon = '2026-10-23T12:30:00Z';
    const later = '2026-10-24T12:00:00Z';
    expect(badgeFor(game({ status: 'cancelled', starts_at: soon }), now)).toBe('cancelled');
    expect(badgeFor(game({ status: 'full', players_joined: 10, max_players: 10, starts_at: soon }), now)).toBe('full');
    expect(badgeFor(game({ players_joined: 2, max_players: 10, starts_at: soon }), now)).toBe('starting-soon');
    expect(badgeFor(game({ players_joined: 9, max_players: 10, starts_at: later }), now)).toBe('almost-full');
    expect(badgeFor(game({ players_joined: 2, max_players: 10, starts_at: later, status: 'open' }), now)).toBeNull();
  });
});
describe('Spots bar', () => {
  test('clamps the fill to the track', async () => {
    await render(<SpotsBar filled={14} max={10} />);
    expect(screen.getByTestId('spots-bar-fill')).toHaveStyle({ width: '100%' });
    expect(screen.getByText('14 of 10 spots')).toBeTruthy();
  });

  test('turns gold when almost full', async () => {
    await render(<SpotsBar filled={8} max={10} />);
    expect(screen.getByTestId('spots-bar-fill')).toHaveStyle({ backgroundColor: colors.brand.gold });
  });
});

test('date chips read Today, Tomorrow, then weekday and date', () => {
  const now = new Date(2026, 9, 23, 15);
  const labels = nextDays(7, now).map((d) => chipLabel(d, now));
  expect(labels.slice(0, 2)).toEqual(['Today', 'Tomorrow']);
  expect(labels).toHaveLength(7);
  expect(labels[2]).toMatch(/25$/);
});
