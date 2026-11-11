import type { NewGame } from '@/api/types';
import { SKILL_LEVEL_LABEL, type SkillLevel } from '@/components/badge-level';

import { OTHER } from './options';
import type { GameForm } from './validate';

// Turns a valid form into what createGame() takes.
export function toNewGame(form: GameForm): NewGame {
  const level = (Object.keys(SKILL_LEVEL_LABEL) as SkillLevel[]).find((key) => SKILL_LEVEL_LABEL[key] === form.skill);
  if (!level) throw new Error(`Unknown skill level: ${form.skill}`);
  if (!form.location) throw new Error('No location picked');
  return {
    sport: form.sport === OTHER ? form.otherSport.trim() : form.sport!,
    locationId: form.location.id,
    startsAt: form.startsAt.toISOString(),
    durationMinutes: form.durationMinutes,
    maxPlayers: form.players,
    skillLevel: level,
    notes: form.notes.trim(),
  };
}
