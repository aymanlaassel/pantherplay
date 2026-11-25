// The signed-in user's place in a game, counted from its players. Shared by the real and mock APIs.
import type { Game, Player } from './types';

export function myPlace(players: Player[], me: string | null): Pick<Game, 'myStatus' | 'waitlistPosition'> {
  const mine = players.find((p) => p.profile.id === me)?.status;
  if (mine === 'joined') return { myStatus: 'joined', waitlistPosition: null };
  if (mine !== 'waitlisted') return { myStatus: null, waitlistPosition: null };
  // ISO times in the same zone sort as text, so the earliest to join is first in line.
  const line = players.filter((p) => p.status === 'waitlisted').sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
  return { myStatus: 'waitlisted', waitlistPosition: line.findIndex((p) => p.profile.id === me) + 1 };
}
