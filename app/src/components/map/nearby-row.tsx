import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FontFamily, Palette } from '@/constants/theme';
import { SPORT_EMOJI, spotsLeft, type Game } from '@/types/game';

type NearbyRowProps = {
  game: Game;
  onPress: (id: string) => void;
};

export function NearbyRow({ game, onPress }: NearbyRowProps) {
  const left = spotsLeft(game);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${game.title} at ${game.location}, ${game.joined} of ${game.cap} joined`}
      onPress={() => onPress(game.id)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.avatar}>
        <Text style={styles.emoji}>{SPORT_EMOJI[game.sport]}</Text>
      </View>
      <View style={styles.middle}>
        <Text style={styles.title} numberOfLines={1}>
          {game.title}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons name="locate-outline" size={18} color={Palette.muted} />
          <Text style={styles.meta} numberOfLines={1}>
            {game.location} · {game.time}
          </Text>
        </View>
      </View>
      <View style={styles.right}>
        {game.status ? (
          <View style={styles.status}>
            <Text style={styles.statusText}>{game.status}</Text>
          </View>
        ) : null}
        {left > 0 ? (
          <Text style={styles.spots}>{`${left} spots left`}</Text>
        ) : (
          <Text style={[styles.spots, styles.full]}>Full</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Palette.border,
    backgroundColor: Palette.white,
  },
  pressed: {
    opacity: 0.7,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.avatarBg,
  },
  emoji: {
    fontSize: 26,
  },
  middle: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    fontSize: 18,
    fontFamily: FontFamily.bodySemiBold,
    color: Palette.navy,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  meta: {
    flexShrink: 1,
    fontSize: 15,
    fontFamily: FontFamily.body,
    color: Palette.muted,
  },
  right: {
    alignItems: 'flex-end',
    gap: 6,
    marginLeft: 10,
  },
  status: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.navy,
  },
  statusText: {
    fontSize: 14,
    fontFamily: FontFamily.bodySemiBold,
    color: Palette.white,
  },
  spots: {
    fontSize: 15,
    fontFamily: FontFamily.bodySemiBold,
    color: Palette.gold,
  },
  full: {
    color: Palette.muted,
  },
});
