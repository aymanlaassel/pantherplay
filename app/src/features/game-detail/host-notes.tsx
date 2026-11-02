import { StyleSheet, Text, View } from 'react-native';

import { colors, space, typography } from '@/theme';

export function HostNotes({ notes }: { notes: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>From the host</Text>
      <Text style={styles.body}>{notes}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space[4] },
  title: { ...typography['Body/Strong'], color: colors.text.primary },
  body: { ...typography['Body/Regular'], lineHeight: 20, color: colors.text.muted },
});
