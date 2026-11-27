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
