// Onboarding: shows the photo from the login provider (Google for now), or initials when there isn't one.
// Picking a photo from the camera roll or camera comes later.
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonFilled } from '@/components/button-filled';
import { InitialsAvatar } from '@/components/initials-avatar';
import { getProviderProfile } from '@/lib/auth';
import { initials } from '@/lib/initials';
import { colors, space, typography } from '@/theme';

export default function PhotoScreen() {
  const [name, setName] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Runs once when the screen opens and fills in the Google name and photo if there are any.
  useEffect(() => {
    getProviderProfile().then((profile) => {
      setName(profile.name);
      setPhotoUrl(profile.photoUrl);
    });
  }, []);

  // Skip and Continue both go to the next step for now. Saving the photo comes with src/api/profile.ts.
  const goNext = () => router.push('./enable-notifications');

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>Add a profile photo</Text>
        <Text style={styles.subtitle}>Teammates see it on your games and profile.</Text>
        <InitialsAvatar size="large" initials={name ? initials(name) : ''} imageUrl={photoUrl} />
      </View>

      <View style={styles.actions}>
        <Pressable onPress={goNext} accessibilityRole="button" style={({ pressed }) => pressed && styles.pressed}>
          <Text style={styles.skip}>Skip for now</Text>
        </Pressable>
        <ButtonFilled label="Continue" onPress={goNext} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen, paddingHorizontal: space[20], paddingBottom: space[12] },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[16] },
  title: { ...typography['Title/Game'], color: colors.text.primary, textAlign: 'center' },
  subtitle: { ...typography['Body/Regular'], color: colors.text.muted, textAlign: 'center' },
  actions: { gap: space[16] },
  skip: { ...typography.Button, color: colors.text.muted, textAlign: 'center' },
  pressed: { opacity: 0.7 },
});
