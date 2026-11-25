// Loads another player's profile and games played, and tracks loading, ready, missing or failed.
import { useEffect, useState } from 'react';

import { getGamesPlayed, getPlayer } from '@/api/profile';
import type { Profile } from '@/api/types';
import { getUserId } from '@/lib/auth';

type Loaded = { profile: Profile; gamesPlayed: number; isMe: boolean } | null;
type Result = { key: string; data: Loaded; failed: boolean };

async function load(id: string): Promise<Loaded> {
  const [profile, gamesPlayed, me] = await Promise.all([getPlayer(id), getGamesPlayed(id), getUserId()]);
  return profile ? { profile, gamesPlayed, isMe: profile.id === me } : null;
}

export function usePlayer(id: string) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result>({ key: '', data: null, failed: false });
  const key = `${id}:${attempt}`;

  useEffect(() => {
    // Ignore the answer if the screen closed or a retry started while it was on its way.
    let current = true;
    load(id).then(
      (data) => current && setResult({ key, data, failed: false }),
      () => current && setResult({ key, data: null, failed: true }),
    );
    return () => {
      current = false;
    };
  }, [id, key]);

  const loaded = result.key === key;
  const status = !loaded ? 'loading' : result.failed ? 'error' : result.data ? 'ready' : 'missing';

  return { data: loaded ? result.data : null, status, retry: () => setAttempt((n) => n + 1) } as const;
}
