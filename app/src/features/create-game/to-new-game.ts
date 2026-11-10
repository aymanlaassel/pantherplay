import type { NewGame } from '@/api/types';
import { SKILL_LEVEL_LABEL, type SkillLevel } from '@/components/badge-level';
import type { Campus } from '@/components/campus-toggle';

import { OTHER } from './options';
import type { GameForm } from './validate';

// Turns a valid form into what createGame() takes.
export function toNewGame(form: GameForm): NewGame {
  const minutes = form.durationMinutes ?? Number(form.customMinutes);
  const level = (Object.keys(SKILL_LEVEL_LABEL) as SkillLevel[]).find((key) => SKILL_LEVEL_LABEL[key] === form.skill);
  if (!level) throw new Error(`Unknown skill level: ${form.skill}`);
  return {
    sport: form.sport === OTHER ? form.otherSport.trim() : form.sport!,
    campus: form.campus as Campus,
    location: form.location.trim(),
    startsAt: form.startsAt.toISOString(),
    durationMinutes: minutes,
    maxPlayers: form.players,
    skillLevel: level,
    notes: form.notes.trim(),
  };
}
