// Figma: Date chips (86:28). A scrolling row of the next 7 days; one is selected.
import { Pressable, ScrollView, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, space, typography } from '@/theme';

/** Midnight (device time) for today and the next `count - 1` days. */
export function nextDays(count = 7, now = new Date()): Date[] {
  return Array.from({ length: count }, (_, i) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + i));
}

export function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** "Today", "Tomorrow", then "Mon 27". */
export function chipLabel(day: Date, now = new Date()) {
  const diff = Math.round(
    (day.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / 86_400_000,
  );
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return `${day.toLocaleDateString([], { weekday: 'short' })} ${day.getDate()}`;
}

type DateChipsProps = {
  days: Date[];
  selected: Date;
  onSelect: (day: Date) => void;
  style?: StyleProp<ViewStyle>;
};

export function DateChips({ days, selected, onSelect, style }: DateChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={style}
      contentContainerStyle={styles.row}>
      {days.map((day) => {
        const isSelected = isSameDay(day, selected);
        return (
          <Pressable
            key={day.toISOString()}
            onPress={() => onSelect(day)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            style={[styles.chip, isSelected && styles.chipSelected]}>
            <Text style={[styles.label, isSelected && styles.labelSelected]}>{chipLabel(day)}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: space[8] },
  chip: {
    height: 36,
    paddingHorizontal: space[16],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: { backgroundColor: colors.bg.brand, borderColor: colors.border.navy },
  label: { ...typography['Body/Strong'], color: colors.text.primary },
  labelSelected: { color: colors.text.inverse },
});
