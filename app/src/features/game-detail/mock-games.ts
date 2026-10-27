import type { SkillLevel } from '@/components/badge-level';
import type { GameBadgeStatus } from '@/components/badge-status';

// 'open' has no badge; the rest match Badge/Status.
export type GameState = 'open' | GameBadgeStatus;

export type GameDetail = {
  id: string;
  title: string;
  state: GameState;
  host: { name: string; initials: string; note: string };
  when: string;
  place: string;
  level: SkillLevel;
  price: string;
  filled: number;
  max: number;
  players: string[]; // initials of the first few joined players
  notes: string;
  cancellation: string;
};

const base = {
  host: { name: 'Alex R.', initials: 'AR', note: 'Reliable host - 24 games' },
  when: 'Today, 7:00 - 8:00 PM',
  place: 'Panther Field - MMC',
  level: 'beginner' as SkillLevel,
  price: 'Free',
  players: ['AR', 'MS', 'JT', 'KL', 'DP'],
  notes: 'Bring a white and a dark shirt. We split teams on arrival.',
  cancellation: 'Leaving less than 2 hours before the start counts as a late cancel.',
};

// Placeholder games until getGame(id) from the mock data layer (W2-04) is on main.
// Ids 1 to 3 match the Home cards; 4 to 7 show the other states.
export const MOCK_GAME_DETAILS: GameDetail[] = [
  { ...base, id: '1', title: '5v5 Soccer', state: 'almost-full', filled: 7, max: 10 },
  { ...base, id: '2', title: 'Pickup Basketball', state: 'almost-full', filled: 9, max: 10, place: 'MMC Rec Center - MMC', level: 'intermediate' },
  { ...base, id: '3', title: 'Sand Volleyball', state: 'open', filled: 5, max: 10, place: 'BBC Courts - BBC', level: 'advanced' },
  { ...base, id: '4', title: '5v5 Soccer', state: 'full', filled: 10, max: 10 },
  { ...base, id: '5', title: '5v5 Soccer', state: 'joined', filled: 7, max: 10 },
  { ...base, id: '6', title: '5v5 Soccer', state: 'cancelled', filled: 7, max: 10 },
  { ...base, id: '7', title: 'Ultimate Frisbee', state: 'open', filled: 12, max: 40 },
];

export function getMockGame(id: string | undefined): GameDetail | undefined {
  return MOCK_GAME_DETAILS.find((game) => game.id === id);
}
