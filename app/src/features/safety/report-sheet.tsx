// Report and Block, in a bottom sheet. Opened from Game detail's and Player profile's More button;
// chat opens it for a message. Each target in `reports` becomes a "Report ..." row.
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { blockUser, report, REPORT_DETAILS_MAX, type ReportReason, type ReportTarget } from '@/api/safety';
import type { Profile } from '@/api/types';
import { BottomSheet } from '@/components/bottom-sheet';
import { ButtonFilled } from '@/components/button-filled';
import { ButtonOutline } from '@/components/button-outline';
import { Chip } from '@/components/chip';
import { Textarea } from '@/components/textarea';
import { confirmDestructive } from '@/lib/confirm';
import { colors, space, typography } from '@/theme';

export type ReportOption = { type: ReportTarget; id: string; label: string };

const REASONS: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'unsafe', label: 'Unsafe behavior' },
  { value: 'inappropriate', label: 'Inappropriate' },
  { value: 'other', label: 'Something else' },
];

type Step = { kind: 'menu' } | { kind: 'reason'; option: ReportOption } | { kind: 'done' };

type ReportSheetProps = {
  visible: boolean;
  reports: ReportOption[];
  block?: Profile; // who "Block" blocks; left out when there is nobody to block
  onBlocked?: () => void;
  onClose: () => void;
};

export function ReportSheet({ visible, reports, block, onBlocked, onClose }: ReportSheetProps) {
  const [step, setStep] = useState<Step>({ kind: 'menu' });
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tooLong = details.length > REPORT_DETAILS_MAX;

  const close = () => {
    setStep({ kind: 'menu' });
    setReason(null);
    setDetails('');
    setError(null);
    onClose();
  };

  const attempt = async (action: () => Promise<void>, failure: string, onDone: () => void) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      onDone();
    } catch {
      setError(failure);
    } finally {
      setBusy(false);
    }
  };

  const send = (option: ReportOption, chosen: ReportReason) =>
    attempt(() => report(option.type, option.id, chosen, details.trim() || undefined), "Couldn't send your report. Try again.", () =>
      setStep({ kind: 'done' }),
    );

  const askToBlock = (player: Profile) =>
    confirmDestructive(
      { title: `Block ${player.fullName}?`, message: "You won't see each other's games.", keepLabel: 'Cancel', confirmLabel: 'Block' },
      () =>
        attempt(() => blockUser(player.id), "Couldn't block. Try again.", () => {
          close();
          onBlocked?.();
        }),
    );

  return (
    <BottomSheet visible={visible} closeLabel="Close report options" onClose={close}>
      {step.kind === 'menu' ? (
        <>
          <Text style={styles.title}>More</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View>
            {reports.map((option) => (
              <Pressable key={option.type + option.id} onPress={() => setStep({ kind: 'reason', option })} accessibilityRole="button" style={styles.row}>
                <Text style={styles.rowLabel}>{option.label}</Text>
              </Pressable>
            ))}
            {block ? (
              <Pressable onPress={() => askToBlock(block)} disabled={busy} accessibilityRole="button" accessibilityLabel={`Block ${block.fullName}`} style={styles.row}>
                <Text style={styles.danger}>{`Block ${block.fullName}`}</Text>
              </Pressable>
            ) : null}
          </View>
          <ButtonOutline label="Close" onPress={close} />
        </>
      ) : null}

      {step.kind === 'reason' ? (
        <ScrollView contentContainerStyle={styles.reason} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{step.option.label}</Text>
          <Text style={styles.body}>What&apos;s wrong?</Text>
          <View style={styles.chips}>
            {REASONS.map((r) => (
              <Chip key={r.value} label={r.label} selected={reason === r.value} onPress={() => setReason(r.value)} />
            ))}
          </View>
          <Textarea
            label="Details (optional)"
            value={details}
            onChangeText={setDetails}
            maxLength={REPORT_DETAILS_MAX}
            error={tooLong ? `Keep it under ${REPORT_DETAILS_MAX} characters.` : undefined}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <ButtonFilled label="Send report" disabled={!reason || tooLong || busy} onPress={() => reason && send(step.option, reason)} />
          <ButtonOutline label="Cancel" onPress={close} />
        </ScrollView>
      ) : null}

      {step.kind === 'done' ? (
        <>
          <Text accessibilityLiveRegion="polite" style={styles.title}>{"Thanks, we'll review it"}</Text>
          <Text style={styles.body}>Reports are private. The person you reported isn&apos;t told who sent it.</Text>
          <ButtonOutline label="Close" onPress={close} />
        </>
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.Price, color: colors.text.primary },
  body: { ...typography['Body/Regular'], color: colors.text.muted },
  row: { minHeight: 48, justifyContent: 'center', borderTopWidth: 1, borderColor: colors.border.default },
  rowLabel: { ...typography['Body/Medium'], color: colors.text.primary },
  danger: { ...typography['Body/Medium'], color: colors.text.error },
  error: { ...typography['Body/Strong'], color: colors.text.error },
  reason: { gap: space[12] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[8] },
});
