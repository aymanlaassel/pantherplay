import { Pressable, ScrollView, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { SplitRing } from '@/components/ui/split-ring';
import { FontFamily, Palette, Radius } from '@/constants/theme';
import { SPORT_FILTERS, type SportFilter } from '@/types/game';

type SportChipsProps = {
  value: SportFilter;
  onChange: (s: SportFilter) => void;
  style?: StyleProp<ViewStyle>;
};

const CHIP_HEIGHT = 44;

export function SportChips({ value, onChange, style }: SportChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={style}
      contentContainerStyle={styles.content}>
      {SPORT_FILTERS.map((sport) => {
        const selected = sport === value;
        return (
          <Pressable
            key={sport}
            onPress={() => onChange(sport)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={selected ? styles.chipSelected : styles.chipUnselected}>
            {selected ? (
              <SplitRing height={CHIP_HEIGHT} fill={Palette.white} innerStyle={styles.inner}>
                <Text style={[styles.label, styles.labelSelected]}>{sport}</Text>
              </SplitRing>
            ) : (
              <Text style={[styles.label, styles.labelUnselected]}>{sport}</Text>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 10,
    paddingHorizontal: 16,
  },
  chipSelected: {
    height: CHIP_HEIGHT,
  },
  chipUnselected: {
    height: CHIP_HEIGHT,
    paddingHorizontal: 20,
    borderRadius: Radius.pill,
    borderWidth: 2,
    borderColor: Palette.border,
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    paddingHorizontal: 20,
  },
  label: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 16,
    textAlign: 'center',
  },
  labelSelected: {
    color: Palette.navy,
  },
  labelUnselected: {
    color: Palette.muted,
  },
});
