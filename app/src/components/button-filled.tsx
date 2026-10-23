// Figma: Button/Filled (257:1277). Solid navy pill with white label; the primary action.
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, space, typography } from '@/theme';

type ButtonFilledProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function ButtonFilled({ label, onPress, disabled = false, style }: ButtonFilledProps) {
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
    backgroundColor: colors.bg.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { ...typography.Button, color: colors.text.inverse },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.4 },
});
