import { useCallback, useMemo, useState } from 'react';

import { MOCK_GAMES } from '@/mocks/games';
import type { Campus, Game, SportFilter } from '@/types/game';

/**
 * Holds the Map tab's state: campus, sport filter and selected game.
 * If the selected game is filtered out, the first remaining game is selected.
 */
export function useMapGames(allGames: Game[] = MOCK_GAMES) {
  const [campus, setCampus] = useState<Campus>('MMC');
  const [sport, setSport] = useState<SportFilter>('All');
  const [selectedGameId, setSelectedGameId] = useState<string | null>(allGames[0]?.id ?? null);

  const games = useMemo(
    () => allGames.filter((g) => g.campus === campus && (sport === 'All' || g.sport === sport)),
    [allGames, campus, sport],
  );

  const selectedGame = useMemo(() => {
    const found = games.find((g) => g.id === selectedGameId);
    return found ?? games[0] ?? null;
  }, [games, selectedGameId]);

  const nearbyGames = useMemo(
    () => games.filter((g) => g.id !== selectedGame?.id).slice(0, 2),
    [games, selectedGame],
  );

  const selectGame = useCallback((id: string) => setSelectedGameId(id), []);

  return { campus, setCampus, sport, setSport, games, selectedGame, nearbyGames, selectGame };
}
