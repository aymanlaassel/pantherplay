// The host's options for their game: a bottom sheet over a dimmed backdrop, like the Home filters.
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ButtonOutline } from '@/components/button-outline';
import { confirmDestructive } from '@/lib/confirm';
import { colors, radius, space, typography } from '@/theme';

type HostOptionsProps = { visible: boolean; onCancelGame: () => void; onClose: () => void };

const CONFIRM_CANCEL = {
  title: 'Cancel this game?',
  message: "Everyone who joined will see it's cancelled. This can't be undone.",
  keepLabel: 'Keep game',
  confirmLabel: 'Cancel game',
};

export function HostOptions({ visible, onCancelGame, onClose }: HostOptionsProps) {
  const insets = useSafeAreaInsets();
  const askToCancel = () =>
    confirmDestructive(CONFIRM_CANCEL, () => {
      onClose();
      onCancelGame();
    });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close host options" onPress={onClose} style={styles.backdrop} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + space[16] }]}>
          <Text style={styles.title}>Host options</Text>
          <Pressable onPress={askToCancel} accessibilityRole="button" style={styles.row}>
            <Text style={styles.danger}>Cancel game</Text>
          </Pressable>
          <ButtonOutline label="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.bg.brand, opacity: 0.5 },
  sheet: {
    padding: space[16],
    gap: space[12],
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    backgroundColor: colors.bg.surface,
  },
  title: { ...typography.Price, color: colors.text.primary },
  row: { minHeight: 48, justifyContent: 'center', borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border.default },
  danger: { ...typography['Body/Medium'], color: colors.text.error },
});
