import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { FontFamily, MinTouchTarget, Palette, Radius } from '@/constants/theme';
import type { Campus } from '@/types/game';

type CampusToggleProps = {
  value: Campus;
  onChange: (c: Campus) => void;
  style?: StyleProp<ViewStyle>;
};

const CAMPUSES: Campus[] = ['MMC', 'BBC'];

/** Navy pill with two segments; the selected one is a white inset pill. */
export function CampusToggle({ value, onChange, style }: CampusToggleProps) {
  return (
    <View style={[styles.container, style]}>
      {CAMPUSES.map((campus) => {
        const selected = campus === value;
        return (
          <Pressable
            key={campus}
            onPress={() => onChange(campus)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[styles.segment, selected && styles.segmentSelected]}>
            <Text style={[styles.label, selected && styles.labelSelected]}>{campus}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: Palette.navy,
    borderRadius: Radius.pill,
    padding: 3,
  },
  segment: {
    width: 84,
    minHeight: MinTouchTarget,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSelected: { backgroundColor: Palette.white },
  label: {
    color: Palette.white,
    fontSize: 16,
    fontFamily: FontFamily.bodySemiBold,
  },
  labelSelected: { color: Palette.navy },
});
