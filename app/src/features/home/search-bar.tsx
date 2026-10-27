// Figma: Screen/Home search. A pill-shaped search box with a filter button.
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { colors, radius, space, typography } from '@/theme';

import { Icon } from '@/components/icon';

type SearchBarProps = { activeFilters: number; onFilterPress: () => void };

export function SearchBar({ activeFilters, onFilterPress }: SearchBarProps) {
  return (
    <View style={styles.bar}>
      <Icon name="search" color={colors.icon.muted} />
      <TextInput
        placeholder="Search games"
        placeholderTextColor={colors.text.muted}
        accessibilityLabel="Search games"
        style={styles.input}
      />
      <Pressable
        onPress={onFilterPress}
        accessibilityRole="button"
        accessibilityLabel={activeFilters ? `Filters, ${activeFilters} active` : 'Filters'}
        style={styles.filter}>
        <Icon name="filter" color={colors.icon.inverse} size={18} />
        {activeFilters ? <View style={styles.dot} /> : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[8],
    minHeight: 48,
    paddingLeft: space[16],
    paddingRight: space[4],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.surface,
  },
  input: { flex: 1, ...typography['Body/Regular'], color: colors.text.primary },
  dot: { position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brand.gold },
  filter: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.bg.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
