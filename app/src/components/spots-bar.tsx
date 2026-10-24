// Figma: Spots bar (104:287). How full a game is: a track with a fill and "7 of 10 spots".
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, space, typography } from '@/theme';

type SpotsBarProps = {
  filled: number;
  max: number;
  style?: StyleProp<ViewStyle>;
};

export function SpotsBar({ filled, max, style }: SpotsBarProps) {
  // Clamp so bad data never draws past the track or below zero.
  const ratio = max > 0 ? Math.min(Math.max(filled / max, 0), 1) : 0;
  const almostFull = ratio < 1 && max - filled <= 2;
  return (
    <View style={[styles.row, style]}>
      <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max, now: filled }}>
        <View
          testID="spots-bar-fill"
          style={[styles.fill, { width: `${ratio * 100}%` }, almostFull && styles.fillWarn]}
        />
      </View>
      <Text style={styles.label}>
        {filled} of {max} spots
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space[8] },
  track: {
    flex: 1,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.bg.neutral,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.bg.brand },
  fillWarn: { backgroundColor: colors.brand.gold },
  label: { ...typography.Caption, color: colors.text.muted },
});
