// Figma: Screen/Home game card. Photo, title and status, host, place, level, time, price and Join.
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Game } from '@/api/types';
import { BadgeLevel } from '@/components/badge-level';
import { ButtonJoin } from '@/components/button-join';
import { SpotsBar } from '@/components/spots-bar';
import { endsAt, formatTimeRange } from '@/lib/format-time';
import { colors, radius, space, typography } from '@/theme';

import { Icon } from '@/components/icon';

function statusLabel(game: Game): string | null {
  if (game.myStatus === 'joined') return 'Joined';
  if (game.myStatus === 'waitlisted') return 'Waitlisted';
  return game.status === 'confirmed' ? 'Confirmed' : null;
}

type GameCardProps = { game: Game; onPress: () => void };

export function GameCard({ game, onPress }: GameCardProps) {
  const spotsLeft = game.maxPlayers - game.spotsFilled;
  const status = statusLabel(game);
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.card}>
      <Image
        source={require('@/assets/images/game-photo-placeholder.png')}
        accessibilityIgnoresInvertColors
        style={styles.photo}
      />
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.title}>{game.sport}</Text>
          {status ? (
            <View style={styles.status}>
              <Icon name="check" color={colors.text.success} size={14} />
              <Text style={styles.confirmed}>{status}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.host}>{`Hosted by ${game.host.fullName}`}</Text>
        <View style={styles.place}>
          <Icon name="pin" color={colors.icon.muted} size={16} />
          <Text style={styles.muted}>{game.location.name}</Text>
        </View>
        <View style={styles.row}>
          <BadgeLevel level={game.skillLevel} />
          <Text style={styles.spots}>{`${spotsLeft} ${spotsLeft === 1 ? 'spot' : 'spots'} left!`}</Text>
        </View>
        <SpotsBar filled={game.spotsFilled} max={game.maxPlayers} />
        <View style={styles.row}>
          <Text style={styles.time}>{formatTimeRange(game.startsAt, endsAt(game.startsAt, game.durationMinutes))}</Text>
          <Text style={styles.price}>Free</Text>
        </View>
        <View style={styles.divider} />
        <ButtonJoin label={game.myStatus ? 'View game' : 'Join game'} onPress={onPress} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.surface,
  },
  photo: { height: 128, width: '100%', backgroundColor: colors.bg.avatar },
  body: { padding: space[16], gap: space[8] },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[8] },
  title: { ...typography.Price, color: colors.text.primary, flex: 1 },
  status: { flexDirection: 'row', alignItems: 'center', gap: space[4] },
  confirmed: { ...typography.Label, color: colors.text.success },
  host: { ...typography['Body/Strong'], color: colors.text.primary },
  place: { flexDirection: 'row', alignItems: 'center', gap: space[4] },
  muted: { ...typography['Body/Regular'], color: colors.text.muted },
  spots: { ...typography['Body/Strong'], color: colors.text.error },
  time: { ...typography['Body/Medium'], color: colors.text.primary },
  price: { ...typography.Price, color: colors.text.primary },
  divider: { height: 1, backgroundColor: colors.border.default, marginVertical: space[4] },
});
