// Mock until W8-01 (#81) adds the blocks and reports tables; the signatures follow its contract.
// Whoever merges second swaps these bodies for Supabase calls.
import { mockBlocked, mockProfile, mockReports } from '@/mock/blocks';

import { delay } from './delay';
import type { Profile } from './types';

export type ReportTarget = 'user' | 'game' | 'message';
export type ReportReason = 'spam' | 'harassment' | 'unsafe' | 'inappropriate' | 'other';
export const REPORT_DETAILS_MAX = 500;

// The players the signed-in user has blocked.
export async function getBlockedUsers(): Promise<Profile[]> {
  await delay();
  return [...mockBlocked()];
}

// Blocking hides each other's games (the database does that once W8-01 lands).
export async function blockUser(userId: string): Promise<void> {
  await delay();
  if (!mockBlocked().some((p) => p.id === userId)) mockBlocked().push(mockProfile(userId));
}

export async function unblockUser(userId: string): Promise<void> {
  await delay();
  const blocked = mockBlocked();
  const index = blocked.findIndex((p) => p.id === userId);
  if (index !== -1) blocked.splice(index, 1);
}

// Sends a report for the team to review in the Supabase dashboard. Nobody can read reports in the app.
export async function report(targetType: ReportTarget, targetId: string, reason: ReportReason, details?: string): Promise<void> {
  await delay();
  if (details && details.length > REPORT_DETAILS_MAX) throw new Error(`Details are limited to ${REPORT_DETAILS_MAX} characters`);
  mockReports().push({ targetType, targetId, reason, details: details?.trim() || null });
}
