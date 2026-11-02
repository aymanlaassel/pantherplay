// Figma: Spots bar (104:287). One segment per spot; a plain bar when the max is too large to draw.
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, space, typography } from '@/theme';

export const MAX_SEGMENTS = 20;

type SpotsBarProps = { filled: number; max: number };

export function SpotsBar({ filled, max }: SpotsBarProps) {
  // One segment per spot, or just filled and empty halves when the max is too large to draw.
  const parts =
    max <= MAX_SEGMENTS
      ? Array.from({ length: max }, (_, i) => ({ key: `spot-${i}`, on: i < filled, flex: 1 }))
      : [
          { key: 'filled', on: true, flex: filled },
          { key: 'empty', on: false, flex: max - filled },
        ];

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{`${filled} of ${max} spots filled`}</Text>
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max, now: filled }}
        style={styles.bar}>
        {parts.map(({ key, on, flex }) => (
          <View key={key} style={[styles.segment, on && styles.filled, { flex }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space[8] },
  label: { ...typography['Body/Medium'], color: colors.text.primary },
  bar: { flexDirection: 'row', gap: space[4], height: 8 },
  segment: { borderRadius: radius.pill, backgroundColor: colors.bg.neutral },
  filled: { backgroundColor: colors.brand.gold },
});
