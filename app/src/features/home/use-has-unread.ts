// Whether the bell should show its unread dot.
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { hasUnreadNotifications } from '@/api/notifications';

export function useHasUnread() {
  const [unread, setUnread] = useState(false);

  // Re-check on every focus, so the dot clears after a visit to Notifications.
  useFocusEffect(
    useCallback(() => {
      let current = true;
      hasUnreadNotifications().then(
        (value) => current && setUnread(value),
        () => undefined,
      );
      return () => {
        current = false;
      };
    }, []),
  );

  return unread;
}
