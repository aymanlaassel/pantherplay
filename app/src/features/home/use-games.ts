// Loads a campus's games and tracks whether they're loading, ready or failed.
// Loads again each time the tab regains focus, so a game posted elsewhere shows up.
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { getGames } from '@/api/games';
import type { Game } from '@/api/types';
import type { Campus } from '@/components/campus-toggle';

type Result = { key: string; games: Game[] | null };

export function useGames(campus: Campus) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result>({ key: '', games: null });
  const key = `${campus}:${attempt}`;

  useFocusEffect(
    useCallback(() => {
      // Ignore the answer if the campus changed or a retry started while it was on its way.
      let current = true;
      getGames(campus).then(
        (games) => current && setResult({ key, games }),
        () => current && setResult({ key, games: null }),
      );
      return () => {
        current = false;
      };
    }, [campus, key]),
  );

  const loaded = result.key === key;
  const status = !loaded ? 'loading' : result.games ? 'ready' : 'error';
  const games = loaded && result.games ? result.games : [];

  return { games, status, retry: () => setAttempt((n) => n + 1) };
}
