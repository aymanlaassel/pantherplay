import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Palette, SoftShadow } from '@/constants/theme';

type RoundIconButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

/** White floating circle with a navy icon. Used for back and share. */
export function RoundIconButton({
  icon,
  onPress,
  accessibilityLabel,
  size = 56,
  style,
}: RoundIconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
      style={({ pressed }) => [
        styles.button,
        { width: size, height: size, borderRadius: size / 2 },
        pressed && styles.pressed,
        style,
      ]}>
      <Ionicons name={icon} size={24} color={Palette.navy} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SoftShadow,
  },
  pressed: { opacity: 0.7 },
});
