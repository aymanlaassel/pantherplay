import { router } from 'expo-router';
import { useState } from 'react';

import { createGame } from '@/api/games';

import { CAMPUSES, DURATIONS, MIN_PLAYERS, SKILLS } from './options';
import { summarize } from './summarize';
import { toNewGame } from './to-new-game';
import { validateGame, type GameErrors, type GameForm } from './validate';

function nextHour(): Date {
  const date = new Date();
  date.setHours(date.getHours() + 1, 0, 0, 0);
  return date;
}

const initial = (): GameForm => ({
  sport: null,
  otherSport: '',
  startsAt: nextHour(),
  durationMinutes: DURATIONS[0].minutes,
  customMinutes: '',
  campus: CAMPUSES[0],
  location: '',
  players: MIN_PLAYERS,
  skill: SKILLS[0],
  notes: '',
});

const same = (a: unknown, b: unknown) => (a instanceof Date && b instanceof Date ? a.getTime() === b.getTime() : a === b);

const STATUS_NAME: Record<keyof GameErrors, string> = {
  sport: 'sport',
  otherSport: 'sport name',
  startsAt: 'time',
  duration: 'duration',
  location: 'place',
  players: 'players',
  notes: 'notes',
};

// Empty-by-default fields stay quiet until the first Post press.
const QUIET: (keyof GameErrors)[] = ['sport', 'otherSport', 'duration', 'location'];

export function useGameForm() {
  const [form, setForm] = useState(initial);
  const [start] = useState(form);
  const [attempted, setAttempted] = useState(false);
  const [posting, setPosting] = useState(false);
  const [failed, setFailed] = useState(false);

  const set = <K extends keyof GameForm>(key: K, value: GameForm[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const errors = validateGame(form);
  const keys = Object.keys(errors) as (keyof GameErrors)[];
  const shown: GameErrors = attempted ? errors : { ...errors, ...Object.fromEntries(QUIET.map((k) => [k, undefined])) };
  const missing = keys.map((key) => STATUS_NAME[key]);

  // Posts the game and opens its page; says why it stopped if it did.
  const submit = async (): Promise<'invalid' | 'failed' | 'posted'> => {
    setAttempted(true);
    if (keys.length) return 'invalid';
    setPosting(true);
    setFailed(false);
    try {
      const game = await createGame(toNewGame(form));
      router.replace(`/game/${game.id}`);
      return 'posted';
    } catch {
      setFailed(true);
      return 'failed';
    } finally {
      setPosting(false);
    }
  };

  const summary = missing.length ? `Still needed: ${missing.join(', ')}` : summarize(form);
  const status = failed ? "Couldn't post your game. Try again." : summary;
  const isDirty = (Object.keys(form) as (keyof GameForm)[]).some((key) => !same(form[key], start[key]));

  return { form, set, errors: shown, status, isDirty, posting, submit };
}
