import { StyleSheet, Text, View } from 'react-native';

import type { Game } from '@/api/types';
import { InitialsAvatar } from '@/components/initials-avatar';
import { initials } from '@/lib/initials';
import { colors, space, typography } from '@/theme';

export function HostRow({ host, hostGamesCount }: Pick<Game, 'host' | 'hostGamesCount'>) {
  return (
    <View style={styles.row}>
      <InitialsAvatar initials={initials(host.fullName)} imageUrl={host.avatarUrl} size={48} />
      <View style={styles.text}>
        <Text style={styles.name}>{`Hosted by ${host.fullName}`}</Text>
        <Text style={styles.count}>{`Hosted ${hostGamesCount} ${hostGamesCount === 1 ? 'game' : 'games'}`}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space[12] },
  text: { flex: 1, gap: space[4] },
  name: { ...typography['Body/Strong'], color: colors.text.primary, flexShrink: 1 },
  count: { ...typography.Caption, color: colors.text.muted },
});
