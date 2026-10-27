import type { SkillLevel } from '@/components/badge-level';

import type { HomeGame } from './mock-games';

export type TimeSlot = 'morning' | 'afternoon' | 'evening';

export type Filters = {
  sport: string | null;
  campus: string | null;
  time: TimeSlot | null;
  level: SkillLevel | null;
};

export const EMPTY_FILTERS: Filters = { sport: null, campus: null, time: null, level: null };

// Start hours are 24h, from inclusive to exclusive.
export const TIME_SLOTS: { value: TimeSlot; label: string; from: number; to: number }[] = [
  { value: 'morning', label: 'Morning', from: 5, to: 12 },
  { value: 'afternoon', label: 'Afternoon', from: 12, to: 17 },
  { value: 'evening', label: 'Evening', from: 17, to: 24 },
];

function inSlot(hour: number, slot: TimeSlot): boolean {
  const { from, to } = TIME_SLOTS.find((s) => s.value === slot)!;
  return hour >= from && hour < to;
}

export function applyFilters(games: HomeGame[], filters: Filters): HomeGame[] {
  return games.filter(
    (game) =>
      (!filters.sport || game.sport === filters.sport) &&
      (!filters.campus || game.campus === filters.campus) &&
      (!filters.level || game.level === filters.level) &&
      (!filters.time || inSlot(game.startHour, filters.time)),
  );
}

export function countActive(filters: Filters): number {
  return Object.values(filters).filter(Boolean).length;
}
