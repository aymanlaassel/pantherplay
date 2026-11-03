// Figma: Notifications (147:855). Pushed from the bell on Home.
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NotificationRow, type AppNotification } from '@/components/notification-row';
import { MOCK_NOTIFICATIONS } from '@/mock/notifications';
import { colors, fonts, space, typography } from '@/theme';

export function NotificationsView({ notifications }: { notifications: AppNotification[] }) {
  const insets = useSafeAreaInsets();
  const sections = [
    { label: 'New', rows: notifications.filter((n) => n.unread) },
    { label: 'Earlier', rows: notifications.filter((n) => !n.unread) },
  ].filter((s) => s.rows.length > 0);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + space[8] }]}>
        <View style={styles.nav}>
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back">
            <Image source={require('@/assets/images/icons/chevron-left.svg')} style={styles.chevron} />
          </Pressable>
          {/* Marking as read is a later ticket; the action is layout only for now. */}
          <Pressable accessibilityRole="button" accessibilityLabel="Mark all read">
            <Text style={styles.markAll}>Mark all read</Text>
          </Pressable>
        </View>
        <Text style={styles.title}>Notifications</Text>
      </View>
      {sections.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>You&apos;re all caught up</Text>
        </View>
      ) : (
        <ScrollView>
          {sections.map((s) => (
            <View key={s.label}>
              <Text style={styles.section}>{s.label}</Text>
              {s.rows.map((n) => (
                <NotificationRow key={n.id} notification={n} />
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

export default function NotificationsScreen() {
  return <NotificationsView notifications={MOCK_NOTIFICATIONS} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.surface },
  header: { paddingHorizontal: space[20], paddingBottom: space[8], gap: space[8] },
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chevron: { width: 24, height: 24 },
  markAll: { fontFamily: fonts.interSemiBold, fontSize: 13, color: colors.text.gold },
  title: { ...typography['Title/Game'], color: colors.text.primary },
  section: {
    ...typography.Label,
    color: colors.text.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingTop: space[16],
    paddingBottom: space[4],
    paddingHorizontal: space[20],
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { ...typography['Body/Medium'], color: colors.text.muted },
});
