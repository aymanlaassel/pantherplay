import type { SkillLevel } from '@/components/badge-level';

// Placeholder games until the mock data layer (W2-04) and Supabase are wired in.
export type HomeGame = {
  id: string;
  title: string;
  host: string;
  location: string;
  level: SkillLevel;
  spotsLeft: number;
  time: string;
  price: string;
};

export const MOCK_GAMES: HomeGame[] = [
  { id: '1', title: '5v5 Soccer', host: 'Alex R.', location: 'Panther Field', level: 'beginner', spotsLeft: 3, time: '7:00 - 8:00 PM', price: 'Free' },
  { id: '2', title: 'Pickup Basketball', host: 'Maya T.', location: 'MMC Rec Center', level: 'intermediate', spotsLeft: 1, time: '6:30 - 8:00 PM', price: 'Free' },
  { id: '3', title: 'Sand Volleyball', host: 'Jordan P.', location: 'BBC Courts', level: 'advanced', spotsLeft: 5, time: '5:00 - 6:30 PM', price: 'Free' },
];
