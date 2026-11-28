// Loads the signed-in user's profile, games played and My Games, and tracks loading, ready or failed.
// Loads again each time the tab regains focus, so a game joined elsewhere shows up.
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { getMyGames, getMyGamesPlayed, getProfile } from '@/api/profile';
import type { Game, Profile } from '@/api/types';

type Loaded = { profile: Profile; gamesPlayed: number; myGames: Game[] };
type Result = { attempt: number; data: Loaded | null };

export function useProfile() {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result>({ attempt: -1, data: null });

  useFocusEffect(
    useCallback(() => {
      // Ignore the answer if the tab lost focus or a retry started while it was on its way.
      let current = true;
      Promise.all([getProfile(), getMyGamesPlayed(), getMyGames()]).then(
        ([profile, gamesPlayed, myGames]) => current && setResult({ attempt, data: { profile, gamesPlayed, myGames } }),
        () => current && setResult({ attempt, data: null }),
      );
      return () => {
        current = false;
      };
    }, [attempt]),
  );

  const loaded = result.attempt === attempt;
  const status = !loaded ? 'loading' : result.data ? 'ready' : 'error';

  return { data: loaded ? result.data : null, status, retry: () => setAttempt((n) => n + 1) } as const;
}
