import { StyleSheet, Text, View } from 'react-native';

import { colors, space, typography } from '@/theme';

import { InitialsAvatar } from './initials-avatar';
import type { GameDetail } from './mock-games';

export function HostRow({ host }: Pick<GameDetail, 'host'>) {
  return (
    <View style={styles.row}>
      <InitialsAvatar initials={host.initials} size={48} />
      <View style={styles.text}>
        <Text style={styles.name}>{`Hosted by ${host.name}`}</Text>
        <Text style={styles.note}>{host.note}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space[12] },
  text: { gap: space[4] },
  name: { ...typography['Body/Strong'], color: colors.text.primary },
  note: { ...typography.Caption, color: colors.text.muted },
});
