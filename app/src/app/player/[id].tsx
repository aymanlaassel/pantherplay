// Player profile: another player's photo or initials, name, home campus and games played.
// Opened from Game detail's host and players rows.
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ButtonOutline } from '@/components/button-outline';
import { Icon } from '@/components/icon';
import { InitialsAvatar } from '@/components/initials-avatar';
import { usePlayer } from '@/features/player/use-player';
import { initials } from '@/lib/initials';
import { colors, radius, space, typography } from '@/theme';

// A page opened directly (web refresh) has no screen behind it, so fall back to home.
const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

export default function PlayerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data, status, retry } = usePlayer(id);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: insets.top + space[16], paddingBottom: insets.bottom + space[20] }]}>
      <View style={styles.topBar}>
        <Pressable onPress={goBack} accessibilityRole="button" accessibilityLabel="Back" style={styles.iconButton}>
          <Icon name="chevronLeft" color={colors.icon.active} size={24} />
        </Pressable>
      </View>
      {status === 'loading' ? <ActivityIndicator accessibilityLabel="Loading player" color={colors.icon.active} style={styles.message} /> : null}
      {status === 'error' ? (
        <View style={styles.message}>
          <Text style={styles.body}>{"Couldn't load this player."}</Text>
          <ButtonOutline label="Try again" onPress={retry} />
        </View>
      ) : null}
      {status === 'missing' ? <Text style={[styles.body, styles.message]}>{"This player isn't available"}</Text> : null}
      {data ? (
        <>
          <View style={styles.identity}>
            <InitialsAvatar initials={initials(data.profile.fullName) || '?'} imageUrl={data.profile.avatarUrl} size="large" />
            <View style={styles.identityText}>
              <Text style={styles.name} numberOfLines={2}>{data.profile.fullName}</Text>
              {data.profile.campus ? (
                <View style={styles.campus}>
                  <Icon name="pin" color={colors.icon.muted} size={16} />
                  <Text style={styles.caption}>{data.profile.campus}</Text>
                </View>
              ) : null}
            </View>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{data.gamesPlayed}</Text>
            <Text style={styles.statLabel}>{data.gamesPlayed === 1 ? 'Game played' : 'Games played'}</Text>
          </View>
          {/* Actions (Add friend, W8-20) go here. */}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  content: { paddingHorizontal: space[20], gap: space[20] },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconButton: { minHeight: 44, width: 44, justifyContent: 'center' },
  message: { marginTop: space[20], alignItems: 'center', gap: space[12], textAlign: 'center' },
  body: { ...typography['Body/Regular'], color: colors.text.muted },
  identity: { flexDirection: 'row', alignItems: 'center', gap: space[16] },
  identityText: { flex: 1, gap: space[8] },
  name: { ...typography['Title/Game'], color: colors.text.primary },
  campus: { flexDirection: 'row', alignItems: 'center', gap: space[4] },
  caption: { ...typography['Body/Medium'], color: colors.text.muted },
  stat: { padding: space[16], gap: space[4], borderRadius: radius.card, backgroundColor: colors.bg.surface, borderWidth: 1, borderColor: colors.border.default },
  statValue: { ...typography.Price, color: colors.text.primary },
  statLabel: { ...typography.Label, color: colors.text.muted },
});
