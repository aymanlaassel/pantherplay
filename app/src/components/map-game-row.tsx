// Figma: Map game row (182:2064). One game in the Map tab's bottom sheet: sport, status,
// day and time, spots and host. Tapping it opens the game.
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import type { GameWithDetails } from '@/api';
import { BadgeStatus } from '@/components/badge-status';
import { badgeFor, sportName } from '@/components/game-card';
import { SpotsBar } from '@/components/spots-bar';
import { colors, radius, space, typography } from '@/theme';

// Device timezone, device locale: "Sat 6:30 PM". The map lists several days, so keep the day.
const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' });

type MapGameRowProps = {
  game: GameWithDetails;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function MapGameRow({ game, onPress, style }: MapGameRowProps) {
  const badge = badgeFor(game);
  const sport = sportName(game.sport);
  const when = formatWhen(game.starts_at);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${sport}, ${when}`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed, style]}>
      <View style={styles.topRow}>
        <Text style={styles.sport} numberOfLines={1}>
          {sport}
        </Text>
        {badge && <BadgeStatus status={badge} />}
      </View>
      <Text style={styles.when}>{when}</Text>
      <SpotsBar filled={game.players_joined} max={game.max_players} />
      <Text style={styles.host} numberOfLines={1}>
        Hosted by {game.host.full_name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: space[12],
    gap: space[8],
  },
  pressed: { opacity: 0.7 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[8] },
  sport: { ...typography['Body/Strong'], color: colors.text.primary, flexShrink: 1 },
  when: { ...typography['Body/Regular'], color: colors.text.muted },
  host: { ...typography.Caption, color: colors.text.muted },
});
