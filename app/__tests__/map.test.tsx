import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import * as gamesApi from '@/api/games';
import type { Game } from '@/api/types';
import MapScreen from '@/app/(tabs)/map';
import { resetMockGames } from '@/mock/games';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  useFocusEffect: (effect: () => void) => require('react').useEffect(effect, [effect]),
}));
jest.mock('@/api/delay', () => ({ delay: () => Promise.resolve() }));
jest.mock('@/api/games', () => require('@/mock/games-api'));
// The native map can't run in Jest: stand in plain views. A Marker is pressable like the real one.
jest.mock('react-native-maps', () => {
  const React = jest.requireActual('react');
  const { Pressable, View } = jest.requireActual('react-native');
  const MapView = React.forwardRef((props: object, ref: unknown) => {
    React.useImperativeHandle(ref, () => ({ animateToRegion: jest.fn() }));
    return <View {...props} />;
  });
  const Marker = ({ onPress, children }: { onPress?: () => void; children?: React.ReactNode }) => (
    <Pressable onPress={onPress}>{children}</Pressable>
  );
  return { __esModule: true, default: MapView, Marker };
});
jest.mock('react-native-svg', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: View, Path: View };
});

const SPORT_NAMES = /^(Soccer|Basketball|Volleyball|Tennis|Pickleball|Flag Football)$/;
const listedTitles = () => screen.getAllByText(SPORT_NAMES).map((t) => t.props.children);

beforeEach(() => {
  resetMockGames();
  jest.mocked(router.push).mockClear();
});
afterEach(() => jest.restoreAllMocks());

test.each(['MMC', 'BBC'] as const)('lists the same %s games as Discover, earliest first', async (campus) => {
  const expected = await gamesApi.getGames(campus);
  await render(<MapScreen />);
  if (campus === 'BBC') await fireEvent.press(screen.getByText('BBC'));

  expect(screen.getByText(`Games near ${campus}`)).toBeTruthy();
  expect(screen.getByText(`${expected.length} games · sorted by start time`)).toBeTruthy();
  expect(listedTitles()).toEqual(expected.map((g) => g.sport.name));
});

test('loads its games through getGames for the chosen campus', async () => {
  const load = jest.spyOn(gamesApi, 'getGames');
  await render(<MapScreen />);
  expect(load).toHaveBeenLastCalledWith('MMC');

  await fireEvent.press(screen.getByText('BBC'));
  expect(load).toHaveBeenLastCalledWith('BBC');
});

test('a game the user joined shows the Joined badge', async () => {
  const joined = (await gamesApi.getGames('MMC')).filter((g) => g.myStatus === 'joined');
  await render(<MapScreen />);
  expect(joined.length).toBeGreaterThan(0);
  expect(screen.getAllByText('Joined')).toHaveLength(joined.length);
});

test('spots left are counted from the players, never below zero', async () => {
  const game = (await gamesApi.getGames('MMC'))[0];
  const overfull: Game = { ...game, maxPlayers: 4, spotsFilled: 6 };
  jest.spyOn(gamesApi, 'getGames').mockResolvedValue([overfull]);
  await render(<MapScreen />);
  expect(screen.queryByText(/-\d/)).toBeNull();
});

test('every sport has a pin emoji', async () => {
  const game = (await gamesApi.getGames('MMC'))[0];
  const flag: Game = { ...game, sport: { code: 'flag_football', name: 'Flag Football' } };
  jest.spyOn(gamesApi, 'getGames').mockResolvedValue([flag]);
  await render(<MapScreen />);
  expect(screen.getAllByText('🏈').length).toBeGreaterThan(0);
});

test('first tap selects a game, second tap opens its page', async () => {
  const first = (await gamesApi.getGames('MMC'))[0];
  await render(<MapScreen />);
  const row = screen.getAllByText(first.sport.name)[0];

  await fireEvent.press(row);
  expect(router.push).not.toHaveBeenCalled();

  await fireEvent.press(row);
  expect(router.push).toHaveBeenCalledWith(`/game/${first.id}`);
});

test('shows a spinner while games load', async () => {
  jest.spyOn(gamesApi, 'getGames').mockReturnValue(new Promise(() => {}));
  await render(<MapScreen />);
  expect(screen.getByLabelText('Loading games')).toBeTruthy();
  expect(screen.queryByText(/games · sorted/)).toBeNull();
});

test('shows an error when loading fails, and Try again reloads the games', async () => {
  const games = await gamesApi.getGames('MMC');
  jest.spyOn(gamesApi, 'getGames').mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(games);
  await render(<MapScreen />);
  expect(screen.getByText("Couldn't load games.")).toBeTruthy();

  await fireEvent.press(screen.getByText('Try again'));
  expect(screen.queryByText("Couldn't load games.")).toBeNull();
  expect(screen.getByText(`${games.length} games · sorted by start time`)).toBeTruthy();
});

test('no games shows a zero count instead of an empty sheet', async () => {
  resetMockGames([]);
  await render(<MapScreen />);
  expect(screen.getByText('0 games · sorted by start time')).toBeTruthy();
});

test('the sheet toggle expands and collapses the list', async () => {
  await render(<MapScreen />);
  await fireEvent.press(screen.getByRole('button', { name: 'Expand game list' }));
  expect(screen.getByRole('button', { name: 'Collapse game list' })).toBeTruthy();
});
