// Whether the bell should show its unread dot.
import { useEffect, useState } from 'react';

import { hasUnreadNotifications } from '@/api/notifications';

export function useHasUnread() {
  const [unread, setUnread] = useState(false);

  useEffect(() => {
    let current = true;
    hasUnreadNotifications().then(
      (value) => current && setUnread(value),
      () => undefined,
    );
    return () => {
      current = false;
    };
  }, []);

  return unread;
}
