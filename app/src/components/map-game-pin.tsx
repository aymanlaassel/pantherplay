// Figma: Map/Game pin (182:2039). Game marker on the map.
// Selected = the game highlighted in the bottom sheet.
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme';

type MapGamePinProps = {
  emoji: string;
  selected?: boolean;
};

export function MapGamePin({ emoji, selected = false }: MapGamePinProps) {
  return (
    <View style={styles.pin}>
      <View style={[styles.head, selected && styles.headSelected]}>
        <Text style={[styles.emoji, selected && styles.emojiSelected]}>{emoji}</Text>
      </View>
      <View style={[styles.tip, selected && styles.tipSelected]} />
    </View>
  );
}

const styles = StyleSheet.create({
  pin: { alignItems: 'center', gap: 2 },
  head: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.bg.surface,
    backgroundColor: colors.bg.brand,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.bg.brand,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  headSelected: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.brand.gold },
  emoji: { fontSize: 18 },
  emojiSelected: { fontSize: 22 },
  tip: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.bg.brand },
  tipSelected: { backgroundColor: colors.brand.gold },
});
