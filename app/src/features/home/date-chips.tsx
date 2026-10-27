// Figma: Screen/Home day filter. A row of days; the selected one gets the split border.
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { Chip } from '@/components/chip';
import { SplitBorder } from '@/components/split-border';
import { colors, space, typography } from '@/theme';

const DAYS = 7;

function dayLabel(offset: number): string {
  if (offset === 0) return 'Today';
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.toLocaleDateString(undefined, { weekday: 'short' })} ${date.getDate()}`;
}

export function DateChips() {
  const [selected, setSelected] = useState(0);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {Array.from({ length: DAYS }, (_, offset) =>
        offset === selected ? (
          <Pressable key={offset} accessibilityRole="button" accessibilityState={{ selected: true }}>
            <SplitBorder backgroundColor={colors.bg.surface} style={styles.selected}>
              <Text style={styles.label}>{dayLabel(offset)}</Text>
            </SplitBorder>
          </Pressable>
        ) : (
          <Chip key={offset} label={dayLabel(offset)} selected={false} onPress={() => setSelected(offset)} />
        ),
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: space[8] },
  selected: { minHeight: 44, paddingHorizontal: space[16], alignItems: 'center', justifyContent: 'center' },
  label: { ...typography['Body/Strong'], color: colors.text.primary },
});
