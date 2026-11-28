// The top of an onboarding step: a Back chevron and the progress bar (Figma: Screen/Onboarding – Sports).
// One dash per step; the dashes up to this step are navy, the rest gray.
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, space } from '@/theme';

// Campus, Sports & level, Photo, 18+, Notifications.
export const ONBOARDING_STEPS = 5;

type StepHeaderProps = {
  step: number; // 1 for the first step
  showBack?: boolean; // false on the first step: there's nothing to go back to
};

export function StepHeader({ step, showBack = true }: StepHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.back}>
        {showBack ? (
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back">
            <Image source={require('@/assets/images/icons/chevron-left.svg')} style={styles.chevron} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.progress}>
        {Array.from({ length: ONBOARDING_STEPS }, (_, index) => (
          <View key={index} style={[styles.dash, index < step && styles.dashDone]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space[16], marginTop: space[12], marginBottom: space[20] },
  back: { width: 24, height: 24 },
  chevron: { width: 24, height: 24 },
  progress: { flex: 1, flexDirection: 'row', gap: space[4] },
  dash: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.border.default },
  dashDone: { backgroundColor: colors.bg.brand },
});
