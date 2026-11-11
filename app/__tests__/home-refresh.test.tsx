import { act, render, screen } from '@testing-library/react-native';

import { createGame } from '@/api/games';
import DiscoverScreen from '@/app/(tabs)/index';

type Effect = () => void | (() => void);
const mockEffects: Effect[] = [];

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  useFocusEffect: (effect: Effect) => {
    mockEffects.push(effect);
    require('react').useEffect(effect, [effect]);
  },
}));
jest.mock('@/api/delay', () => ({ delay: () => Promise.resolve() }));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

test('a game posted while Discover is in the background shows when the tab is focused again', async () => {
  await render(<DiscoverScreen />);
  await createGame({
    sport: 'Tennis',
    locationId: 'loc-rec',
    startsAt: new Date(Date.now() + 3_600_000).toISOString(),
    durationMinutes: 60,
    maxPlayers: 4,
    skillLevel: 'beginner',
    notes: '',
  });
  expect(screen.queryByText('Tennis')).toBeNull();

  await act(async () => {
    mockEffects[mockEffects.length - 1]();
  });
  expect(screen.getByText('Tennis')).toBeTruthy();
});
