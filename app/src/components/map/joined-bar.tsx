import { StyleSheet, Text, View } from 'react-native';

import { FontFamily, Palette, Radius } from '@/constants/theme';

type JoinedBarProps = {
  joined: number;
  cap: number;
};

export function JoinedBar({ joined, cap }: JoinedBarProps) {
  const ratio = cap > 0 ? Math.min(Math.max(joined / cap, 0), 1) : 0;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: cap, now: joined }}
      accessibilityLabel={`${joined} of ${cap} joined`}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
      </View>
      <Text style={styles.label}>
        {joined} of {cap} joined
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: Radius.pill,
    backgroundColor: Palette.cardBg,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.pill,
    backgroundColor: Palette.navy,
  },
  label: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: FontFamily.bodyMedium,
    color: Palette.muted,
  },
});
