// Read functions for the signed-in user's profile. Mock data for now; replaced by Supabase
// calls later. Keep the names, arguments and return types the same.
import { mockProfiles } from './mock-data';
import type { ProfileWithDetails } from './types';

const MOCK_DELAY_MS = 400;

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

// Default mock: the first mock profile (has an avatar).
export const mockCurrentProfile: ProfileWithDetails = {
  ...mockProfiles[0],
  sports: [
    { sport: 'soccer', skill_level: 'intermediate' },
    { sport: 'basketball', skill_level: 'beginner' },
    { sport: 'volleyball', skill_level: 'advanced' },
  ],
  games_hosted: 3,
  games_played: 12,
};

// Hostile mock: no avatar, a very long name, no games yet. The Profile screen shows it
// with ?mock=long in dev.
export const mockLongNameProfile: ProfileWithDetails = {
  id: 'p-me-long',
  full_name: 'Maximiliano Alejandro de la Concepción Fernández-Villanueva',
  avatar_url: null,
  home_campus: 'BBC',
  onboarding_completed_at: '2026-09-03T14:00:00Z',
  sports: [
    { sport: 'ultimate', skill_level: 'beginner' },
    { sport: 'soccer', skill_level: 'advanced' },
  ],
  games_hosted: 0,
  games_played: 0,
};

// The signed-in user's profile with their sports and game counts.
// TODO: read the user id from src/lib/auth.ts once auth lands.
export async function getCurrentProfile(): Promise<ProfileWithDetails> {
  await delay(MOCK_DELAY_MS);
  return mockCurrentProfile;
}
