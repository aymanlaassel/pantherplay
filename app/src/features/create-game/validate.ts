import type { Duration, Location, SportCode } from '@/api/types';
import type { Campus } from '@/components/campus-toggle';

import { MAX_PLAYERS, MIN_PLAYERS, NOTES_MAX } from './options';

export type GameForm = {
  sport: SportCode | null;
  startsAt: Date;
  durationMinutes: Duration;
  campus: Campus;
  location: Location | null;
  players: number;
  skill: string;
  notes: string;
};

export type GameErrors = Partial<
  Record<'sport' | 'startsAt' | 'location' | 'players' | 'notes', string>
>;

export function validateGame(form: GameForm, now: Date = new Date()): GameErrors {
  const errors: GameErrors = {};
  if (!form.sport) errors.sport = 'Pick a sport';
  if (form.startsAt.getTime() <= now.getTime()) errors.startsAt = 'Pick a time in the future';
  if (!form.location) errors.location = "Pick where you're playing";
  if (form.players < MIN_PLAYERS || form.players > MAX_PLAYERS) {
    errors.players = `Players must be between ${MIN_PLAYERS} and ${MAX_PLAYERS}`;
  }
  if (form.notes.length > NOTES_MAX) errors.notes = `Keep notes under ${NOTES_MAX} characters`;
  return errors;
}
