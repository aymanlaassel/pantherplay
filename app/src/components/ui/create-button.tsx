import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { SplitRing } from '@/components/ui/split-ring';
import { Palette, SoftShadow } from '@/constants/theme';

type CreateButtonProps = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

/** 64px circle with the brand two-tone outline and a "+" icon. */
export function CreateButton({ onPress, style }: CreateButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Create a game"
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}>
      <SplitRing width={64} height={64}>
        <Ionicons name="add" size={34} color={Palette.navy} />
      </SplitRing>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { width: 64, height: 64, borderRadius: 32, ...SoftShadow },
  pressed: { opacity: 0.85 },
});
