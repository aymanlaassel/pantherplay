// Figma: Field (240:1128). Bordered row showing a value, like "Wed, Oct 21".
// Tapping it will open a picker later; pickers are out of scope for now.
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { colors, space, typography } from '@/theme';

// Figma has no radius token for inputs yet; shared with Textarea.
export const INPUT_RADIUS = 10;

type FieldProps = {
  value?: string;
  placeholder?: string;
  icon?: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function Field({ value, placeholder, icon, onPress, style }: FieldProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.box, pressed && styles.pressed, style]}>
      {icon}
      <Text style={[styles.text, !value && styles.placeholder]} numberOfLines={1}>
        {value || placeholder}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[8],
    paddingHorizontal: space[12],
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: INPUT_RADIUS,
    backgroundColor: colors.bg.surface,
  },
  text: { ...typography['Body/Medium'], color: colors.text.primary, flexShrink: 1 },
  placeholder: { color: colors.text.muted },
  pressed: { opacity: 0.7 },
});
