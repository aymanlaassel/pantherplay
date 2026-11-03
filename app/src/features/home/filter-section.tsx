import { StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/chip';
import { colors, space, typography } from '@/theme';

type FilterSectionProps<T extends string> = {
  title: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T | null) => void;
};

// "Any" clears the filter, so every section can always go back to no preference.
export function FilterSection<T extends string>({ title, options, value, onChange }: FilterSectionProps<T>) {
  return (
    <View style={styles.group}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chips}>
        <Chip label="Any" selected={value === null} onPress={() => onChange(null)} />
        {options.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={value === option.value}
            onPress={() => onChange(option.value)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: space[8] },
  title: { ...typography.Label, color: colors.text.primary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[8] },
});
