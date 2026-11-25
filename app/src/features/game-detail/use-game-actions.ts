// Join, Leave and the host's Cancel for one game, with the answer to show and whether the last try failed.
import { useState } from 'react';

import { cancelGame, joinGame, leaveGame } from '@/api/games';
import type { JoinResult } from '@/api/types';

export function useGameActions(id: string, onDone: () => Promise<void>) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [answer, setAnswer] = useState<JoinResult | null>(null);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setFailed(false);
    try {
      await action();
      await onDone();
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const join = () => run(async () => setAnswer(await joinGame(id)));
  const leave = () =>
    run(async () => {
      await leaveGame(id);
      setAnswer(null);
    });

  const cancel = () => run(() => cancelGame(id));

  return { busy, failed, answer, join, leave, cancel };
}
