import type { Game } from '@/api/types';
import type { GameBadgeStatus } from '@/components/badge-status';

// 'open' has no badge; the rest match Badge/Status.
export type GameState = 'open' | GameBadgeStatus;

const SOON_MS = 15 * 60_000;
const ALMOST_FULL_SPOTS = 3;

// What the badge and the action button show for a game, worked out from its data.
export function gameState(game: Game, now: Date = new Date()): GameState {
  if (game.status === 'cancelled') return 'cancelled';
  if (game.myStatus === 'joined') return 'joined';
  if (game.myStatus === 'waitlisted') return 'open'; // no waitlist badge until Felipe decides
  const spotsLeft = game.maxPlayers - game.spotsFilled;
  if (spotsLeft <= 0) return 'full';
  const untilStart = new Date(game.startsAt).getTime() - now.getTime();
  if (untilStart > 0 && untilStart <= SOON_MS) return 'starting-soon';
  return spotsLeft <= ALMOST_FULL_SPOTS ? 'almost-full' : 'open';
}
