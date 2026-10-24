// Read functions for the Social tab. Mock data for now, like games.ts; keep the names,
// arguments and return types when these become Supabase calls.
import { getMockGames, getMockScenario, mockProfiles } from './mock-data';
import type { GameWithDetails, Profile } from './types';

// Lives here, not in types.ts: there is no FRIENDS table in the ERD yet (see
// docs/social-tab-scope.md). Move it to types.ts once the table and its migration exist.
export type FriendStatus = 'friend' | 'pending';
export type Friend = Profile & { status: FriendStatus };

const MOCK_DELAY_MS = 400;

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

// Mock friendships: two accepted friends and one pending request.
const MOCK_FRIEND_STATUS: Record<string, FriendStatus> = {
  'p-ana': 'friend',
  'p-long': 'friend',
  'p-ben': 'pending',
};

function mockFriends(): Friend[] {
  return mockProfiles
    .filter((p) => p.id in MOCK_FRIEND_STATUS)
    .map((p) => ({ ...p, status: MOCK_FRIEND_STATUS[p.id] }));
}

// Your friends and pending requests, sorted by name.
export async function listFriends(): Promise<Friend[]> {
  await delay(MOCK_DELAY_MS);
  if (getMockScenario() === 'empty') return [];
  return mockFriends().sort((a, b) => a.full_name.localeCompare(b.full_name));
}

// Upcoming games hosted by accepted friends, soonest first. Cancelled and past games are left
// out. TODO: also include games friends have joined once mock GAME_PLAYERS rows exist.
export async function listFriendsGames(): Promise<GameWithDetails[]> {
  await delay(MOCK_DELAY_MS);
  if (getMockScenario() === 'empty') return [];
  const now = new Date();
  const friendIds = new Set(mockFriends().filter((f) => f.status === 'friend').map((f) => f.id));
  return getMockGames(now)
    .filter((g) => friendIds.has(g.host_id) && g.status !== 'cancelled' && g.starts_at >= now.toISOString())
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
}
