// A bottom sheet over a dimmed backdrop. Tapping the backdrop or the back gesture closes it.
import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, space } from '@/theme';

type BottomSheetProps = { visible: boolean; closeLabel: string; onClose: () => void; children: ReactNode };

export function BottomSheet({ visible, closeLabel, onClose, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable accessibilityRole="button" accessibilityLabel={closeLabel} onPress={onClose} style={styles.backdrop} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + space[16] }]}>{children}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.bg.brand, opacity: 0.5 },
  sheet: {
    maxHeight: '85%',
    padding: space[16],
    gap: space[12],
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    backgroundColor: colors.bg.surface,
  },
});
