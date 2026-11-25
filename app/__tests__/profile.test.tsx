import { router } from 'expo-router';
import { fireEvent, render, screen } from '@testing-library/react-native';

import * as gamesApi from '@/api/games';
import * as profileApi from '@/api/profile';
import type { Game, Profile } from '@/api/types';
import ProfileScreen from '@/app/(tabs)/profile';
import { BADGE_STATUS_LABEL } from '@/components/badge-status';
import { ProfileContent } from '@/features/profile/profile-content';
import { signOut } from '@/lib/auth';
import { endsAt, formatTimeRange } from '@/lib/format-time';
import { mockGames, resetMockGames } from '@/mock/games';
import { ME } from '@/mock/people';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
  useFocusEffect: (effect: () => void) => require('react').useEffect(effect, [effect]),
}));
jest.mock('@/api/delay', () => ({ delay: () => Promise.resolve() }));
jest.mock('@/api/games', () => require('@/mock/games-api'));
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('@/lib/auth', () => ({ signOut: jest.fn() }));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

const PROFILE: Profile = { id: 'u1', fullName: 'Maria Gonzalez', avatarUrl: null, campus: 'MMC' };
const inHours = (h: number) => new Date(Date.now() + h * 3_600_000).toISOString();
const me = (status: 'joined' | 'waitlisted') => ({ profile: ME, status, joinedAt: inHours(-1) });

// A game from the mock set, moved to a time relative to now so the tests never depend on the clock.
const gameAt = (id: string, hours: number, over: Partial<Game> = {}): Game => ({
  ...mockGames()[0],
  id,
  startsAt: inHours(hours),
  spotsFilled: 7,
  hostGamesCount: 1,
  myStatus: 'joined',
  ...over,
});

beforeEach(() => {
  resetMockGames();
  jest.mocked(router.push).mockClear();
  jest.mocked(signOut).mockClear();
});
afterEach(() => jest.restoreAllMocks());

describe('loading through src/api/', () => {
  test('shows the name and photo from getProfile', async () => {
    const load = jest.spyOn(profileApi, 'getProfile').mockResolvedValue(PROFILE);
    await render(<ProfileScreen />);
    expect(load).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Greetings Maria!')).toBeTruthy();
    expect(screen.getByText('Maria Gonzalez')).toBeTruthy();
    expect(screen.getByText('MG')).toBeTruthy();
  });

  test('the scheduled game is my earliest joined game, on either campus, that has not ended', async () => {
    const base = mockGames()[0];
    resetMockGames([
      { ...base, id: 'later', startsAt: inHours(5), players: [me('joined')] },
      { ...base, id: 'ended', startsAt: inHours(-3), durationMinutes: 60, players: [me('joined')] },
      { ...base, id: 'waitlist', startsAt: inHours(1), players: [me('waitlisted')] },
      { ...base, id: 'not-mine', startsAt: inHours(1), players: [] },
      { ...base, id: 'bbc', startsAt: inHours(2), location: { ...base.location, campus: 'BBC', name: 'BBC Field' }, players: [me('joined')] },
    ]);
    await render(<ProfileScreen />);
    expect(screen.getByText('BBC Field · BBC')).toBeTruthy();
  });

  test('with no joined games it says so instead of showing a fake game', async () => {
    resetMockGames([]);
    await render(<ProfileScreen />);
    expect(screen.getByText('No games scheduled. Join one from Discover.')).toBeTruthy();
    expect(screen.queryByText(BADGE_STATUS_LABEL.joined)).toBeNull();
  });

  test('shows a spinner while the profile loads', async () => {
    jest.spyOn(profileApi, 'getProfile').mockReturnValue(new Promise(() => {}));
    await render(<ProfileScreen />);
    expect(screen.getByLabelText('Loading profile')).toBeTruthy();
  });

  test.each([
    ['the profile', () => jest.spyOn(profileApi, 'getProfile').mockRejectedValueOnce(new Error('offline'))],
    ['the games', () => jest.spyOn(gamesApi, 'getGames').mockRejectedValueOnce(new Error('offline'))],
  ])('shows an error when %s fail to load, and Try again recovers', async (_what, fail) => {
    jest.spyOn(profileApi, 'getProfile').mockResolvedValue(PROFILE);
    fail();
    await render(<ProfileScreen />);
    expect(screen.getByText("Couldn't load your profile.")).toBeTruthy();

    await fireEvent.press(screen.getByText('Try again'));
    expect(screen.queryByText("Couldn't load your profile.")).toBeNull();
    expect(screen.getByText('Greetings Maria!')).toBeTruthy();
  });
});

describe('ProfileContent', () => {
  test('shows the game time from real timestamps, with Today for a game today', async () => {
    const game = gameAt('g', 0.1);
    await render(<ProfileContent profile={PROFILE} nextGame={game} />);
    const range = formatTimeRange(game.startsAt, endsAt(game.startsAt, game.durationMinutes));
    const today = new Date(game.startsAt).toDateString() === new Date().toDateString();
    expect(screen.getByText(today ? `Today, ${range}` : new RegExp(`, ${range}$`))).toBeTruthy();
    expect(screen.getByText(game.sport.name)).toBeTruthy();
    expect(screen.getByText(BADGE_STATUS_LABEL.joined)).toBeTruthy();
  });

  test('a game on another day shows its date instead of Today', async () => {
    const game = gameAt('g', 72);
    await render(<ProfileContent profile={PROFILE} nextGame={game} />);
    expect(screen.queryByText(/^Today,/)).toBeNull();
  });

  test('username, win/loss record and reliability stay hidden until the database has them', async () => {
    await render(<ProfileContent profile={PROFILE} nextGame={null} />);
    expect(screen.queryByText(/^@/)).toBeNull();
    expect(screen.queryByText('WIN / LOSS RECORD')).toBeNull();
    expect(screen.queryByText('RELIABILITY')).toBeNull();
  });

  test('the gear opens Settings', async () => {
    await render(<ProfileContent profile={PROFILE} nextGame={null} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Settings' }));
    expect(router.push).toHaveBeenCalledWith('/settings');
  });

  test('a null avatar shows initials inside the split ring', async () => {
    await render(<ProfileContent profile={PROFILE} nextGame={null} />);
    expect(screen.getByText('MG')).toBeTruthy();
    expect(screen.queryByTestId('avatar-photo')).toBeNull();
    expect(screen.getByTestId('avatar-ring')).toBeTruthy();
  });

  test('a user with a photo shows the image instead of initials', async () => {
    const avatarUrl = 'https://example.com/maria.jpg';
    await render(<ProfileContent profile={{ ...PROFILE, avatarUrl }} nextGame={null} />);
    expect(screen.getByTestId('avatar-photo').props.source).toEqual([expect.objectContaining({ uri: avatarUrl })]);
    expect(screen.queryByText('MG')).toBeNull();
  });

  test('a very long name renders with limits on its lines', async () => {
    const fullName = 'Maximiliano Alejandro Bartholomew Fernández-Castellanos de la Santísima Trinidad';
    await render(<ProfileContent profile={{ ...PROFILE, fullName }} nextGame={null} />);
    expect(screen.getByText('Greetings Maximiliano!').props.numberOfLines).toBe(2);
    expect(screen.getByText(fullName).props.numberOfLines).toBe(2);
    expect(screen.getByText('MA')).toBeTruthy();
  });

  test.each(['', '   '])('an empty name (%j) does not crash: "?" initials and a default greeting', async (fullName) => {
    await render(<ProfileContent profile={{ ...PROFILE, fullName }} nextGame={null} />);
    expect(screen.getByText('?')).toBeTruthy();
    expect(screen.getByText('Greetings Panther!')).toBeTruthy();
  });

  test('there is no dark-mode button', async () => {
    await render(<ProfileContent profile={PROFILE} nextGame={null} />);
    expect(screen.queryByLabelText(/dark mode/i)).toBeNull();
  });

  test('the temporary Sign out button signs out (the auth gate then shows Welcome)', async () => {
    await render(<ProfileContent profile={PROFILE} nextGame={null} />);
    fireEvent.press(screen.getByRole('button', { name: 'Sign out' }));
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
