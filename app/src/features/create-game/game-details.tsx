import { StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/chip';
import { Field } from '@/components/field';
import { colors, space, typography } from '@/theme';

import { DurationPicker } from './duration-picker';
import { CAMPUSES } from './options';
import { SportPicker } from './sport-picker';
import type { GameErrors, GameForm } from './validate';
import { WhenFields } from './when-fields';

type GameDetailsProps = {
  form: GameForm;
  errors: GameErrors;
  set: <K extends keyof GameForm>(key: K, value: GameForm[K]) => void;
};

export function GameDetails({ form, errors, set }: GameDetailsProps) {
  return (
    <View style={styles.section}>
      <SportPicker
        sport={form.sport}
        otherSport={form.otherSport}
        onSport={(sport) => set('sport', sport)}
        onOtherSport={(text) => set('otherSport', text)}
        error={errors.sport}
        otherError={errors.otherSport}
      />
      <WhenFields value={form.startsAt} onChange={(date) => set('startsAt', date)} error={errors.startsAt} />
      <DurationPicker
        minutes={form.durationMinutes}
        customMinutes={form.customMinutes}
        onMinutes={(minutes) => set('durationMinutes', minutes)}
        onCustomMinutes={(text) => set('customMinutes', text)}
        error={errors.duration}
      />
      <View style={styles.group}>
        <Text style={styles.label}>Campus</Text>
        <View style={styles.chips}>
          {CAMPUSES.map((campus) => (
            <Chip key={campus} label={campus} selected={form.campus === campus} onPress={() => set('campus', campus)} />
          ))}
        </View>
      </View>
      <Field
        label="Location"
        required
        value={form.location}
        onChangeText={(text) => set('location', text)}
        placeholder="Where are you playing?"
        maxLength={60}
        error={errors.location}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: space[20] },
  group: { gap: space[8] },
  label: { ...typography.Label, color: colors.text.primary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[8] },
});
