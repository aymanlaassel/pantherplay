// Figma: Players row (104:291). Overlapping initials of who joined, then how many more.
import { StyleSheet, Text, View } from 'react-native';

import { colors, space, typography } from '@/theme';

import { InitialsAvatar } from './initials-avatar';

type PlayersRowProps = { players: string[]; filled: number };

export function PlayersRow({ players, filled }: PlayersRowProps) {
  const more = filled - players.length;
  return (
    <View style={styles.row}>
      <View style={styles.avatars}>
        {players.map((initials, i) => (
          <InitialsAvatar key={`${initials}-${i}`} initials={initials} overlap={i > 0} />
        ))}
      </View>
      {more > 0 ? <Text style={styles.more}>{`+${more} more`}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space[12] },
  avatars: { flexDirection: 'row' },
  more: { ...typography['Body/Medium'], color: colors.text.muted },
});
