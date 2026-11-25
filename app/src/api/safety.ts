// Mock until W7-01 (#81) adds the blocks table; the signatures follow its contract.
// Whoever merges second swaps these bodies for Supabase calls.
import { mockBlocked } from '@/mock/blocks';

import { delay } from './delay';
import type { Profile } from './types';

// The players the signed-in user has blocked.
export async function getBlockedUsers(): Promise<Profile[]> {
  await delay();
  return [...mockBlocked()];
}

export async function unblockUser(userId: string): Promise<void> {
  await delay();
  const blocked = mockBlocked();
  const index = blocked.findIndex((p) => p.id === userId);
  if (index !== -1) blocked.splice(index, 1);
}
