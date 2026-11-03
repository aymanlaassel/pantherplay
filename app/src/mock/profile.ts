// Mock users for the Profile screen; replaced by real data from Supabase later.
import type { ProfileUser } from '@/features/profile/profile-content';
import { todayAt } from '@/mock/today-at';

export const MOCK_USER: ProfileUser = {
  id: 'mock-user-1',
  firstName: 'Maria',
  lastName: 'Gonzalez',
  username: 'mariag',
  // No photo on file: the avatar falls back to initials.
  avatarUrl: null,
  scheduledGame: {
    title: '🏀  3v3 Basketball',
    location: 'Rec Center · MMC',
    startsAt: todayAt(18),
    endsAt: todayAt(19),
    joined: true,
  },
  record: { wins: 12, losses: 5, winRate: '71%' },
  reliability: { cancellations: 1 },
};

// Hostile cases, so the screen can be tested against bad data.
export const MOCK_USER_NULL_AVATAR: ProfileUser = { ...MOCK_USER, id: 'mock-user-2', avatarUrl: null };

export const MOCK_USER_LONG_NAME: ProfileUser = {
  ...MOCK_USER,
  id: 'mock-user-3',
  firstName: 'Maximiliano Alejandro Bartholomew',
  lastName: 'Fernández-Castellanos de la Santísima Trinidad',
  username: 'maximiliano_alejandro_fernandez_castellanos_de_la_santisima_trinidad',
};
