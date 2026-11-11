import { StyleSheet, Text, View } from 'react-native';

import type { Duration } from '@/api/types';
import { Chip } from '@/components/chip';
import { colors, space, typography } from '@/theme';

import { DURATIONS } from './options';

type DurationPickerProps = {
  minutes: Duration;
  onMinutes: (minutes: Duration) => void;
};

export function DurationPicker({ minutes, onMinutes }: DurationPickerProps) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>Duration</Text>
      <View style={styles.chips}>
        {DURATIONS.map((option) => (
          <Chip
            key={option.minutes}
            label={option.label}
            selected={minutes === option.minutes}
            onPress={() => onMinutes(option.minutes)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: space[8] },
  label: { ...typography.Label, color: colors.text.primary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[8] },
});
