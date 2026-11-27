import { act, render, screen } from '@testing-library/react-native';

import DiscoverScreen from '@/app/(tabs)/index';
import { mockGames } from '@/mock/games';

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
jest.mock('@/api/games', () => require('@/mock/games-api'));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

test('a game posted while Discover is in the background shows when the tab is focused again', async () => {
  await render(<DiscoverScreen />);
  // Someone posts a tennis game on this campus while the tab is in the background.
  const [first] = mockGames();
  mockGames().push({ ...first, id: 'posted-later', sport: { code: 'tennis', name: 'Tennis' } });
  expect(screen.queryByText('Tennis')).toBeNull();

  await act(async () => {
    // Fire every focus effect, as a real focus does (the bell registers one too now).
    for (const effect of [...mockEffects]) effect();
  });
  expect(screen.getByText('Tennis')).toBeTruthy();
});
