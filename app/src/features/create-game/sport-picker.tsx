import { StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/chip';
import { Field } from '@/components/field';
import { colors, space, typography } from '@/theme';

import { OTHER, SPORTS } from './options';

type SportPickerProps = {
  sport: string | null;
  otherSport: string;
  onSport: (sport: string) => void;
  onOtherSport: (text: string) => void;
  error?: string;
  otherError?: string;
};

export function SportPicker({ sport, otherSport, onSport, onOtherSport, error, otherError }: SportPickerProps) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>Sport *</Text>
      <View style={styles.chips}>
        {[...SPORTS, OTHER].map((name) => (
          <Chip key={name} label={name} selected={sport === name} onPress={() => onSport(name)} />
        ))}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {sport === OTHER ? (
        <Field label="Which sport?" value={otherSport} onChangeText={onOtherSport} maxLength={30} error={otherError} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: space[8] },
  label: { ...typography.Label, color: colors.text.primary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[8] },
  error: { ...typography.Caption, color: colors.text.error },
});
