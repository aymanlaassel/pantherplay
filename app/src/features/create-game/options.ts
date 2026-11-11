import type { Duration } from '@/api/types';
import { SKILL_LEVEL_LABEL } from '@/components/badge-level';
import type { Campus } from '@/components/campus-toggle';

// The database only allows these three lengths.
export const DURATIONS: { label: string; minutes: Duration }[] = [
  { label: '1 hr', minutes: 60 },
  { label: '1.5 hr', minutes: 90 },
  { label: '2 hr', minutes: 120 },
];
export const SKILLS = Object.values(SKILL_LEVEL_LABEL);
export const CAMPUSES: Campus[] = ['MMC', 'BBC'];

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 30;
export const NOTES_MAX = 140;
