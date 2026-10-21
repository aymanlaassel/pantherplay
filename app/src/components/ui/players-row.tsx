import { StyleSheet, Text, View } from 'react-native';

import { FontFamily, Palette } from '@/constants/theme';

type PlayersRowProps = {
  /** Player initials, in join order. */
  players: string[];
  max?: number;
};

/** Overlapping initials avatars with a "+N more" overflow label. */
export function PlayersRow({ players, max = 5 }: PlayersRowProps) {
  if (players.length === 0) {
    return <Text style={styles.empty}>Be the first to join</Text>;
  }

  const shown = players.slice(0, max);
  const remaining = players.length - shown.length;
  const label = `${players.length} ${players.length === 1 ? 'player' : 'players'} joined: ${players.join(', ')}`;

  return (
    <View style={styles.row} accessible accessibilityLabel={label}>
      {shown.map((initials, i) => (
        <View key={`${initials}-${i}`} style={[styles.avatar, i > 0 && styles.overlap]}>
          <Text style={styles.initials}>{initials.slice(0, 2).toUpperCase()}</Text>
        </View>
      ))}
      {remaining > 0 && <Text style={styles.more}>+{remaining} more</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Palette.avatarBg,
    borderWidth: 2,
    borderColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlap: { marginLeft: -14 },
  initials: {
    color: Palette.navy,
    fontSize: 20,
    fontFamily: FontFamily.bodySemiBold,
  },
  more: {
    marginLeft: 16,
    color: Palette.muted,
    fontSize: 20,
    fontFamily: FontFamily.body,
  },
  empty: {
    color: Palette.muted,
    fontSize: 16,
    fontFamily: FontFamily.body,
  },
});
