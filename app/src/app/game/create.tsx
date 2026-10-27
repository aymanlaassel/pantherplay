import { router } from 'expo-router';
import { useRef } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ButtonFilled } from '@/components/button-filled';
import { confirmDiscard } from '@/features/create-game/confirm-discard';
import { GameCrowd } from '@/features/create-game/game-crowd';
import { GameDetails } from '@/features/create-game/game-details';
import { useGameForm } from '@/features/create-game/use-game-form';
import { colors, space, typography } from '@/theme';

export default function CreateGameScreen() {
  const { form, set, errors, status, isDirty, submit } = useGameForm();
  const insets = useSafeAreaInsets();
  const scroll = useRef<ScrollViewInstance>(null);

  // Every error-prone field that starts empty is in the top section, so jump there.
  const post = () => {
    if (!submit()) scroll.current?.scrollTo({ y: 0, animated: true });
  };

  // A page opened directly (web refresh) has no screen behind it, so fall back to home.
  const leave = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const close = () => (isDirty ? confirmDiscard(leave) : leave());

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.title}>Create game</Text>
        <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Close" style={styles.close}>
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
      </View>
      <ScrollView ref={scroll} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={styles.legend}>* Required. Everything else is pre-filled.</Text>
        <GameDetails form={form} errors={errors} set={set} />
        <GameCrowd form={form} errors={errors} set={set} />
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + space[12] }]}>
        <Text accessibilityLiveRegion="polite" style={styles.status}>
          {status}
        </Text>
        <ButtonFilled label="Post game" onPress={post} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: space[16] },
  title: { ...typography['Title/Game'], color: colors.text.primary },
  close: { minHeight: 44, paddingHorizontal: space[8], justifyContent: 'center' },
  closeText: { ...typography['Body/Strong'], color: colors.text.primary },
  legend: { ...typography.Caption, color: colors.text.muted },
  form: { padding: space[16], gap: space[20] },
  footer: { padding: space[16], gap: space[8], backgroundColor: colors.bg.surface, borderTopWidth: 1, borderTopColor: colors.border.default },
  status: { ...typography.Caption, color: colors.text.muted },
});
