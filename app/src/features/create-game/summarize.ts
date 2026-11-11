import { SPORTS } from '@/api/sports';

import type { GameForm } from './validate';

export function summarize(form: GameForm): string {
  const sport = SPORTS.find((s) => s.code === form.sport)?.name;
  const when = form.startsAt.toLocaleString(undefined, {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
  const players = `${form.players} ${form.players === 1 ? 'player' : 'players'}`;
  return [sport, when, form.location?.name ?? '', players].join(' - ');
}
