import { DURATION_MAX, DURATION_MIN, MAX_PLAYERS, MIN_PLAYERS, NOTES_MAX, OTHER } from './options';

export type GameForm = {
  sport: string | null;
  otherSport: string;
  startsAt: Date;
  durationMinutes: number | null;
  customMinutes: string;
  campus: string;
  location: string;
  players: number;
  skill: string;
  notes: string;
};

export type GameErrors = Partial<
  Record<'sport' | 'otherSport' | 'startsAt' | 'duration' | 'location' | 'players' | 'notes', string>
>;

export function validateGame(form: GameForm, now: Date = new Date()): GameErrors {
  const errors: GameErrors = {};
  if (!form.sport) errors.sport = 'Pick a sport';
  else if (form.sport === OTHER && !form.otherSport.trim()) errors.otherSport = 'Name the sport';
  if (form.startsAt.getTime() <= now.getTime()) errors.startsAt = 'Pick a time in the future';
  const minutes = Number(form.customMinutes);
  if (form.durationMinutes === null && !(Number.isInteger(minutes) && minutes >= DURATION_MIN && minutes <= DURATION_MAX)) {
    errors.duration = `Enter ${DURATION_MIN} to ${DURATION_MAX} minutes`;
  }
  if (!form.location.trim()) errors.location = "Add where you're playing";
  if (form.players < MIN_PLAYERS || form.players > MAX_PLAYERS) {
    errors.players = `Players must be between ${MIN_PLAYERS} and ${MAX_PLAYERS}`;
  }
  if (form.notes.length > NOTES_MAX) errors.notes = `Keep notes under ${NOTES_MAX} characters`;
  return errors;
}
