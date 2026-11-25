// Blocked players, pushed from Settings. Blocking happens from the Report sheet (W7-07), not here.
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ButtonOutline } from '@/components/button-outline';
import { Icon } from '@/components/icon';
import { InitialsAvatar } from '@/components/initials-avatar';
import { useBlockedPlayers } from '@/features/settings/use-blocked-players';
import { initials } from '@/lib/initials';
import { colors, radius, space, typography } from '@/theme';

export default function BlockedPlayersScreen() {
  const insets = useSafeAreaInsets();
  const { players, status, retry, unblock, unblocking, unblockFailed } = useBlockedPlayers();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: insets.top + space[16], paddingBottom: insets.bottom + space[20] }]}>
      <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" style={styles.back}>
        <Icon name="chevronLeft" color={colors.icon.active} size={24} />
      </Pressable>
      <Text style={styles.title}>Blocked players</Text>
      <Text style={styles.caption}>{"Blocked players can't see your games, and you won't see theirs."}</Text>
      {status === 'loading' ? <ActivityIndicator accessibilityLabel="Loading blocked players" color={colors.icon.active} style={styles.message} /> : null}
      {status === 'error' ? (
        <View style={styles.message}>
          <Text style={styles.body}>{"Couldn't load blocked players."}</Text>
          <ButtonOutline label="Try again" onPress={retry} />
        </View>
      ) : null}
      {players?.length === 0 ? <Text style={[styles.body, styles.message]}>{"You haven't blocked anyone"}</Text> : null}
      {unblockFailed ? <Text style={styles.error}>{"Couldn't unblock. Try again."}</Text> : null}
      {players?.length ? (
        <View style={styles.card}>
          {players.map((player, index) => (
            <View key={player.id} style={[styles.row, index > 0 && styles.divider]}>
              <InitialsAvatar initials={initials(player.fullName)} imageUrl={player.avatarUrl} />
              <Text style={styles.name} numberOfLines={1}>{player.fullName}</Text>
              <Pressable
                onPress={() => unblock(player.id)}
                disabled={unblocking !== null}
                accessibilityRole="button"
                accessibilityLabel={`Unblock ${player.fullName}`}
                accessibilityState={{ disabled: unblocking !== null }}
                style={styles.unblock}>
                <Text style={styles.unblockLabel}>Unblock</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  content: { paddingHorizontal: space[20], gap: space[12] },
  back: { minHeight: 44, width: 44, justifyContent: 'center' },
  title: { ...typography['Title/Game'], color: colors.text.primary },
  caption: { ...typography.Caption, color: colors.text.muted, lineHeight: 16, marginBottom: space[8] },
  message: { marginTop: space[20], alignItems: 'center', gap: space[12], textAlign: 'center' },
  body: { ...typography['Body/Regular'], color: colors.text.muted },
  error: { ...typography['Body/Strong'], color: colors.text.error },
  card: { backgroundColor: colors.bg.surface, borderWidth: 1, borderColor: colors.border.default, borderRadius: radius.card, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[12], paddingVertical: space[8], paddingHorizontal: space[16], minHeight: 56 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border.default },
  name: { ...typography['Body/Medium'], color: colors.text.primary, flex: 1 },
  unblock: { minHeight: 44, paddingHorizontal: space[12], justifyContent: 'center' },
  unblockLabel: { ...typography['Body/Strong'], color: colors.text.primary },
});
