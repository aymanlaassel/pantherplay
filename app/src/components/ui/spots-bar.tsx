import { StyleSheet, Text, View } from 'react-native';

import { FontFamily, Palette } from '@/constants/theme';

type SpotsBarProps = {
  joined: number;
  cap: number;
};

const MAX_SEGMENTS = 20;

/** "N of M spots filled" label over a row of skewed segments. */
export function SpotsBar({ joined, cap }: SpotsBarProps) {
  const safeCap = Math.max(cap, 0);
  const safeJoined = Math.min(Math.max(joined, 0), safeCap);
  const segments = Math.min(safeCap, MAX_SEGMENTS);
  const filled =
    safeCap > MAX_SEGMENTS ? Math.round((safeJoined / safeCap) * MAX_SEGMENTS) : safeJoined;
  const label = `${joined} of ${cap} spots filled`;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: cap, now: joined }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.track}>
        {Array.from({ length: segments }, (_, i) => (
          <View key={i} style={[styles.segment, i < filled && styles.filled]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: Palette.navy,
    fontSize: 20,
    fontFamily: FontFamily.bodyMedium,
  },
  track: { flexDirection: 'row', gap: 6, marginTop: 12, paddingHorizontal: 3 },
  segment: {
    flex: 1,
    height: 14,
    backgroundColor: Palette.border,
    transform: [{ skewX: '-20deg' }],
  },
  filled: { backgroundColor: Palette.gold },
});
