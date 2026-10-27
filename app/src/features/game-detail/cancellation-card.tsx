import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, space, typography } from '@/theme';

export function CancellationCard({ rule }: { rule: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Cancellation</Text>
      <Text style={styles.body}>{rule}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: space[4], padding: space[16], borderRadius: radius.card, backgroundColor: colors.bg.goldSoft },
  title: { ...typography.Label, color: colors.text.gold },
  body: { ...typography['Body/Regular'], lineHeight: 20, color: colors.text.primary },
});
