import { act, render, screen } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import * as api from '@/api/games';
import { SPORTS } from '@/api/sports';
import DiscoverScreen from '@/app/(tabs)/index';
import MapScreen from '@/app/(tabs)/map';
import GameDetailScreen from '@/app/game/[id]';
import { mockGames, resetMockGames } from '@/mock/games';
import { notifyMockChange } from '@/mock/games-api';
import { person } from '@/mock/people';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: jest.fn(() => true) },
  useLocalSearchParams: jest.fn(),
  useFocusEffect: (effect: () => void) => require('react').useEffect(effect, [effect]),
}));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('@/api/delay', () => ({ delay: () => Promise.resolve() }));
jest.mock('@/api/games', () => require('@/mock/games-api'));
jest.mock('react-native-maps', () => {
  const React = jest.requireActual('react');
  const { Pressable, View } = jest.requireActual('react-native');
  const MapView = React.forwardRef((props: object, ref: unknown) => {
    React.useImperativeHandle(ref, () => ({ animateToRegion: jest.fn() }));
    return <View {...props} />;
  });
  const Marker = ({ children }: { children?: React.ReactNode }) => <Pressable>{children}</Pressable>;
  return { __esModule: true, default: MapView, Marker };
});

// Another phone posts a flag football game at the first game's spot.
const postFromAnotherPhone = async () => {
  const first = mockGames()[0];
  mockGames().push({ ...first, id: 'live', sport: SPORTS.find((s) => s.code === 'flag_football')!, players: [] });
  await act(async () => notifyMockChange());
};

beforeEach(() => resetMockGames());

test('a game posted from another phone appears on Discover without refreshing', async () => {
  await render(<DiscoverScreen />);
  expect(screen.queryByText('Flag Football')).toBeNull();
  await postFromAnotherPhone();
  expect(await screen.findByText('Flag Football')).toBeTruthy();
});

test('a game posted from another phone appears as a pin on Map', async () => {
  await render(<MapScreen />);
  expect(screen.queryByText('🏈')).toBeNull();
  await postFromAnotherPhone();
  expect((await screen.findAllByText('🏈')).length).toBeGreaterThan(0);
});

test('another player joining updates the spots bar on an open Game detail', async () => {
  (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '1' });
  await render(<GameDetailScreen />);
  expect(screen.getByText('7 of 10 spots filled')).toBeTruthy();
  mockGames().find((g) => g.id === '1')!.players.push({ profile: person(50), status: 'joined', joinedAt: new Date().toISOString() });
  await act(async () => notifyMockChange());
  expect(await screen.findByText('8 of 10 spots filled')).toBeTruthy();
});

test('leaving the screen stops listening', async () => {
  (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '1' });
  const getGame = jest.spyOn(api, 'getGame');
  await render(<GameDetailScreen />);
  await screen.unmount();
  getGame.mockClear();
  await act(async () => notifyMockChange());
  expect(getGame).not.toHaveBeenCalled();
  getGame.mockRestore();
});
