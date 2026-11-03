import type { SkillLevel } from '@/components/badge-level';
import type { Campus } from '@/components/campus-toggle';
import { todayAt } from '@/mock/today-at';

// Placeholder games until the mock data layer (W2-04) and Supabase are wired in.
// Ids 1 to 3 are the same games on Home, Map and Game detail.
export type HomeGame = {
  id: string;
  title: string;
  sport: string;
  campus: Campus;
  host: string;
  location: string;
  level: SkillLevel;
  filled: number;
  max: number;
  startsAt: string;
  endsAt: string;
  price: string;
  status: 'confirmed' | 'joined' | null; // null: no status shown on the card
};

export const MOCK_GAMES: HomeGame[] = [
  { id: '1', title: '5v5 Soccer', sport: 'Soccer', campus: 'MMC', host: 'Alex R.', location: 'Panther Field', level: 'beginner', filled: 7, max: 10, startsAt: todayAt(19), endsAt: todayAt(20), price: 'Free', status: 'confirmed' },
  { id: '2', title: 'Pickup Basketball', sport: 'Basketball', campus: 'MMC', host: 'Maya T.', location: 'Rec Center Courts', level: 'intermediate', filled: 9, max: 10, startsAt: todayAt(18, 30), endsAt: todayAt(20), price: 'Free', status: 'joined' },
  { id: '3', title: 'Sand Volleyball', sport: 'Volleyball', campus: 'BBC', host: 'Jordan P.', location: 'BBC Recreation Field', level: 'advanced', filled: 5, max: 10, startsAt: todayAt(17), endsAt: todayAt(18, 30), price: 'Free', status: null },
];

// Stands in for the real request until Supabase is wired in, so Home already handles waiting and failing.
export async function listMockGames(): Promise<HomeGame[]> {
  return MOCK_GAMES;
}
