// Figma: Notification row (146:772). One update in the Notifications list.
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { NotificationLeading, type NotificationLeadingKind } from '@/components/notification-leading';
import { colors, fonts, radius, space, typography } from '@/theme';

// Only events that change whether, when or where you show up.
export type NotificationType =
  | 'game-cancelled'
  | 'game-changed'
  | 'waitlist-opened'
  | 'player-joined'
  | 'player-left-late'
  | 'starting-soon'
  | 'game-confirmed'
  | 'friend-playing'
  | 'rate-host';

export const NOTIFICATION_LEADING: Record<NotificationType, NotificationLeadingKind> = {
  'game-cancelled': 'alert',
  'game-changed': 'alert',
  'waitlist-opened': 'success',
  'player-joined': 'avatar',
  'player-left-late': 'avatar',
  'starting-soon': 'game',
  'game-confirmed': 'success',
  'friend-playing': 'avatar',
  'rate-host': 'game',
};

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  // Pre-formatted ("12m", "1d") until real timestamps arrive.
  time: string;
  unread: boolean;
  // The person it is about, for the avatar leading.
  person?: string;
};

export function NotificationRow({ notification: n }: { notification: AppNotification }) {
  return (
    <View testID={`notification-${n.id}`} style={styles.row}>
      <NotificationLeading kind={NOTIFICATION_LEADING[n.type]} name={n.person} />
      <View style={styles.text}>
        <Text style={styles.title}>{n.title}</Text>
        <Text style={styles.body}>{n.body}</Text>
        {n.type === 'waitlist-opened' && (
          // Claiming is a later ticket; the pill is layout only for now.
          <Pressable accessibilityRole="button" accessibilityLabel="Claim spot" style={styles.pill}>
            <Text style={styles.pillLabel}>Claim spot</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.meta}>
        <Text style={styles.time}>{n.time}</Text>
        {n.unread && (
          <Image testID="unread-dot" source={require('@/assets/images/icons/unread-dot.svg')} style={styles.dot} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[12],
    paddingHorizontal: space[20],
    paddingVertical: 14,
    backgroundColor: colors.bg.surface,
  },
  text: { flex: 1, gap: 3 },
  title: { ...typography['Body/Strong'], color: colors.text.primary },
  body: { fontFamily: fonts.interRegular, fontSize: 13, lineHeight: 18, color: colors.text.muted },
  pill: {
    alignSelf: 'flex-start',
    height: 32,
    paddingHorizontal: space[16],
    borderRadius: radius.pill,
    backgroundColor: colors.brand.gold,
    justifyContent: 'center',
  },
  pillLabel: { fontFamily: fonts.interSemiBold, fontSize: 13, color: colors.text.primary },
  meta: { flexShrink: 0, alignItems: 'flex-end', gap: 6 },
  time: { ...typography.Caption, color: colors.text.muted },
  dot: { width: 8, height: 8 },
});
