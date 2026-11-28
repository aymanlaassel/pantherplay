// Mock until W8-04 lands; then these read and update the Supabase notifications table.
import type { AppNotification } from '@/components/notification-row';
import { mockNotifications } from '@/mock/notifications';

import { delay } from './delay';

// The signed-in user's notifications, newest first.
export async function getNotifications(): Promise<AppNotification[]> {
  await delay();
  // A copy, so marking read later doesn't move rows on a screen that already shows them.
  return [...mockNotifications()];
}

export async function hasUnreadNotifications(): Promise<boolean> {
  return mockNotifications().some((n) => n.unread);
}

// Sets read_at on every unread row, so the bell clears.
export async function markAllRead(): Promise<void> {
  const list = mockNotifications();
  list.splice(0, list.length, ...list.map((n) => ({ ...n, unread: false })));
}

export type PushPlatform = 'ios' | 'android';
export type SavedPushToken = { token: string; platform: PushPlatform };

// Mock store for push tokens. W8-04 swaps it for an upsert into push_tokens (user_id, token, platform,
// updated_at), keyed on (user_id, token), so saving the same token again only bumps updated_at.
const mockPushTokens: SavedPushToken[] = [];

// Remembers this phone's push token for the signed-in user, so send-push (W8-18) can reach it.
export async function savePushToken(token: string, platform: PushPlatform): Promise<void> {
  await delay();
  if (!mockPushTokens.some((saved) => saved.token === token)) {
    mockPushTokens.push({ token, platform });
  }
}

// Only for tests and the mock: the tokens saved so far.
export function mockSavedPushTokens(): SavedPushToken[] {
  return [...mockPushTokens];
}
