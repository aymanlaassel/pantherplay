import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { SplitRing } from '@/components/ui/split-ring';
import { FontFamily, Palette } from '@/constants/theme';

type JoinButtonProps = {
  onPress: () => void;
  label?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Full-width pill with the brand two-tone outline. */
export function JoinButton({ onPress, label = 'Join game', disabled, style }: JoinButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.button,
        disabled ? styles.disabled : pressed && styles.pressed,
        style,
      ]}>
      <SplitRing height={56}>
        <Text style={styles.label}>{label}</Text>
      </SplitRing>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignSelf: 'stretch' },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  label: {
    color: Palette.navy,
    fontSize: 18,
    fontFamily: FontFamily.bodySemiBold,
  },
});
