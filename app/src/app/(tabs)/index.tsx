import { router } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DateChips } from '@/features/home/date-chips';
import { GameCard } from '@/features/home/game-card';
import { HomeHeader } from '@/features/home/home-header';
import { MOCK_GAMES } from '@/features/home/mock-games';
import { SearchBar } from '@/features/home/search-bar';
import { colors, space, typography } from '@/theme';

function Top() {
  return (
    <View style={styles.top}>
      <HomeHeader name="Panther!" onBellPress={() => router.push('/notifications')} />
      <SearchBar />
      <DateChips />
    </View>
  );
}

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={[styles.list, { paddingTop: insets.top + space[16] }]}
      data={MOCK_GAMES}
      keyExtractor={(game) => game.id}
      ListHeaderComponent={Top}
      ListEmptyComponent={<Text style={styles.empty}>No games yet. Be the first to post one.</Text>}
      renderItem={({ item }) => <GameCard game={item} onPress={() => router.push(`/game/${item.id}`)} />}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  list: { paddingHorizontal: space[16], paddingBottom: space[20], gap: space[16] },
  top: { gap: space[16] },
  empty: { ...typography['Body/Regular'], color: colors.text.muted, textAlign: 'center' },
});
