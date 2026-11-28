// The signed-in user's part in a game, counted from it. Shared by the real and mock APIs.
import type { Game, GameRecord } from './types';

type MyPlace = Pick<Game, 'isHost' | 'myStatus' | 'waitlistPosition'>;

export function myPlace(record: GameRecord, me: string | null): MyPlace {
  const isHost = me !== null && record.host.id === me;
  const mine = record.players.find((p) => p.profile.id === me)?.status;
  if (mine === 'joined') return { isHost, myStatus: 'joined', waitlistPosition: null };
  if (mine !== 'waitlisted') return { isHost, myStatus: null, waitlistPosition: null };
  // Postgres trims trailing zeros from the fraction, so its ISO times sort correctly as text.
  const line = record.players.filter((p) => p.status === 'waitlisted').sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
  return { isHost, myStatus: 'waitlisted', waitlistPosition: line.findIndex((p) => p.profile.id === me) + 1 };
}
