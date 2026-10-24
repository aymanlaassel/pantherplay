// Read functions for games. These return mock data for now and get replaced by
// Supabase calls later; keep the names, arguments and return types the same.
import { getMockGames, getMockScenario } from './mock-data';
import type { GameWithDetails } from './types';

const MOCK_DELAY_MS = 400;

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

// All games, soonest first.
export async function listGames(): Promise<GameWithDetails[]> {
  await delay(MOCK_DELAY_MS);
  if (getMockScenario() === 'empty') return [];
  return getMockGames().sort((a, b) => a.starts_at.localeCompare(b.starts_at));
}

// One game, or null if no game has this id.
export async function getGame(id: string): Promise<GameWithDetails | null> {
  await delay(MOCK_DELAY_MS);
  return getMockGames().find((g) => g.id === id) ?? null;
}
