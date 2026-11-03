// Placeholder pushed from the gear on Profile. Ticket W3-11 replaces this content.
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { colors, space, typography } from '@/theme';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + space[8] }]}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.back}>
          <Icon name="chevronLeft" color={colors.icon.active} size={24} />
        </Pressable>
        <Text style={styles.title}>Settings</Text>
      </View>
      <Text style={styles.comingSoon}>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.surface },
  header: { paddingHorizontal: space[20], paddingBottom: space[8], gap: space[8] },
  back: { alignSelf: 'flex-start' },
  title: { ...typography['Title/Game'], color: colors.text.primary },
  comingSoon: { ...typography['Body/Regular'], color: colors.text.muted, paddingHorizontal: space[20] },
});
