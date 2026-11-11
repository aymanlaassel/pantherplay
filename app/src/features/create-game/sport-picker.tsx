import { StyleSheet, Text, View } from 'react-native';

import { SPORTS } from '@/api/sports';
import type { SportCode } from '@/api/types';
import { Chip } from '@/components/chip';
import { colors, space, typography } from '@/theme';

type SportPickerProps = {
  sport: SportCode | null;
  onSport: (sport: SportCode) => void;
  error?: string;
};

// No "Other" chip until the team decides on custom sports: the database only takes these codes.
export function SportPicker({ sport, onSport, error }: SportPickerProps) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>Sport *</Text>
      <View style={styles.chips}>
        {SPORTS.map(({ code, name }) => (
          <Chip key={code} label={name} selected={sport === code} onPress={() => onSport(code)} />
        ))}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: space[8] },
  label: { ...typography.Label, color: colors.text.primary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[8] },
  error: { ...typography.Caption, color: colors.text.error },
});
