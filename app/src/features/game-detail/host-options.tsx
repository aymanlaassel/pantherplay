// The host's options for their game, in a bottom sheet opened from Game detail's More button.
import { Pressable, StyleSheet, Text } from 'react-native';

import { BottomSheet } from '@/components/bottom-sheet';
import { ButtonOutline } from '@/components/button-outline';
import { confirmDestructive } from '@/lib/confirm';
import { colors, typography } from '@/theme';

type HostOptionsProps = { visible: boolean; onCancelGame: () => void; onClose: () => void };

const CONFIRM_CANCEL = {
  title: 'Cancel this game?',
  message: "Everyone who joined will see it's cancelled. This can't be undone.",
  keepLabel: 'Keep game',
  confirmLabel: 'Cancel game',
};

export function HostOptions({ visible, onCancelGame, onClose }: HostOptionsProps) {
  const askToCancel = () =>
    confirmDestructive(CONFIRM_CANCEL, () => {
      onClose();
      onCancelGame();
    });

  return (
    <BottomSheet visible={visible} closeLabel="Close host options" onClose={onClose}>
      <Text style={styles.title}>Host options</Text>
      <Pressable onPress={askToCancel} accessibilityRole="button" style={styles.row}>
        <Text style={styles.danger}>Cancel game</Text>
      </Pressable>
      <ButtonOutline label="Close" onPress={onClose} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.Price, color: colors.text.primary },
  row: { minHeight: 48, justifyContent: 'center', borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border.default },
  danger: { ...typography['Body/Medium'], color: colors.text.error },
});
