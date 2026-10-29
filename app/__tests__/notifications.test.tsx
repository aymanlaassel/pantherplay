import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { initials, NotificationLeading } from '@/components/notification-leading';
import { NOTIFICATION_LEADING, NotificationRow, type NotificationType } from '@/components/notification-row';
import NotificationsScreen, { NotificationsView } from '@/app/notifications';
import { MOCK_NOTIFICATIONS } from '@/mock/notifications';
import { colors, typography } from '@/theme';

jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

const types = Object.keys(NOTIFICATION_LEADING) as NotificationType[];
const flat = (el: { props: { style?: unknown } }) => StyleSheet.flatten(el.props.style as never);

describe('layout matches Figma 147:855', () => {
  test('title uses Title/Game in text/primary', async () => {
    await render(<NotificationsScreen />);
    expect(screen.getByText('Notifications')).toHaveStyle({ ...typography['Title/Game'], color: colors.text.primary });
  });

  test('Mark all read is gold text', async () => {
    await render(<NotificationsScreen />);
    expect(screen.getByText('Mark all read')).toHaveStyle({ color: colors.text.gold, fontSize: 13 });
  });

  test('back button goes back', async () => {
    await render(<NotificationsScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Back' }));
    expect(router.back).toHaveBeenCalled();
  });

  test('section headers use Label, muted, 0.8 letter spacing, uppercase', async () => {
    await render(<NotificationsScreen />);
    for (const label of ['New', 'Earlier']) {
      expect(screen.getByText(label)).toHaveStyle({
        ...typography.Label,
        color: colors.text.muted,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
      });
    }
  });

  test('NEW holds the unread rows and EARLIER the read ones, in that order', async () => {
    await render(<NotificationsScreen />);
    const ids = screen.getAllByTestId(/^notification-(?!leading)/).map((el) => el.props.testID);
    const unread = MOCK_NOTIFICATIONS.filter((n) => n.unread).map((n) => `notification-${n.id}`);
    const read = MOCK_NOTIFICATIONS.filter((n) => !n.unread).map((n) => `notification-${n.id}`);
    expect(ids).toEqual([...unread, ...read]);
    expect(unread.length).toBeGreaterThan(0);
    expect(read.length).toBeGreaterThan(0);
  });

  test('a section with no rows is hidden', async () => {
    await render(<NotificationsView notifications={MOCK_NOTIFICATIONS.filter((n) => !n.unread)} />);
    expect(screen.queryByText('New')).toBeNull();
    expect(screen.getByText('Earlier')).toBeTruthy();
  });

  test('row has padding 20/14, gap 12, and Body/Strong title, 13/18 muted body, Caption time', async () => {
    const n = MOCK_NOTIFICATIONS[1];
    await render(<NotificationRow notification={n} />);
    expect(screen.getByTestId(`notification-${n.id}`)).toHaveStyle({
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 20,
      paddingVertical: 14,
      backgroundColor: colors.bg.surface,
    });
    expect(screen.getByText(n.title)).toHaveStyle({ ...typography['Body/Strong'], color: colors.text.primary });
    expect(screen.getByText(n.body)).toHaveStyle({ fontSize: 13, lineHeight: 18, color: colors.text.muted });
    expect(screen.getByText(n.time)).toHaveStyle({ ...typography.Caption, color: colors.text.muted });
  });

  test('unread dot shows only on unread rows', async () => {
    await render(<NotificationsScreen />);
    for (const n of MOCK_NOTIFICATIONS) {
      const row = within(screen.getByTestId(`notification-${n.id}`));
      expect(row.queryByTestId('unread-dot') !== null).toBe(n.unread);
    }
  });

  test('Claim spot pill is gold, 32 tall, and only on the waitlist row', async () => {
    await render(<NotificationsScreen />);
    const pills = screen.getAllByRole('button', { name: 'Claim spot' });
    expect(pills).toHaveLength(MOCK_NOTIFICATIONS.filter((n) => n.type === 'waitlist-opened').length);
    expect(within(screen.getByTestId('notification-waitlist')).getByText('Claim spot')).toBeTruthy();
    expect(flat(pills[0])).toMatchObject({ backgroundColor: colors.brand.gold, height: 32, paddingHorizontal: 16 });
  });

  test('long titles and bodies render in full (they wrap, nothing is truncated)', async () => {
    await render(<NotificationsScreen />);
    const longest = [...MOCK_NOTIFICATIONS].sort((a, b) => b.body.length - a.body.length)[0];
    expect(longest.body.length).toBeGreaterThan(150);
    expect(screen.getByText(longest.body).props.numberOfLines).toBeUndefined();
  });
});

describe('every notification type renders with its icon', () => {
  test.each([
    ['game', 'notification-game.svg'],
    ['alert', 'notification-alert.svg'],
    ['success', 'notification-success.svg'],
  ] as const)('%s leading shows the Figma asset', async (kind, file) => {
    await render(<NotificationLeading kind={kind} />);
    expect(screen.getByTestId(`notification-leading-${kind}`).props.source).toEqual([
      require(`@/assets/images/icons/${file}`),
    ]);
  });

  test('avatar leading shows initials on bg/avatar (no photo needed)', async () => {
    await render(<NotificationLeading kind="avatar" name="Alex R." />);
    expect(screen.getByText('AR')).toHaveStyle({ color: colors.text.primary, fontSize: 13 });
    expect(screen.getByTestId('notification-leading-avatar')).toHaveStyle({
      width: 40,
      height: 40,
      backgroundColor: colors.bg.avatar,
    });
  });

  test('initials take the first letter of the first two words', () => {
    expect(initials('Marcus')).toBe('M');
    expect(initials('maximiliano  alejandro fernández')).toBe('MA');
    expect(initials('')).toBe('');
  });

  test('the mock covers every type', () => {
    expect(new Set(MOCK_NOTIFICATIONS.map((n) => n.type))).toEqual(new Set(types));
  });

  test.each(types)('a "%s" notification renders its mapped leading', async (type) => {
    const n = MOCK_NOTIFICATIONS.find((m) => m.type === type)!;
    await render(<NotificationRow notification={n} />);
    expect(screen.getByTestId(`notification-leading-${NOTIFICATION_LEADING[type]}`)).toBeTruthy();
  });

  test('avatar notifications in the mock name a person', () => {
    for (const n of MOCK_NOTIFICATIONS.filter((m) => NOTIFICATION_LEADING[m.type] === 'avatar')) {
      expect(n.person).toBeTruthy();
    }
  });
});

describe('empty state', () => {
  test('no notifications shows "You\'re all caught up" and no sections', async () => {
    await render(<NotificationsView notifications={[]} />);
    expect(screen.getByText("You're all caught up")).toHaveStyle({ color: colors.text.muted });
    expect(screen.queryByText('New')).toBeNull();
    expect(screen.queryByText('Earlier')).toBeNull();
  });

  test('the empty message is hidden when there are notifications', async () => {
    await render(<NotificationsScreen />);
    expect(screen.queryByText("You're all caught up")).toBeNull();
  });
});
