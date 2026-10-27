import { fireEvent, render, screen } from '@testing-library/react-native';

import DiscoverScreen from '@/app/(tabs)/index';
import { applyFilters, countActive, EMPTY_FILTERS } from '@/features/home/filters';
import { MOCK_GAMES } from '@/features/home/mock-games';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

const titles = MOCK_GAMES.map((game) => game.title);

describe('applyFilters', () => {
  test('no filters keeps every game', () => {
    expect(applyFilters(MOCK_GAMES, EMPTY_FILTERS)).toEqual(MOCK_GAMES);
  });

  test('filters by sport, campus and skill level', () => {
    expect(applyFilters(MOCK_GAMES, { ...EMPTY_FILTERS, sport: 'Soccer' }).map((g) => g.id)).toEqual(['1']);
    expect(applyFilters(MOCK_GAMES, { ...EMPTY_FILTERS, campus: 'BBC' }).map((g) => g.id)).toEqual(['3']);
    expect(applyFilters(MOCK_GAMES, { ...EMPTY_FILTERS, level: 'intermediate' }).map((g) => g.id)).toEqual(['2']);
  });

  test('time slots split the day: 5 PM to midnight is evening, nothing here is in the morning', () => {
    expect(applyFilters(MOCK_GAMES, { ...EMPTY_FILTERS, time: 'evening' })).toHaveLength(MOCK_GAMES.length);
    expect(applyFilters(MOCK_GAMES, { ...EMPTY_FILTERS, time: 'morning' })).toEqual([]);
  });

  test('filters combine with AND', () => {
    expect(applyFilters(MOCK_GAMES, { ...EMPTY_FILTERS, sport: 'Soccer', campus: 'BBC' })).toEqual([]);
  });

  test('countActive counts only the chosen filters', () => {
    expect(countActive(EMPTY_FILTERS)).toBe(0);
    expect(countActive({ ...EMPTY_FILTERS, sport: 'Soccer', time: 'evening' })).toBe(2);
  });
});

describe('Home filter modal', () => {
  const openFilters = async () => {
    await render(<DiscoverScreen />);
    await fireEvent.press(screen.getByLabelText('Filters'));
  };

  test('the filter button opens a sheet with sport, campus, time and skill level', async () => {
    await openFilters();
    for (const heading of ['Sport', 'Campus', 'Time', 'Skill level']) expect(screen.getByText(heading)).toBeTruthy();
    expect(screen.getByText('Show 3 games')).toBeTruthy();
  });

  test('choosing a sport previews the count, and Show applies it to the list', async () => {
    await openFilters();
    await fireEvent.press(screen.getByText('Soccer'));
    await fireEvent.press(screen.getByText('Show 1 game'));

    expect(screen.getByText(titles[0])).toBeTruthy();
    expect(screen.queryByText(titles[1])).toBeNull();
    expect(screen.queryByText('Filters')).toBeNull();
    expect(screen.getByLabelText('Filters, 1 active')).toBeTruthy();
  });

  test('Cancel throws the draft away', async () => {
    await openFilters();
    await fireEvent.press(screen.getByText('Soccer'));
    await fireEvent.press(screen.getByText('Cancel'));

    expect(screen.getByText(titles[1])).toBeTruthy();
    expect(screen.getByLabelText('Filters')).toBeTruthy();
  });

  test('Reset clears the draft', async () => {
    await openFilters();
    await fireEvent.press(screen.getByText('Soccer'));
    await fireEvent.press(screen.getByText('Reset'));
    expect(screen.getByText('Show 3 games')).toBeTruthy();
  });

  test('filters with no match show an empty message', async () => {
    await openFilters();
    await fireEvent.press(screen.getByText('Morning'));
    await fireEvent.press(screen.getByText('Show 0 games'));
    expect(screen.getByText('No games match your filters.')).toBeTruthy();
  });

  test('reopening starts from the applied filters', async () => {
    await openFilters();
    await fireEvent.press(screen.getByText('Soccer'));
    await fireEvent.press(screen.getByText('Show 1 game'));
    await fireEvent.press(screen.getByLabelText('Filters, 1 active'));
    expect(screen.getByText('Show 1 game')).toBeTruthy();
  });
});
