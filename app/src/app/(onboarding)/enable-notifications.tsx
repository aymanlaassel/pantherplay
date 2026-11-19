// Figma: Screen/Onboarding - Notifications. Asks to turn on notifications; the last onboarding step.
import { Image } from 'expo-image';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { finishOnboarding } from '@/api/profile';
import { ButtonJoin } from '@/components/button-join';
import { NotificationLeading } from '@/components/notification-leading';
import { colors, radius, space, typography } from '@/theme';

// The progress bar has one dash per onboarding step. This is the last one, so all are filled.
const STEPS = 5;

// The three soft circles behind the bell, biggest first.
const CIRCLE_SIZES = [228, 172, 116];

// Onboarding is done after this screen, so both buttons save that and go to Discover.
// replace (not push) so Back can't return to onboarding.
async function goToDiscover() {
  await finishOnboarding();
  router.replace('/');
}

// The big navy bell with its gold clapper. The circles overlap, so each one in is a shade darker.
function BellArt() {
  return (
    <View style={styles.bellArt}>
      {CIRCLE_SIZES.map((size) => (
        <View key={size} style={[styles.circle, { width: size, height: size }]} />
      ))}
      <Svg width={80} height={100} viewBox="0 0 80 100">
        <Circle cx={40} cy={10} r={6} stroke={colors.icon.active} strokeWidth={3} fill="none" />
        <Path d="M40 16C22 16 14 30 14 48V66L4 78H76L66 66V48C66 30 58 16 40 16Z" fill={colors.icon.active} />
        <Circle cx={40} cy={86} r={9} fill={colors.brand.gold} />
      </Svg>
    </View>
  );
}

export default function NotificationsOnboardingScreen() {
  // Shows the phone's own "Allow notifications?" prompt. Whatever they pick, we move on.
  const onFinish = async () => {
    await Notifications.requestPermissionsAsync();
    await goToDiscover();
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back">
          <Image source={require('@/assets/images/icons/chevron-left.svg')} style={styles.chevron} />
        </Pressable>
        <View style={styles.progress}>
          {Array.from({ length: STEPS }, (_, step) => (
            <View key={step} style={styles.dash} />
          ))}
        </View>
      </View>

      <View style={styles.intro}>
        <Text style={styles.title}>Turn on notifications</Text>
        <Text style={styles.subtitle}>
          Know when a spot opens up, a game you joined changes, or a friend invites you.
        </Text>
      </View>

      <View style={styles.middle}>
        <BellArt />
        <View style={styles.card}>
          <NotificationLeading kind="success" />
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Notifications on</Text>
            <Text style={styles.cardBody}>You&apos;ll get game updates and invites.</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={goToDiscover} accessibilityRole="button" style={({ pressed }) => pressed && styles.pressed}>
          <Text style={styles.notNow}>Not now</Text>
        </Pressable>
        <ButtonJoin label="Finish" onPress={onFinish} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen, paddingHorizontal: space[20], paddingBottom: space[12] },
  header: { flexDirection: 'row', alignItems: 'center', gap: space[16], marginTop: space[12], marginBottom: space[20] * 2 },
  chevron: { width: 24, height: 24 },
  progress: { flex: 1, flexDirection: 'row', gap: space[4] },
  dash: { flex: 1, height: space[4], borderRadius: radius.pill, backgroundColor: colors.bg.brand },
  intro: { gap: space[8] },
  title: { ...typography['Title/Game'], color: colors.text.primary },
  subtitle: { ...typography['Body/Regular'], color: colors.text.muted },
  middle: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[20] },
  bellArt: { width: CIRCLE_SIZES[0], height: CIRCLE_SIZES[0], alignItems: 'center', justifyContent: 'center' },
  circle: { position: 'absolute', borderRadius: radius.pill, backgroundColor: colors.bg.neutral, opacity: 0.5 },
  card: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[12],
    padding: space[12],
    borderRadius: radius.pill,
    backgroundColor: colors.bg.surface,
    // Same soft navy shadow as the floating tab bar.
    shadowColor: colors.bg.brand,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  cardText: { gap: space[4] },
  cardTitle: { ...typography['Body/Strong'], color: colors.text.primary },
  cardBody: { ...typography.Caption, color: colors.text.muted },
  actions: { gap: space[16] },
  notNow: { ...typography.Label, color: colors.text.muted, textAlign: 'center' },
  pressed: { opacity: 0.7 },
});
