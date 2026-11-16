import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { signIn } from '@/lib/auth';
import { colors, fonts, google, radius, space, typography } from '@/theme';

// TODO: replace with the real pages once they exist.
export const TERMS_URL = 'https://example.com/terms';
export const PRIVACY_URL = 'https://example.com/privacy';

export default function SignInScreen() {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const onContinue = async () => {
    setBusy(true);
    setFailed(false)
    const result = await signIn();
    setBusy(false);
    if (result.status === 'error') {
      setFailed(true)
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" style={styles.back}>
        <Image source={require('@/assets/images/icons/chevron-left.svg')} style={styles.chevron} />
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.wordmark}>
          PantherPlay<Text style={styles.wordmarkDot}>.</Text>
        </Text>
        <Text style={styles.title}>Sign in to play</Text>
        <Text style={styles.body}>
          New here or coming back, it&apos;s the same button. If you&apos;re new, we&apos;ll set up your profile next.
        </Text>
      </View>

      <Pressable
        onPress={onContinue}
        disabled={busy}
        accessibilityRole="button"
        accessibilityState={{ disabled: busy }}
        style={({ pressed }) => [styles.google, (pressed || busy) && styles.pressed]}>
        <Image source={require('@/assets/images/icons/google-g.svg')} style={styles.googleLogo} />
        <Text style={styles.googleLabel}>Continue with Google</Text>
      </Pressable>

      {failed ? (
        <Text style={styles.error} accessibilityRole="alert">
          Couldn&apos;t sign in. Please try again.
        </Text>
      ) : null}

      <Text style={styles.legal}>
        By continuing, you agree to the{' '}
        <Text style={styles.link} accessibilityRole="link" onPress={() => Linking.openURL(TERMS_URL)}>
          Terms of Service
        </Text>
        {'\n'}and{' '}
        <Text style={styles.link} accessibilityRole="link" onPress={() => Linking.openURL(PRIVACY_URL)}>
          Privacy Policy
        </Text>
        .
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen, paddingHorizontal: space[20], paddingBottom: space[12] },
  back: { width: 44, height: 44, justifyContent: 'center' },
  chevron: { width: 24, height: 24 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[16] },
  wordmark: { ...typography['Display/Name'], color: colors.text.primary },
  wordmarkDot: { color: colors.brand.gold },
  title: { ...typography['Title/Game'], fontSize: 28, lineHeight: 28, color: colors.text.primary },
  body: { ...typography['Body/Regular'], lineHeight: 20, color: colors.text.muted, textAlign: 'center' },
  google: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[12],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: google.stroke,
    backgroundColor: google.fill,
  },
  googleLogo: { width: 20, height: 20 },
  googleLabel: { ...typography.Button, color: google.text },
  legal: { ...typography.Caption, fontFamily: fonts.interRegular, lineHeight: 16, color: colors.text.muted, textAlign: 'center', marginTop: space[12] },
  link: { fontFamily: fonts.interSemiBold, color: colors.text.primary },
  error: { ...typography['Body/Regular'], color: colors.text.error, textAlign: 'center', marginTop: space[12] },
  pressed: { opacity: 0.7 },
});
