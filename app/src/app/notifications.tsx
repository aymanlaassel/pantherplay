// Figma: Notifications (147:855). Pushed from the bell on Home.
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getNotifications } from '@/api/notifications';
import { ButtonOutline } from '@/components/button-outline';
import { NotificationRow, type AppNotification } from '@/components/notification-row';
import { colors, fonts, space, typography } from '@/theme';

type LoadStatus = 'loading' | 'error' | 'ready';

type NotificationsViewProps = {
  notifications: AppNotification[];
  status?: LoadStatus;
  onRetry?: () => void;
};

export function NotificationsView({ notifications, status = 'ready', onRetry }: NotificationsViewProps) {
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
      {status === 'loading' ? (
        <View style={styles.empty}>
          <ActivityIndicator accessibilityLabel="Loading notifications" color={colors.icon.active} />
        </View>
      ) : status === 'error' ? (
        <View style={[styles.empty, styles.error]}>
          <Text style={styles.emptyText}>{"Couldn't load notifications."}</Text>
          {onRetry && <ButtonOutline label="Try again" onPress={onRetry} />}
        </View>
      ) : sections.length === 0 ? (
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
  const [attempt, setAttempt] = useState(0);
  const [notifications, setNotifications] = useState<AppNotification[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // Ignore the answer if the screen closed or a retry started while it was on its way.
    let current = true;
    getNotifications().then(
      (list) => current && setNotifications(list),
      () => current && setFailed(true),
    );
    return () => {
      current = false;
    };
  }, [attempt]);

  const retry = () => {
    setFailed(false);
    setNotifications(null);
    setAttempt((n) => n + 1);
  };

  const status: LoadStatus = failed ? 'error' : notifications ? 'ready' : 'loading';
  return <NotificationsView notifications={notifications ?? []} status={status} onRetry={retry} />;
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
  error: { gap: space[12] },
});
