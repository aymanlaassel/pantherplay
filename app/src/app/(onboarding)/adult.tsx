// Onboarding step 1: confirm you're 18 or older. PantherPlay is 18+ (decided Nov 25, an App Store must-have).
// No birthdate is asked for or kept: only the time they confirmed (profiles.adult_confirmed_at).
// A new step, built in the layout of the Figma onboarding frames; Felipe reviews it in the PR.
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { confirmAdult } from '@/api/profile';
import { ButtonJoin } from '@/components/button-join';
import { StepHeader } from '@/features/onboarding/step-header';
import { colors, radius, space, typography } from '@/theme';

export default function AdultScreen() {
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onContinue = async () => {
    if (!checked) return;
    setSaving(true);
    setError(null);
    try {
      await confirmAdult();
      router.push('./campus');
    } catch {
      setError("Couldn't save that. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StepHeader step={1} />

      <View style={styles.intro}>
        <Text style={styles.title}>Are you 18 or older?</Text>
        <Text style={styles.subtitle}>PantherPlay is for students 18 and up. We don&apos;t ask for your birthday.</Text>
      </View>

      <View style={styles.middle}>
        <Pressable
          onPress={() => setChecked(!checked)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked }}
          style={[styles.card, checked && styles.cardChecked]}>
          <View style={[styles.box, checked && styles.boxChecked]}>
            {checked ? (
              <Svg width={16} height={16} viewBox="0 0 24 24">
                <Path d="M5 12.5L10 17.5L19 7" stroke={colors.icon.inverse} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            ) : null}
          </View>
          <Text style={styles.cardLabel}>I confirm I&apos;m 18 or older</Text>
        </Pressable>
      </View>

      <View style={styles.actions}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <ButtonJoin label="Continue" onPress={onContinue} disabled={!checked || saving} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen, paddingHorizontal: space[20], paddingBottom: space[12] },
  intro: { gap: space[8] },
  title: { ...typography['Title/Game'], color: colors.text.primary },
  subtitle: { ...typography['Body/Regular'], color: colors.text.muted },
  middle: { flex: 1, justifyContent: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[12],
    padding: space[16],
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.surface,
  },
  cardChecked: { borderColor: colors.border.navy },
  box: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: { backgroundColor: colors.bg.brand, borderColor: colors.border.navy },
  cardLabel: { ...typography['Body/Medium'], color: colors.text.primary, flex: 1 },
  actions: { gap: space[12] },
  error: { ...typography.Caption, color: colors.text.error, textAlign: 'center' },
});
