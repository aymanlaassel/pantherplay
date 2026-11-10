import type { Player, Profile } from '@/api/types';

// The signed-in user, until real login exists.
export const ME: Profile = { id: 'me', fullName: 'Panther Student', avatarUrl: null, campus: 'MMC' };

export const person = (n: number, fullName = `Player ${n}`): Profile => ({
  id: `p${n}`,
  fullName,
  avatarUrl: null,
  campus: 'MMC',
});

const at = new Date().toISOString();

// `count` other students who have joined.
export const crowd = (count: number): Player[] =>
  Array.from({ length: count }, (_, i) => ({ profile: person(100 + i), status: 'joined', joinedAt: at }));

export const me = (status: Player['status']): Player => ({ profile: ME, status, joinedAt: at });
