import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SplitBorder } from '@/components/split-border';
import { colors, radius, space, typography } from '@/theme';

const PHOTO = require('@/assets/images/game-photo-placeholder.png');
const PHOTO_BORDER = 3;
const PHOTO_RADIUS = 20;

// The brand name with its gold period, used big on the screen and small on the photo.
function Wordmark({ size, color }: { size: number; color: string }) {
  return (
    <Text style={[styles.wordmark, { fontSize: size, lineHeight: size, color }]}>
      PantherPlay<Text style={styles.wordmarkDot}>.</Text>
    </Text>
  );
}

export default function WelcomeScreen() {
  
  const onGetStarted = () => router.push('/sign-in');

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Wordmark size={48} color={colors.text.primary} />

        <SplitBorder borderWidth={PHOTO_BORDER} borderRadius={PHOTO_RADIUS} style={styles.photoFrame}>
          <Image source={PHOTO} style={styles.photo} contentFit="cover" accessibilityIgnoresInvertColors />
          <View style={styles.photoWordmark}>
            <Wordmark size={22} color={colors.text.inverse} />
          </View>
        </SplitBorder>

        <Text style={styles.tagline}>{'Find a game\non campus today'}</Text>
      </View>

      {/* Page dots from the Figma carousel. Only the first page is designed so far. */}
      <View style={styles.dots}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      <Pressable onPress={onGetStarted} accessibilityRole="button" style={({ pressed }) => pressed && styles.pressed}>
        <SplitBorder borderWidth={3} backgroundColor={colors.bg.surface} style={styles.button}>
          <Text style={styles.buttonLabel}>Get started</Text>
        </SplitBorder>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen, paddingHorizontal: space[20], paddingBottom: space[12] },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[20] * 2 },
  wordmark: { fontFamily: typography['Display/Name'].fontFamily },
  wordmarkDot: { color: colors.brand.gold },
  photoFrame: { width: '75%', aspectRatio: 1.05, padding: PHOTO_BORDER, overflow: 'hidden' },
  photo: { flex: 1, borderRadius: PHOTO_RADIUS - PHOTO_BORDER },
  photoWordmark: { position: 'absolute', top: space[20], left: space[20] },
  tagline: { ...typography['Title/Game'], lineHeight: 40, color: colors.text.primary, textAlign: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: space[4], marginBottom: space[20] },
  dot: { width: 6, height: 6, borderRadius: radius.pill, backgroundColor: colors.border.default },
  dotActive: { width: 20, backgroundColor: colors.bg.brand },
  button: { height: 52, alignItems: 'center', justifyContent: 'center' },
  buttonLabel: { ...typography.Button, color: colors.text.primary },
  pressed: { opacity: 0.7 },
});
