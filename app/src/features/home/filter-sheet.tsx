import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Game } from '@/api/types';
import { SKILL_LEVEL_LABEL, type SkillLevel } from '@/components/badge-level';
import { ButtonFilled } from '@/components/button-filled';
import { ButtonOutline } from '@/components/button-outline';
import { SPORTS } from '@/api/sports';
import { colors, radius, space, typography } from '@/theme';

import { FilterSection } from './filter-section';
import { applyFilters, EMPTY_FILTERS, TIME_SLOTS, type Filters } from './filters';

type FilterSheetProps = {
  filters: Filters;
  games: Game[];
  onApply: (filters: Filters) => void;
  onClose: () => void;
};

const LEVELS = (Object.keys(SKILL_LEVEL_LABEL) as SkillLevel[]).map((value) => ({
  value,
  label: SKILL_LEVEL_LABEL[value],
}));

// The draft lives here so Cancel throws it away and only Show applies it.
export function FilterSheet({ filters, games, onApply, onClose }: FilterSheetProps) {
  const [draft, setDraft] = useState(filters);
  const insets = useSafeAreaInsets();
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const count = applyFilters(games, draft).length;

  return (
    <View style={[styles.sheet, { paddingBottom: insets.bottom + space[16] }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Filters</Text>
        <Pressable onPress={() => setDraft(EMPTY_FILTERS)} accessibilityRole="button" style={styles.reset}>
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.sections}>
        <FilterSection title="Sport" options={SPORTS.map(({ code, name }) => ({ value: code, label: name }))} value={draft.sport} onChange={(v) => set('sport', v)} />
        <FilterSection title="Time" options={TIME_SLOTS} value={draft.time} onChange={(v) => set('time', v)} />
        <FilterSection title="Skill level" options={LEVELS} value={draft.level} onChange={(v) => set('level', v)} />
      </ScrollView>
      <View style={styles.footer}>
        <ButtonOutline label="Cancel" onPress={onClose} style={styles.button} />
        <ButtonFilled
          label={`Show ${count} ${count === 1 ? 'game' : 'games'}`}
          onPress={() => onApply(draft)}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    maxHeight: '85%',
    padding: space[16],
    gap: space[16],
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    backgroundColor: colors.bg.surface,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { ...typography.Price, color: colors.text.primary },
  reset: { minHeight: 44, paddingHorizontal: space[8], justifyContent: 'center' },
  resetText: { ...typography['Body/Strong'], color: colors.text.primary },
  sections: { gap: space[20] },
  footer: { flexDirection: 'row', gap: space[12] },
  button: { flex: 1 },
});
