import { StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/chip';
import { colors, space, typography } from '@/theme';

import { DurationPicker } from './duration-picker';
import { CAMPUSES } from './options';
import { SportPicker } from './sport-picker';
import { useLocations } from './use-locations';
import type { GameErrors, GameForm } from './validate';
import { WhenFields } from './when-fields';

type GameDetailsProps = {
  form: GameForm;
  errors: GameErrors;
  set: <K extends keyof GameForm>(key: K, value: GameForm[K]) => void;
};

export function GameDetails({ form, errors, set }: GameDetailsProps) {
  const locations = useLocations(form.campus);

  return (
    <View style={styles.section}>
      <SportPicker
        sport={form.sport}
        onSport={(sport) => set('sport', sport)}
        error={errors.sport}
      />
      <WhenFields value={form.startsAt} onChange={(date) => set('startsAt', date)} error={errors.startsAt} />
      <DurationPicker minutes={form.durationMinutes} onMinutes={(minutes) => set('durationMinutes', minutes)} />
      <View style={styles.group}>
        <Text style={styles.label}>Campus</Text>
        <View style={styles.chips}>
          {CAMPUSES.map((campus) => (
            <Chip
              key={campus}
              label={campus}
              selected={form.campus === campus}
              onPress={() => {
                set('campus', campus);
                // A spot belongs to one campus, so switching campus clears it.
                if (form.location?.campus !== campus) set('location', null);
              }}
            />
          ))}
        </View>
      </View>
      <View style={styles.group}>
        <Text style={styles.label}>Location</Text>
        {locations === null ? (
          <Text style={styles.hint}>Loading places…</Text>
        ) : locations === 'failed' ? (
          <Text style={styles.error}>{"Couldn't load places. Switch campus to try again."}</Text>
        ) : (
          <View style={styles.chips}>
            {locations.map((location) => (
              <Chip
                key={location.id}
                label={location.name}
                selected={form.location?.id === location.id}
                onPress={() => set('location', location)}
              />
            ))}
          </View>
        )}
        {errors.location ? <Text style={styles.error}>{errors.location}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: space[20] },
  group: { gap: space[8] },
  label: { ...typography.Label, color: colors.text.primary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[8] },
  hint: { ...typography.Caption, color: colors.text.muted },
  error: { ...typography.Caption, color: colors.text.error },
});
