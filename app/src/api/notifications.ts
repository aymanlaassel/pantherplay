// Mock until Supabase is wired in (W3-08).
import type { AppNotification } from '@/components/notification-row';
import { MOCK_NOTIFICATIONS } from '@/mock/notifications';

import { delay } from './delay';

// The signed-in user's notifications, newest first.
export async function getNotifications(): Promise<AppNotification[]> {
  await delay();
  return MOCK_NOTIFICATIONS;
}

export async function hasUnreadNotifications(): Promise<boolean> {
  return MOCK_NOTIFICATIONS.some((n) => n.unread);
}
