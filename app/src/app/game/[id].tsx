import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BadgeStatus } from '@/components/badge-status';
import { SpotsBar } from '@/components/spots-bar';
import { ActionBar } from '@/features/game-detail/action-bar';
import { CancellationCard } from '@/features/game-detail/cancellation-card';
import { DetailMessage } from '@/features/game-detail/detail-message';
import { DetailRows } from '@/features/game-detail/detail-rows';
import { HostNotes } from '@/features/game-detail/host-notes';
import { HostRow } from '@/features/game-detail/host-row';
import { PhotoHeader } from '@/features/game-detail/photo-header';
import { PlayersRow } from '@/features/game-detail/players-row';
import { useGame } from '@/features/game-detail/use-game';
import { useGameActions } from '@/features/game-detail/use-game-actions';
import { gameState } from '@/lib/game-state';
import { initials } from '@/lib/initials';
import { colors, space, typography } from '@/theme';

const CANCELLATION_RULE = 'Leaving less than 2 hours before the start counts as a late cancel.';

// A page opened directly (web refresh) has no screen behind it, so fall back to home.
const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { game, status, retry, refresh } = useGame(id);
  const { busy, failed, answer, join, leave } = useGameActions(id, refresh);

  if (status === 'loading') return <DetailMessage onBack={goBack} />;
  if (status === 'error') return <DetailMessage message="Couldn't load this game." onBack={goBack} onRetry={retry} />;
  if (!game) return <DetailMessage message="Game not found" onBack={goBack} />;

  const state = gameState(game);
  const joined = game.players.filter((p) => p.status === 'joined');

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + space[16] }]}>
        <PhotoHeader onBack={goBack} />
        <View style={styles.titleRow}>
          <Text style={styles.title}>{game.sport.name}</Text>
          {state === 'open' ? null : <BadgeStatus status={state} />}
        </View>
        <HostRow host={game.host} hostGamesCount={game.hostGamesCount} />
        <View style={styles.divider} />
        <DetailRows game={game} />
        <View style={styles.divider} />
        <SpotsBar filled={game.spotsFilled} max={game.maxPlayers} />
        <PlayersRow players={joined.slice(0, 5).map((p) => initials(p.profile.fullName))} filled={game.spotsFilled} />
        {game.notes ? <HostNotes notes={game.notes} /> : null}
        <CancellationCard rule={CANCELLATION_RULE} />
      </ScrollView>
      <ActionBar game={game} answer={answer} busy={busy} failed={failed} onJoin={join} onLeave={leave} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.surface },
  content: { paddingHorizontal: space[16], paddingBottom: space[20], gap: space[16] },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { ...typography['Title/Game'], color: colors.text.primary, flex: 1 },
  divider: { height: 1, backgroundColor: colors.border.default },
});
