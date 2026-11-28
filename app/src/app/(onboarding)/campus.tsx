// Onboarding step 2: pick a home campus. No GPS: the student picks it themselves.
// Figma's frame asks for location instead; issue #88 keeps it to a plain MMC/BBC picker.
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getMyCampus, saveCampus } from '@/api/profile';
import { ButtonJoin } from '@/components/button-join';
import type { Campus } from '@/components/campus-toggle';
import { Chip } from '@/components/chip';
import { StepHeader } from '@/features/onboarding/step-header';
import { colors, space, typography } from '@/theme';

const CAMPUS_OPTIONS: { campus: Campus; label: string }[] = [
  { campus: 'MMC', label: 'Modesto Maidique Campus (MMC)' },
  { campus: 'BBC', label: 'Biscayne Bay Campus (BBC)' },
];

export default function CampusScreen() {
  const [campus, setCampus] = useState<Campus | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If they picked a campus before (and closed the app), start with it picked.
  // If reading it fails, they just pick again.
  useEffect(() => {
    getMyCampus()
      .then((saved) => {
        if (saved) setCampus(saved);
      })
      .catch(() => {});
  }, []);

  const onNext = async () => {
    if (!campus) return;
    setSaving(true);
    setError(null);
    try {
      await saveCampus(campus);
      router.push('./sports');
    } catch {
      setError("Couldn't save your campus. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StepHeader step={2} />

      <View style={styles.intro}>
        <Text style={styles.title}>Which campus?</Text>
        <Text style={styles.subtitle}>We show games on your campus first. You can switch any time.</Text>
      </View>

      <View style={styles.options}>
        {CAMPUS_OPTIONS.map((option) => (
          <Chip
            key={option.campus}
            label={option.label}
            selected={campus === option.campus}
            onPress={() => setCampus(option.campus)}
          />
        ))}
      </View>

      <View style={styles.actions}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <ButtonJoin label="Next" onPress={onNext} disabled={!campus || saving} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen, paddingHorizontal: space[20], paddingBottom: space[12] },
  intro: { gap: space[8] },
  title: { ...typography['Title/Game'], color: colors.text.primary },
  subtitle: { ...typography['Body/Regular'], color: colors.text.muted },
  options: { flex: 1, justifyContent: 'center', gap: space[12] },
  actions: { gap: space[12] },
  error: { ...typography.Caption, color: colors.text.error, textAlign: 'center' },
});
