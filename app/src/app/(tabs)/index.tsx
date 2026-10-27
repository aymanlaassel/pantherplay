import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DateChips } from '@/features/home/date-chips';
import { FilterModal } from '@/features/home/filter-modal';
import { applyFilters, countActive, EMPTY_FILTERS } from '@/features/home/filters';
import { GameCard } from '@/features/home/game-card';
import { HomeHeader } from '@/features/home/home-header';
import { MOCK_GAMES } from '@/features/home/mock-games';
import { SearchBar } from '@/features/home/search-bar';
import { colors, space, typography } from '@/theme';

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [filtering, setFiltering] = useState(false);
  const active = countActive(filters);
  const games = applyFilters(MOCK_GAMES, filters);

  const top = (
    <View style={styles.top}>
      <HomeHeader name="Panther!" onBellPress={() => router.push('/notifications')} />
      <SearchBar activeFilters={active} onFilterPress={() => setFiltering(true)} />
      <DateChips />
    </View>
  );

  return (
    <>
      <FlatList
        style={styles.screen}
        contentContainerStyle={[styles.list, { paddingTop: insets.top + space[16] }]}
        data={games}
        keyExtractor={(game) => game.id}
        ListHeaderComponent={top}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {active ? 'No games match your filters.' : 'No games yet. Be the first to post one.'}
          </Text>
        }
        renderItem={({ item }) => <GameCard game={item} onPress={() => router.push(`/game/${item.id}`)} />}
      />
      <FilterModal
        visible={filtering}
        filters={filters}
        games={MOCK_GAMES}
        onApply={(next) => {
          setFilters(next);
          setFiltering(false);
        }}
        onClose={() => setFiltering(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  list: { paddingHorizontal: space[16], paddingBottom: space[20], gap: space[16] },
  top: { gap: space[16] },
  empty: { ...typography['Body/Regular'], color: colors.text.muted, textAlign: 'center' },
});
