// Mock until Supabase is wired in (W3-08).
import { MOCK_NOTIFICATIONS } from '@/mock/notifications';

export async function hasUnreadNotifications(): Promise<boolean> {
  return MOCK_NOTIFICATIONS.some((n) => n.unread);
}
