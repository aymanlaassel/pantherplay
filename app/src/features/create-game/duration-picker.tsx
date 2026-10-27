import { StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/chip';
import { Field } from '@/components/field';
import { colors, space, typography } from '@/theme';

import { DURATIONS, OTHER } from './options';

type DurationPickerProps = {
  minutes: number | null;
  customMinutes: string;
  onMinutes: (minutes: number | null) => void;
  onCustomMinutes: (text: string) => void;
  error?: string;
};

export function DurationPicker({ minutes, customMinutes, onMinutes, onCustomMinutes, error }: DurationPickerProps) {
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
        <Chip label={OTHER} selected={minutes === null} onPress={() => onMinutes(null)} />
      </View>
      {minutes === null ? (
        <Field
          label="Minutes"
          value={customMinutes}
          onChangeText={(text) => onCustomMinutes(text.replace(/\D/g, ''))}
          keyboardType="number-pad"
          maxLength={3}
          error={error}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: space[8] },
  label: { ...typography.Label, color: colors.text.primary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[8] },
});
