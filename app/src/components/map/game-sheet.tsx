import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { NearbyRow } from '@/components/map/nearby-row';
import { DetailRow } from '@/components/ui/detail-row';
import { JoinButton } from '@/components/ui/join-button';
import { PlayersRow } from '@/components/ui/players-row';
import { RoundIconButton } from '@/components/ui/round-icon-button';
import { SpotsBar } from '@/components/ui/spots-bar';
import { FontFamily, Palette, Radius, SoftShadow } from '@/constants/theme';
import { SPORT_EMOJI, type Game } from '@/types/game';

type GameSheetProps = {
  game: Game | null;
  nearby: Game[];
  onSelectGame: (id: string) => void;
  onJoin: (id: string) => void;
  onDirections: (game: Game) => void;
  onShare: (game: Game) => void;
  /** Space the tab bar occupies, so content can scroll above it. */
  bottomInset: number;
};

/** Collapsed snap point as a fraction of the screen. map.tsx uses it to place the locate button. */
export const SHEET_COLLAPSED_RATIO = 0.4;

export function GameSheet({ game, nearby, onSelectGame, onJoin, onDirections, onShare, bottomInset }: GameSheetProps) {
  const snapPoints = useMemo(() => [`${SHEET_COLLAPSED_RATIO * 100}%`, '85%'], []);

  return (
    <BottomSheet
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose={false}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.background}>
      <BottomSheetScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 24 }]}
        showsVerticalScrollIndicator={false}>
        {game ? (
          <GameDetails game={game} onJoin={onJoin} onDirections={onDirections} onShare={onShare} />
        ) : (
          <Text style={styles.empty}>No games for this filter</Text>
        )}
        {nearby.length > 0 && (
          <>
            <Text style={styles.nearbyHeader} accessibilityRole="header">
              Also nearby
            </Text>
            <View style={styles.nearbyList}>
              {nearby.map((g) => (
                <NearbyRow key={g.id} game={g} onPress={onSelectGame} />
              ))}
            </View>
          </>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

type GameDetailsProps = Pick<GameSheetProps, 'onJoin' | 'onDirections' | 'onShare'> & { game: Game };

function GameDetails({ game, onJoin, onDirections, onShare }: GameDetailsProps) {
  return (
    <>
      <View style={styles.titleRow}>
        <View style={styles.sportBadge}>
          <Text style={styles.sportEmoji}>{SPORT_EMOJI[game.sport]}</Text>
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={2}>
            {game.title}
          </Text>
          <Text style={styles.subtitle}>{game.sport} · {game.campus}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <DetailRow icon="calendar-outline" text={game.time} />
        <DetailRow icon="location-outline" text={game.location} />
        <DetailRow icon="bar-chart-outline" text={game.skill} />
      </View>

      <View style={styles.section}>
        <SpotsBar joined={game.joined} cap={game.cap} />
      </View>

      <View style={styles.section}>
        <PlayersRow players={game.players} />
      </View>

      <View style={styles.divider} />

      <View style={styles.actions}>
        <JoinButton onPress={() => onJoin(game.id)} style={styles.join} />
        <RoundIconButton icon="navigate-outline" accessibilityLabel="Get directions" onPress={() => onDirections(game)} />
        <RoundIconButton icon="share-outline" accessibilityLabel="Share game" onPress={() => onShare(game)} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  handle: { backgroundColor: Palette.border, width: 44 },
  background: {
    backgroundColor: Palette.white,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    ...SoftShadow,
    shadowOffset: { width: 0, height: -4 },
  },
  content: { paddingHorizontal: 20, paddingTop: 4 },
  empty: { fontSize: 16, fontFamily: FontFamily.body, color: Palette.muted },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  sportBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Palette.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sportEmoji: { fontSize: 26 },
  titleBlock: { flex: 1 },
  title: { fontSize: 28, lineHeight: 30, fontFamily: FontFamily.heading, color: Palette.navy },
  subtitle: { marginTop: 2, fontSize: 15, fontFamily: FontFamily.body, color: Palette.muted },
  details: { marginTop: 18, gap: 12 },
  section: { marginTop: 20 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Palette.border, marginTop: 22 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18 },
  join: { flex: 1 },
  nearbyHeader: {
    marginTop: 28,
    marginBottom: 12,
    fontSize: 18,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Palette.muted,
  },
  nearbyList: { gap: 10 },
});
