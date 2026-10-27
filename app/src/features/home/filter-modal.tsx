// The Home filter sheet: a bottom sheet over a dimmed backdrop, opened by the search bar's filter button.
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

import { FilterSheet } from './filter-sheet';
import type { Filters } from './filters';
import type { HomeGame } from './mock-games';

type FilterModalProps = {
  visible: boolean;
  filters: Filters;
  games: HomeGame[];
  onApply: (filters: Filters) => void;
  onClose: () => void;
};

export function FilterModal({ visible, filters, games, onApply, onClose }: FilterModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close filters" onPress={onClose} style={styles.backdrop} />
        <FilterSheet filters={filters} games={games} onApply={onApply} onClose={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.bg.brand, opacity: 0.5 },
});
