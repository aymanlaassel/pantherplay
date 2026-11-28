// Loads the players I blocked, again each time the screen regains focus, and unblocks them.
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { getBlockedUsers, unblockUser } from '@/api/safety';
import type { Profile } from '@/api/types';

type Result = { attempt: number; players: Profile[] | null };

export function useBlockedPlayers() {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result>({ attempt: -1, players: null });
  const [unblocking, setUnblocking] = useState<string | null>(null);
  const [unblockFailed, setUnblockFailed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // Ignore the answer if the screen lost focus or a retry started while it was on its way.
      let current = true;
      getBlockedUsers().then(
        (players) => current && setResult({ attempt, players }),
        () => current && setResult({ attempt, players: null }),
      );
      return () => {
        current = false;
      };
    }, [attempt]),
  );

  const unblock = async (userId: string) => {
    setUnblocking(userId);
    setUnblockFailed(false);
    try {
      await unblockUser(userId);
      setResult((r) => ({ ...r, players: r.players?.filter((p) => p.id !== userId) ?? null }));
    } catch {
      setUnblockFailed(true);
    } finally {
      setUnblocking(null);
    }
  };

  const loaded = result.attempt === attempt;
  const status = !loaded ? 'loading' : result.players ? 'ready' : 'error';

  return {
    players: loaded ? result.players : null,
    status,
    retry: () => setAttempt((n) => n + 1),
    unblock,
    unblocking,
    unblockFailed,
  } as const;
}
