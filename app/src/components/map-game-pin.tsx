// Figma: Map pin (182:2039). A round badge with how many games are at one location.
// Drawn inside a react-native-maps <Marker>, so it stays a plain view with no touch handling.
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, space, typography } from '@/theme';

type MapGamePinProps = {
  count: number;
  selected?: boolean;
};

export function MapGamePin({ count, selected = false }: MapGamePinProps) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.bubble, selected && styles.bubbleSelected]}>
        <Text style={[styles.count, selected && styles.countSelected]}>{count > 99 ? '99+' : count}</Text>
      </View>
      <View style={[styles.tip, selected && styles.tipSelected]} />
    </View>
  );
}

const SIZE = 36;
const TIP = 6;

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  bubble: {
    minWidth: SIZE,
    height: SIZE,
    paddingHorizontal: space[8],
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.bg.surface,
    backgroundColor: colors.bg.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleSelected: { backgroundColor: colors.brand.gold },
  count: { ...typography['Body/Strong'], color: colors.text.inverse },
  countSelected: { color: colors.text.primary },
  // A small down-pointing triangle made from borders, so the pin points at its spot.
  tip: {
    width: 0,
    height: 0,
    marginTop: -1,
    borderLeftWidth: TIP,
    borderRightWidth: TIP,
    borderTopWidth: TIP,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.bg.brand,
  },
  tipSelected: { borderTopColor: colors.brand.gold },
});
