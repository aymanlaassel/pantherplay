import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CampusToggle, type Campus } from '@/components/campus-toggle';
import { DateChips } from '@/features/home/date-chips';
import { FilterModal } from '@/features/home/filter-modal';
import { applyFilters, countActive, EMPTY_FILTERS } from '@/features/home/filters';
import { GameCard } from '@/features/home/game-card';
import { HomeHeader } from '@/features/home/home-header';
import { MOCK_GAMES } from '@/features/home/mock-games';
import { SearchBar } from '@/features/home/search-bar';
import { MOCK_NOTIFICATIONS } from '@/mock/notifications';
import { colors, space, typography } from '@/theme';

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const [campus, setCampus] = useState<Campus>('MMC');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [filtering, setFiltering] = useState(false);
  const active = countActive(filters);
  const campusGames = MOCK_GAMES.filter((game) => game.campus === campus);
  const games = applyFilters(campusGames, filters);

  const top = (
    <View style={styles.top}>
      <HomeHeader
        name="Panther!"
        hasUnread={MOCK_NOTIFICATIONS.some((n) => n.unread)}
        onBellPress={() => router.push('/notifications')}
      />
      <CampusToggle value={campus} onChange={setCampus} style={styles.campus} />
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
            {active ? 'No games match your filters.' : 'No games today. Be the first to post one.'}
          </Text>
        }
        renderItem={({ item }) => <GameCard game={item} onPress={() => router.push(`/game/${item.id}`)} />}
      />
      <FilterModal
        visible={filtering}
        filters={filters}
        games={campusGames}
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
  campus: { alignSelf: 'flex-start' },
  empty: { ...typography['Body/Regular'], color: colors.text.muted, textAlign: 'center' },
});
