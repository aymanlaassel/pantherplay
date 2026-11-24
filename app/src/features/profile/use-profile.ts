// Loads the signed-in user's profile and their next joined game, and tracks loading, ready or failed.
// Loads again each time the tab regains focus, so a game joined elsewhere shows up.
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { getGames } from '@/api/games';
import { getProfile } from '@/api/profile';
import type { Game, Profile } from '@/api/types';
import { endsAt } from '@/lib/format-time';

type Loaded = { profile: Profile; nextGame: Game | null };
type Result = { attempt: number; data: Loaded | null };

// The earliest game I've joined, on either campus, that hasn't ended yet.
async function getNextGame(): Promise<Game | null> {
  const [mmc, bbc] = await Promise.all([getGames('MMC'), getGames('BBC')]);
  const now = Date.now();
  const upcoming = [...mmc, ...bbc]
    .filter((g) => g.myStatus === 'joined' && new Date(endsAt(g.startsAt, g.durationMinutes)).getTime() > now)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  return upcoming[0] ?? null;
}

export function useProfile() {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result>({ attempt: -1, data: null });

  useFocusEffect(
    useCallback(() => {
      // Ignore the answer if the tab lost focus or a retry started while it was on its way.
      let current = true;
      Promise.all([getProfile(), getNextGame()]).then(
        ([profile, nextGame]) => current && setResult({ attempt, data: { profile, nextGame } }),
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
