// Figma: Button/Outline (257:1279). Navy outline pill with navy label; the secondary action.
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, space, typography } from '@/theme';

type ButtonOutlineProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function ButtonOutline({ label, onPress, disabled = false, style }: ButtonOutlineProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [styles.pill, disabled ? styles.disabled : pressed && styles.pressed, style]}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 48,
    paddingHorizontal: space[20],
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border.navy,
    backgroundColor: colors.bg.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { ...typography.Button, color: colors.text.primary },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.4 },
});
