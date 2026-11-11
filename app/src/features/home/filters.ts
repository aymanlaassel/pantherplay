import type { Game, SportCode } from '@/api/types';
import type { SkillLevel } from '@/components/badge-level';

export type TimeSlot = 'morning' | 'afternoon' | 'evening';

export type Filters = {
  sport: SportCode | null;
  time: TimeSlot | null;
  level: SkillLevel | null;
};

export const EMPTY_FILTERS: Filters = { sport: null, time: null, level: null };

// Start hours are 24h, from inclusive to exclusive.
export const TIME_SLOTS: { value: TimeSlot; label: string; from: number; to: number }[] = [
  { value: 'morning', label: 'Morning', from: 0, to: 12 },
  { value: 'afternoon', label: 'Afternoon', from: 12, to: 17 },
  { value: 'evening', label: 'Evening', from: 17, to: 24 },
];

function inSlot(hour: number, slot: TimeSlot): boolean {
  const { from, to } = TIME_SLOTS.find((s) => s.value === slot)!;
  return hour >= from && hour < to;
}

export function applyFilters(games: Game[], filters: Filters): Game[] {
  return games.filter(
    (game) =>
      (!filters.sport || game.sport.code === filters.sport) &&
      (!filters.level || game.skillLevel === filters.level) &&
      (!filters.time || inSlot(new Date(game.startsAt).getHours(), filters.time)),
  );
}

export function countActive(filters: Filters): number {
  return Object.values(filters).filter(Boolean).length;
}
