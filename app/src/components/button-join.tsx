// Figma: Button/Join (86:4). A pill with the split border and a navy label.
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { SplitBorder } from '@/components/split-border';
import { colors, space, typography } from '@/theme';

type ButtonJoinProps = {
  onPress?: () => void;
  label?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function ButtonJoin({ onPress, label = 'Join', disabled = false, style }: ButtonJoinProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [disabled ? styles.disabled : pressed && styles.pressed, style]}>
      <SplitBorder backgroundColor={colors.bg.surface} style={styles.pill}>
        <Text style={styles.label}>{label}</Text>
      </SplitBorder>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 48,
    paddingHorizontal: space[20],
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { ...typography.Button, color: colors.text.primary },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.4 },
});
