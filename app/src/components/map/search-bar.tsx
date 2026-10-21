import Ionicons from '@expo/vector-icons/Ionicons';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { FontFamily, MinTouchTarget, Palette, Radius } from '@/constants/theme';

type SearchBarProps = {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  /** When provided, a navy filter button is shown on the right. */
  onFilterPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search games',
  onFilterPress,
  style,
}: SearchBarProps) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="search" size={24} color={Palette.muted} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Palette.muted}
        returnKeyType="search"
        clearButtonMode="while-editing"
        accessibilityLabel={placeholder}
      />
      {onFilterPress ? (
        <Pressable
          onPress={onFilterPress}
          accessibilityRole="button"
          accessibilityLabel="Filters"
          style={({ pressed }) => [styles.filter, pressed && styles.pressed]}>
          <Ionicons name="options-outline" size={22} color={Palette.white} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 56,
    paddingLeft: 18,
    paddingRight: 6,
    borderRadius: Radius.pill,
    borderWidth: 2,
    borderColor: Palette.border,
    backgroundColor: Palette.white,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: FontFamily.body,
    fontSize: 18,
    color: Palette.navy,
  },
  filter: {
    width: MinTouchTarget,
    height: MinTouchTarget,
    borderRadius: MinTouchTarget / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.navy,
  },
  pressed: {
    opacity: 0.8,
  },
});
