// Full-screen stand-in for the Game detail page while it loads, or when there is no game to show.
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ButtonOutline } from '@/components/button-outline';
import { colors, space, typography } from '@/theme';

type DetailMessageProps = { message?: string; onBack: () => void; onRetry?: () => void };

export function DetailMessage({ message, onBack, onRetry }: DetailMessageProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {message ? (
        <Text style={styles.title}>{message}</Text>
      ) : (
        <ActivityIndicator accessibilityLabel="Loading game" color={colors.icon.active} />
      )}
      {onRetry ? <ButtonOutline label="Try again" onPress={onRetry} /> : null}
      <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back" style={styles.back}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[12], backgroundColor: colors.bg.surface },
  title: { ...typography['Title/Game'], color: colors.text.primary },
  back: { minHeight: 44, paddingHorizontal: space[16], justifyContent: 'center' },
  backText: { ...typography['Body/Strong'], color: colors.text.primary },
});
