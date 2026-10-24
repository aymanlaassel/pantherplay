// Figma: Campus toggle (102:254). Two-way switch between MMC and BBC.
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import type { Campus } from '@/api';
import { colors, radius, space, typography } from '@/theme';

const CAMPUSES: Campus[] = ['MMC', 'BBC'];

type CampusToggleProps = {
  value: Campus;
  onChange: (campus: Campus) => void;
  style?: StyleProp<ViewStyle>;
};

export function CampusToggle({ value, onChange, style }: CampusToggleProps) {
  return (
    <View style={[styles.track, style]} accessibilityRole="tablist">
      {CAMPUSES.map((campus) => {
        const selected = campus === value;
        return (
          <Pressable
            key={campus}
            onPress={() => onChange(campus)}
            accessibilityRole="tab"
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
  track: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    padding: space[4] / 2,
    borderWidth: 1,
    borderColor: colors.border.navy,
    borderRadius: radius.pill,
    backgroundColor: colors.bg.surface,
  },
  segment: {
    height: 32,
    paddingHorizontal: space[16],
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSelected: { backgroundColor: colors.bg.brand },
  label: { ...typography.Label, color: colors.text.primary },
  labelSelected: { color: colors.text.inverse },
});
