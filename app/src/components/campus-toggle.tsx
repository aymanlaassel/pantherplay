// Figma: Campus toggle (102:254). Picks which campus's games a screen shows.
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, space, typography } from '@/theme';

export type Campus = 'MMC' | 'BBC';

const CAMPUSES: Campus[] = ['MMC', 'BBC'];

type CampusToggleProps = {
  value: Campus;
  onChange: (campus: Campus) => void;
  style?: StyleProp<ViewStyle>;
};

export function CampusToggle({ value, onChange, style }: CampusToggleProps) {
  return (
    <View style={[styles.row, style]}>
      {CAMPUSES.map((option) => (
        <Pressable
          key={option}
          onPress={() => onChange(option)}
          accessibilityRole="button"
          accessibilityState={{ selected: value === option }}
          style={styles.option}>
          <Text style={value === option ? styles.selected : styles.label}>{option}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', padding: space[4], backgroundColor: colors.bg.surface, borderRadius: radius.pill },
  option: { paddingHorizontal: space[16], paddingVertical: space[8] },
  selected: { ...typography['Body/Strong'], color: colors.text.primary },
  label: { ...typography['Body/Medium'], color: colors.text.muted },
});
