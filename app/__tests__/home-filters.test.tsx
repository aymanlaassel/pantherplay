import { fireEvent, render, screen } from '@testing-library/react-native';

import DiscoverScreen from '@/app/(tabs)/index';
import { mockGames, resetMockGames } from '@/mock/games';

jest.mock('expo-router', () => ({ router: { push: jest.fn() }, useFocusEffect: (effect: () => void) => require('react').useEffect(effect, [effect]) }));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('@/api/delay', () => ({ delay: () => Promise.resolve() }));

// The three games these tests were written against.
const GAMES = mockGames().filter((game) => ['1', '2', '3'].includes(game.id));
beforeEach(() => resetMockGames(GAMES));

const titles = GAMES.map((game) => game.sport);

describe('Home filter modal', () => {
  const openFilters = async () => {
    await render(<DiscoverScreen />);
    await fireEvent.press(screen.getByLabelText('Filters'));
  };

  test('the filter button opens a sheet with sport, time and skill level', async () => {
    await openFilters();
    for (const heading of ['Sport', 'Time', 'Skill level']) expect(screen.getByText(heading)).toBeTruthy();
    expect(screen.getByText('Show 2 games')).toBeTruthy();
  });

  test('choosing a sport previews the count, and Show applies it to the list', async () => {
    await openFilters();
    await fireEvent.press(screen.getByRole('button', { name: 'Soccer' }));
    await fireEvent.press(screen.getByText('Show 1 game'));

    expect(screen.getByText(titles[0])).toBeTruthy();
    expect(screen.queryByText(titles[1])).toBeNull();
    expect(screen.queryByText('Filters')).toBeNull();
    expect(screen.getByLabelText('Filters, 1 active')).toBeTruthy();
  });

  test('Cancel throws the draft away', async () => {
    await openFilters();
    await fireEvent.press(screen.getByRole('button', { name: 'Soccer' }));
    await fireEvent.press(screen.getByText('Cancel'));

    expect(screen.getByText(titles[1])).toBeTruthy();
    expect(screen.getByLabelText('Filters')).toBeTruthy();
  });

  test('Reset clears the draft', async () => {
    await openFilters();
    await fireEvent.press(screen.getByRole('button', { name: 'Soccer' }));
    await fireEvent.press(screen.getByText('Reset'));
    expect(screen.getByText('Show 2 games')).toBeTruthy();
  });

  test('filters with no match show an empty message', async () => {
    await openFilters();
    await fireEvent.press(screen.getByText('Morning'));
    await fireEvent.press(screen.getByText('Show 0 games'));
    expect(screen.getByText('No games match your filters.')).toBeTruthy();
  });

  test('reopening starts from the applied filters', async () => {
    await openFilters();
    await fireEvent.press(screen.getByRole('button', { name: 'Soccer' }));
    await fireEvent.press(screen.getByText('Show 1 game'));
    await fireEvent.press(screen.getByLabelText('Filters, 1 active'));
    expect(screen.getByText('Show 1 game')).toBeTruthy();
  });
});
