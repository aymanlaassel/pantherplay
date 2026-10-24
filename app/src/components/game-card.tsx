// Figma: Game card (89:24). One game on the Discover board; tapping it opens the game.
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import type { GameWithDetails } from '@/api';
import { BadgeLevel } from '@/components/badge-level';
import { BadgeStatus, type GameBadgeStatus } from '@/components/badge-status';
import { SpotsBar } from '@/components/spots-bar';
import { colors, radius, space, typography } from '@/theme';

const SOON_MS = 60 * 60 * 1000;

/** Which badge a card shows, if any. Cancelled and full win over timing. */
export function badgeFor(game: GameWithDetails, now = new Date()): GameBadgeStatus | null {
  if (game.status === 'cancelled') return 'cancelled';
  if (game.status === 'full') return 'full';
  const untilStart = new Date(game.starts_at).getTime() - now.getTime();
  if (untilStart >= 0 && untilStart <= SOON_MS) return 'starting-soon';
  if (game.max_players - game.players_joined <= 2) return 'almost-full';
  return null;
}

// Sport codes are lowercase ('soccer'); the card shows 'Soccer'.
// TODO: use SPORTS.name once the API returns it.
export const sportName = (code: string) => code.charAt(0).toUpperCase() + code.slice(1);

// Device timezone, device locale: "6:30 PM".
const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

type GameCardProps = {
  game: GameWithDetails;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function GameCard({ game, onPress, style }: GameCardProps) {
  const badge = badgeFor(game);
  const sport = sportName(game.sport);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${sport}, ${formatTime(game.starts_at)} at ${game.location.name}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}>
      <View style={styles.topRow}>
        <Text style={styles.title} numberOfLines={1}>
          {sport}
        </Text>
        {badge && <BadgeStatus status={badge} />}
      </View>
      <Text style={styles.meta} numberOfLines={1}>
        {formatTime(game.starts_at)} · {game.duration_minutes} min · {game.location.name}
      </Text>
      {game.notes && (
        <Text style={styles.notes} numberOfLines={2}>
          {game.notes}
        </Text>
      )}

      <BadgeLevel level={game.skill_level} />
      <SpotsBar filled={game.players_joined} max={game.max_players} />

      <View style={styles.hostRow}>
        {game.host.avatar_url ? (
          <Image source={game.host.avatar_url} style={styles.avatar} accessibilityIgnoresInvertColors />
        ) : (
          <View style={styles.avatar} testID="avatar-fallback">
            <Text style={styles.initials}>{initials(game.host.full_name)}</Text>
          </View>
        )}
        <Text style={styles.host} numberOfLines={1}>
          Hosted by {game.host.full_name}
        </Text>
      </View>
    </Pressable>
  );
}

const AVATAR = 28;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: space[16],
    gap: space[8],
  },
  pressed: { opacity: 0.7 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[8] },
  title: { ...typography['Title/Game'], color: colors.text.primary, flexShrink: 1 },
  meta: { ...typography['Body/Regular'], color: colors.text.muted },
  notes: { ...typography['Body/Regular'], color: colors.text.primary },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: space[8] },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: radius.pill,
    backgroundColor: colors.bg.avatar,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { ...typography.Caption, color: colors.text.primary },
  host: { ...typography.Caption, color: colors.text.muted, flexShrink: 1 },
});
