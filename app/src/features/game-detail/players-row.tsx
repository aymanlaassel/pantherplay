// Figma: Players row (104:291). Overlapping initials of who joined, then how many more.
// Tapping a player opens their profile.
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Profile } from '@/api/types';
import { InitialsAvatar } from '@/components/initials-avatar';
import { initials } from '@/lib/initials';
import { colors, space, typography } from '@/theme';

type PlayersRowProps = { players: Profile[]; filled: number };

export function PlayersRow({ players, filled }: PlayersRowProps) {
  const more = filled - players.length;
  return (
    <View style={styles.row}>
      <View style={styles.avatars}>
        {players.map((player, i) => (
          <Pressable
            key={player.id}
            onPress={() => router.push(`/player/${player.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`${player.fullName}'s profile`}
            hitSlop={4}>
            <InitialsAvatar initials={initials(player.fullName)} imageUrl={player.avatarUrl} overlap={i > 0} />
          </Pressable>
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
