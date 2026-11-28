// Onboarding step 3: pick the sports you play and a level for each. Saved to profile_sports.
// Figma draws each sport as a "Sport card"; until Felipe approves that component, this uses Chips.
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getMySports, saveSports } from '@/api/profile';
import { SPORTS } from '@/api/sports';
import type { SportCode } from '@/api/types';
import { SKILL_LEVEL_LABEL, type SkillLevel } from '@/components/badge-level';
import { ButtonJoin } from '@/components/button-join';
import { Chip } from '@/components/chip';
import { StepHeader } from '@/features/onboarding/step-header';
import { colors, space, typography } from '@/theme';

const LEVELS: SkillLevel[] = ['beginner', 'intermediate', 'advanced'];

// A sport they tapped, and the level they picked for it (null until they pick one).
type Pick = { sport: SportCode; level: SkillLevel | null };

function sportName(code: SportCode): string {
  const sport = SPORTS.find((item) => item.code === code);
  return sport ? sport.name : code;
}

export default function SportsScreen() {
  const [picks, setPicks] = useState<Pick[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If they saved sports before (then went back to Campus, or closed the app), start with those.
  // If reading them fails, they just pick again.
  useEffect(() => {
    getMySports()
      .then((saved) => {
        if (saved.length > 0) setPicks(saved);
      })
      .catch(() => {});
  }, []);

  const isPicked = (sport: SportCode) => picks.some((pick) => pick.sport === sport);

  // Tapping a sport adds it, or removes it if it was already picked.
  const toggleSport = (sport: SportCode) => {
    if (isPicked(sport)) {
      setPicks(picks.filter((pick) => pick.sport !== sport));
    } else {
      setPicks([...picks, { sport, level: null }]);
    }
  };

  const setLevel = (sport: SportCode, level: SkillLevel) => {
    setPicks(picks.map((pick) => (pick.sport === sport ? { sport, level } : pick)));
  };

  const missingLevel = picks.some((pick) => pick.level === null);
  const canContinue = picks.length > 0 && !missingLevel && !saving;

  const onNext = async () => {
    if (!canContinue) return;
    setSaving(true);
    setError(null);
    try {
      // canContinue already checked every pick has a level.
      await saveSports(picks.map((pick) => ({ sport: pick.sport, level: pick.level as SkillLevel })));
      router.push('./photo');
    } catch {
      setError("Couldn't save your sports. Try again.");
    } finally {
      setSaving(false);
    }
  };

  let footer = 'Pick at least one sport';
  if (picks.length > 0) {
    footer = missingLevel
      ? 'Pick a level for each sport'
      : `${picks.length} ${picks.length === 1 ? 'sport' : 'sports'} picked · you can change these later`;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StepHeader step={3} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.intro}>
          <Text style={styles.title}>What do you play?</Text>
          <Text style={styles.subtitle}>
            Pick your sports and your level. We use them to show you pickup games that fit.
          </Text>
        </View>

        <View style={styles.chips}>
          {SPORTS.map(({ code, name }) => (
            <Chip key={code} label={name} selected={isPicked(code)} onPress={() => toggleSport(code)} />
          ))}
        </View>

        {picks.map((pick) => (
          <View key={pick.sport} style={styles.levelGroup}>
            <Text style={styles.levelLabel}>{`${sportName(pick.sport)} level`}</Text>
            <View style={styles.chips}>
              {LEVELS.map((level) => (
                <Chip
                  key={level}
                  label={SKILL_LEVEL_LABEL[level]}
                  selected={pick.level === level}
                  onPress={() => setLevel(pick.sport, level)}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.actions}>
        <Text style={error ? styles.error : styles.footer}>{error ?? footer}</Text>
        <ButtonJoin label="Next" onPress={onNext} disabled={!canContinue} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen, paddingHorizontal: space[20], paddingBottom: space[12] },
  content: { gap: space[20], paddingBottom: space[20] },
  intro: { gap: space[8] },
  title: { ...typography['Title/Game'], color: colors.text.primary },
  subtitle: { ...typography['Body/Regular'], color: colors.text.muted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[8] },
  levelGroup: { gap: space[8] },
  levelLabel: { ...typography.Label, color: colors.text.primary },
  actions: { gap: space[12], paddingTop: space[8] },
  footer: { ...typography.Caption, color: colors.text.muted, textAlign: 'center' },
  error: { ...typography.Caption, color: colors.text.error, textAlign: 'center' },
});
