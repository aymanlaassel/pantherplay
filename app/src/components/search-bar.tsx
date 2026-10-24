// Figma: Search bar (87:3). Looks and types like search; filtering is out of scope for W2-05.
import { SymbolView } from 'expo-symbols';
import { StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, space, typography } from '@/theme';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
};

export function SearchBar({ value, onChangeText, placeholder = 'Search games', style }: SearchBarProps) {
  return (
    <View style={[styles.field, style]}>
      <SymbolView
        name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
        size={18}
        tintColor={colors.icon.inactive}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.muted}
        accessibilityLabel={placeholder}
        returnKeyType="search"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[8],
    height: 44,
    paddingHorizontal: space[16],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.surface,
  },
  input: { ...typography['Body/Regular'], flex: 1, color: colors.text.primary, lineHeight: undefined },
});
