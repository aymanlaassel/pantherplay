import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Palette, SoftShadow } from '@/constants/theme';

type LocateButtonProps = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function LocateButton({ onPress, style }: LocateButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Center map on my location"
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}>
      <Ionicons name="locate" size={22} color={Palette.myLocation} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SoftShadow,
  },
  pressed: {
    opacity: 0.7,
  },
});
