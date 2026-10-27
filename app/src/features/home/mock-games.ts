import type { SkillLevel } from '@/components/badge-level';

// Placeholder games until the mock data layer (W2-04) and Supabase are wired in.
export type HomeGame = {
  id: string;
  title: string;
  sport: string;
  campus: string;
  host: string;
  location: string;
  level: SkillLevel;
  spotsLeft: number;
  time: string;
  startHour: number; // 24h, used by the time-of-day filter
  price: string;
};

export const MOCK_GAMES: HomeGame[] = [
  { id: '1', title: '5v5 Soccer', sport: 'Soccer', campus: 'MMC', host: 'Alex R.', location: 'Panther Field', level: 'beginner', spotsLeft: 3, time: '7:00 - 8:00 PM', startHour: 19, price: 'Free' },
  { id: '2', title: 'Pickup Basketball', sport: 'Basketball', campus: 'MMC', host: 'Maya T.', location: 'MMC Rec Center', level: 'intermediate', spotsLeft: 1, time: '6:30 - 8:00 PM', startHour: 18, price: 'Free' },
  { id: '3', title: 'Sand Volleyball', sport: 'Volleyball', campus: 'BBC', host: 'Jordan P.', location: 'BBC Courts', level: 'advanced', spotsLeft: 5, time: '5:00 - 6:30 PM', startHour: 17, price: 'Free' },
];
