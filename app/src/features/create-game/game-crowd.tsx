import { StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/chip';
import { Stepper } from '@/components/stepper';
import { Textarea } from '@/components/textarea';
import { colors, space, typography } from '@/theme';

import { MAX_PLAYERS, MIN_PLAYERS, NOTES_MAX, SKILLS } from './options';
import type { GameErrors, GameForm } from './validate';

type GameCrowdProps = {
  form: GameForm;
  errors: GameErrors;
  set: <K extends keyof GameForm>(key: K, value: GameForm[K]) => void;
};

export function GameCrowd({ form, errors, set }: GameCrowdProps) {
  return (
    <View style={styles.section}>
      <View style={styles.group}>
        <Stepper label="Players needed" value={form.players} min={MIN_PLAYERS} max={MAX_PLAYERS} onChange={(n) => set('players', n)} />
        {errors.players ? <Text style={styles.error}>{errors.players}</Text> : null}
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Skill level</Text>
        <View style={styles.chips}>
          {SKILLS.map((skill) => (
            <Chip key={skill} label={skill} selected={form.skill === skill} onPress={() => set('skill', skill)} />
          ))}
        </View>
      </View>

      <Textarea
        label="Notes"
        value={form.notes}
        onChangeText={(text) => set('notes', text)}
        maxLength={NOTES_MAX}
        placeholder="Anything players should know"
        error={errors.notes}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: space[20] },
  group: { gap: space[8] },
  label: { ...typography.Label, color: colors.text.primary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[8] },
  error: { ...typography.Caption, color: colors.text.error },
});
