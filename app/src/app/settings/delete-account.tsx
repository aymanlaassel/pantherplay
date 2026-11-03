import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { ButtonFilled } from '@/components/button-filled';
import { Field } from '@/components/field';
import { Icon } from '@/components/icon';
import { colors, radius, space, typography } from '@/theme';

const deletedData = [
  'Your profile, photo and sports are removed',
  'Your friends list is deleted',
  'Games you host are canceled',
  'You leave games you joined',
];

export default function DeleteAccountScreen() {
  const insets = useSafeAreaInsets();
  const [confirmation, setConfirmation] = useState('');
  const confirmed = confirmation === 'DELETE';
  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, { paddingTop: insets.top + space[16], paddingBottom: insets.bottom + space[20] }]}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" style={styles.back}>
          <Icon name="chevronLeft" color={colors.icon.active} size={24} />
        </Pressable>
        <Text style={styles.title}>Delete account</Text>
        <View style={styles.warningIcon}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
            <Path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15" stroke={colors.text.error} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>
        <Text style={styles.warning}>This permanently deletes your account.</Text>
        <View style={styles.list}>
          {deletedData.map((item) => <Text key={item} style={styles.body}>•  {item}</Text>)}
        </View>
        <Text style={styles.caption}>This can’t be undone. Need a break? Just sign out.</Text>
        <View style={styles.field}>
          <Field label="Type DELETE to confirm" value={confirmation} onChangeText={setConfirmation} placeholder="DELETE" />
        </View>
        <View style={styles.actions}>
          {/* Skeleton only: no account data is changed. */}
          <ButtonFilled label="Delete my account" disabled={!confirmed} onPress={() => { if (confirmed) router.back(); }} style={styles.deleteButton} />
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Cancel" style={styles.cancel}>
            <Text style={styles.cancelLabel}>Cancel</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  content: { flexGrow: 1, paddingHorizontal: space[20] },
  back: { minHeight: 44, width: 44, justifyContent: 'center' },
  title: { ...typography['Title/Game'], color: colors.text.primary, marginBottom: space[20] },
  warningIcon: { width: 56, height: 56, borderRadius: radius.card, backgroundColor: colors.bg.error, alignItems: 'center', justifyContent: 'center', marginBottom: space[16] },
  warning: { ...typography['Body/Strong'], color: colors.text.primary, lineHeight: 20 },
  list: { gap: space[12], marginVertical: space[16] },
  body: { ...typography['Body/Regular'], color: colors.text.muted, lineHeight: 20 },
  caption: { ...typography['Body/Regular'], color: colors.text.muted, lineHeight: 20 },
  field: { marginTop: space[20] * 2 },
  actions: { marginTop: 'auto', paddingTop: space[20] * 2 },
  deleteButton: { backgroundColor: colors.text.error },
  cancel: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: space[4] },
  cancelLabel: { ...typography['Body/Strong'], color: colors.text.primary },
});
