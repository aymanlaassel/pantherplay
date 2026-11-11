import type { Game } from '@/api/types';
import { applyFilters, countActive, EMPTY_FILTERS } from '@/features/home/filters';
import { mockGames } from '@/mock/games';
import { todayAt } from '@/mock/today-at';

// The three games the filters were written against, with spots counted.
const LISTED: Game[] = mockGames()
  .filter((game) => ['1', '2', '3'].includes(game.id))
  .map((game) => ({ ...game, spotsFilled: game.players.length, myStatus: null }));

describe('applyFilters', () => {
  test('no filters keeps every game', () => {
    expect(applyFilters(LISTED, EMPTY_FILTERS)).toEqual(LISTED);
  });

  test('filters by sport and skill level', () => {
    expect(applyFilters(LISTED, { ...EMPTY_FILTERS, sport: 'soccer' }).map((g) => g.id)).toEqual(['1']);
    expect(applyFilters(LISTED, { ...EMPTY_FILTERS, level: 'intermediate' }).map((g) => g.id)).toEqual(['2']);
  });

  test('time slots split the day: 5 PM to midnight is evening, nothing here is in the morning', () => {
    expect(applyFilters(LISTED, { ...EMPTY_FILTERS, time: 'evening' })).toHaveLength(LISTED.length);
    expect(applyFilters(LISTED, { ...EMPTY_FILTERS, time: 'morning' })).toEqual([]);
  });

  test('every start hour lands in a slot, so a 3 AM game counts as morning', () => {
    const early = [{ ...LISTED[0], startsAt: todayAt(3) }];
    expect(applyFilters(early, { ...EMPTY_FILTERS, time: 'morning' })).toEqual(early);
  });

  test('filters combine with AND', () => {
    expect(applyFilters(LISTED, { ...EMPTY_FILTERS, sport: 'soccer', level: 'advanced' })).toEqual([]);
  });

  test('countActive counts only the chosen filters', () => {
    expect(countActive(EMPTY_FILTERS)).toBe(0);
    expect(countActive({ ...EMPTY_FILTERS, sport: 'soccer', time: 'evening' })).toBe(2);
  });
});
