import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BadgeStatus } from '@/components/badge-status';
import { ActionBar } from '@/features/game-detail/action-bar';
import { CancellationCard } from '@/features/game-detail/cancellation-card';
import { DetailRows } from '@/features/game-detail/detail-rows';
import { HostNotes } from '@/features/game-detail/host-notes';
import { HostRow } from '@/features/game-detail/host-row';
import { getMockGame } from '@/features/game-detail/mock-games';
import { PhotoHeader } from '@/features/game-detail/photo-header';
import { PlayersRow } from '@/features/game-detail/players-row';
import { SpotsBar } from '@/features/game-detail/spots-bar';
import { colors, space, typography } from '@/theme';

// A page opened directly (web refresh) has no screen behind it, so fall back to home.
const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const game = getMockGame(id);

  if (!game) {
    return (
      <View style={[styles.missing, { paddingTop: insets.top }]}>
        <Text style={styles.title}>Game not found</Text>
        <Pressable onPress={goBack} accessibilityRole="button" accessibilityLabel="Back" style={styles.back}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + space[16] }]}>
        <PhotoHeader onBack={goBack} />
        <View style={styles.titleRow}>
          <Text style={styles.title}>{game.title}</Text>
          {game.state === 'open' ? null : <BadgeStatus status={game.state} />}
        </View>
        <HostRow host={game.host} />
        <View style={styles.divider} />
        <DetailRows game={game} />
        <View style={styles.divider} />
        <SpotsBar filled={game.filled} max={game.max} />
        <PlayersRow players={game.players} filled={game.filled} />
        <HostNotes notes={game.notes} />
        <CancellationCard rule={game.cancellation} />
      </ScrollView>
      <ActionBar state={game.state} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.surface },
  content: { paddingHorizontal: space[16], paddingBottom: space[20], gap: space[16] },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { ...typography['Title/Game'], color: colors.text.primary, flex: 1 },
  divider: { height: 1, backgroundColor: colors.border.default },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[12], backgroundColor: colors.bg.surface },
  back: { minHeight: 44, paddingHorizontal: space[16], justifyContent: 'center' },
  backText: { ...typography['Body/Strong'], color: colors.text.primary },
});
