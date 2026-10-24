// Figma: Chip. Selectable pill for sport, duration and skill. Selected gets the split border.
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { SplitBorder } from '@/components/split-border';
import { colors, radius, space, typography } from '@/theme';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function Chip({ label, selected = false, onPress, style }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [pressed && styles.pressed, style]}>
      {selected ? (
        <SplitBorder borderWidth={1.5} backgroundColor={colors.bg.surface} style={styles.pill}>
          <Text style={[styles.label, styles.labelSelected]}>{label}</Text>
        </SplitBorder>
      ) : (
        <View style={[styles.pill, styles.unselected]}>
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 36,
    paddingHorizontal: space[16],
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unselected: { borderWidth: 1, borderColor: colors.border.default, backgroundColor: colors.bg.surface },
  label: { ...typography['Body/Strong'], color: colors.text.muted },
  labelSelected: { color: colors.text.primary },
  pressed: { opacity: 0.7 },
});
