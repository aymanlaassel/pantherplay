// One number with a label under it, e.g. "12 / Played" on the Profile screen.
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, space, typography } from '@/theme';

type ProfileStatProps = {
  value: number;
  label: string;
  style?: StyleProp<ViewStyle>;
};

export function ProfileStat({ value, label, style }: ProfileStatProps) {
  return (
    <View style={[styles.stat, style]} accessible accessibilityLabel={`${value} ${label}`}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stat: { flex: 1, alignItems: 'center', gap: space[4] },
  value: { ...typography['Title/Game'], color: colors.text.primary },
  label: { ...typography.Label, color: colors.text.muted },
});
