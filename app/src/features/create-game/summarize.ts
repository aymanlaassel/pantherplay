import { OTHER } from './options';
import type { GameForm } from './validate';

export function summarize(form: GameForm): string {
  const sport = form.sport === OTHER ? form.otherSport.trim() : form.sport;
  const when = form.startsAt.toLocaleString(undefined, {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
  const players = `${form.players} ${form.players === 1 ? 'player' : 'players'}`;
  return [sport, when, form.location.trim(), players].join(' - ');
}
