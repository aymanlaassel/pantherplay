// Loads Home's games and tracks whether they're loading, ready or failed.
import { useEffect, useState } from 'react';

import { listMockGames, type HomeGame } from './mock-games';

type Status = 'loading' | 'ready' | 'error';

export function useGames() {
  const [games, setGames] = useState<HomeGame[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // Ignore the answer if the screen closed or a retry started while it was on its way.
    let current = true;
    listMockGames().then(
      (loaded) => {
        if (!current) return;
        setGames(loaded);
        setStatus('ready');
      },
      () => {
        if (current) setStatus('error');
      },
    );
    return () => {
      current = false;
    };
  }, [attempt]);

  const retry = () => {
    setStatus('loading');
    setAttempt((n) => n + 1);
  };

  return { games, status, retry };
}
