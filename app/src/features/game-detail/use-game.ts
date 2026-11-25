// Loads one game and tracks whether it is loading, ready, missing or failed.
// Loads again live whenever someone joins or leaves it (Realtime).
import { useEffect, useState } from 'react';

import { getGame, onGamePlayersChange } from '@/api/games';
import type { Game } from '@/api/types';

type Result = { key: string; game: Game | null; failed: boolean };

export function useGame(id: string) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result>({ key: '', game: null, failed: false });
  const key = `${id}:${attempt}`;

  useEffect(() => {
    // Ignore the answer if the screen closed or a retry started while it was on its way.
    let current = true;
    const load = () =>
      getGame(id).then(
        (game) => current && setResult({ key, game, failed: false }),
        () => current && setResult({ key, game: null, failed: true }),
      );
    void load();
    const stop = onGamePlayersChange(id, load);
    return () => {
      current = false;
      stop();
    };
  }, [id, key]);

  // After Join or Leave, fetch the game again so the screen shows what the server now says.
  const refresh = () =>
    getGame(id).then(
      (game) => setResult({ key, game, failed: false }),
      () => setResult({ key, game: null, failed: true }),
    );

  const loaded = result.key === key;
  const status = !loaded ? 'loading' : result.failed ? 'error' : result.game ? 'ready' : 'missing';

  return { game: loaded ? result.game : null, status, retry: () => setAttempt((n) => n + 1), refresh };
}
