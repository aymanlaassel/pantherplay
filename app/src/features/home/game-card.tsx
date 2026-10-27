// Figma: Screen/Home game card. Photo, title and status, host, place, level, time, price and Join.
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { BadgeLevel } from '@/components/badge-level';
import { ButtonJoin } from '@/components/button-join';
import { colors, radius, space, typography } from '@/theme';

import { Icon } from './icon';
import type { HomeGame } from './mock-games';

type GameCardProps = { game: HomeGame; onPress: () => void };

export function GameCard({ game, onPress }: GameCardProps) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.card}>
      <Image
        source={require('@/assets/images/game-photo-placeholder.png')}
        accessibilityIgnoresInvertColors
        style={styles.photo}
      />
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.title}>{game.title}</Text>
          <View style={styles.status}>
            <Icon name="check" color={colors.text.success} size={14} />
            <Text style={styles.confirmed}>Confirmed</Text>
          </View>
        </View>
        <Text style={styles.host}>{`Hosted by ${game.host}`}</Text>
        <View style={styles.place}>
          <Icon name="pin" color={colors.icon.muted} size={16} />
          <Text style={styles.muted}>{game.location}</Text>
        </View>
        <View style={styles.row}>
          <BadgeLevel level={game.level} />
          <Text style={styles.spots}>{`${game.spotsLeft} ${game.spotsLeft === 1 ? 'spot' : 'spots'} left!`}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.time}>{game.time}</Text>
          <Text style={styles.price}>{game.price}</Text>
        </View>
        <View style={styles.divider} />
        <ButtonJoin label="Join game" />
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
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { ...typography.Price, color: colors.text.primary },
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
