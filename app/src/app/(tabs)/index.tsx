// Discover / Home (W2-05). Skeleton on mock data: header, campus toggle, search, date chips
// and the game list, with loading, empty and error states.
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { listGames, setMockScenario, type Campus, type GameWithDetails } from '@/api';
import { ButtonOutline } from '@/components/button-outline';
import { CampusToggle } from '@/components/campus-toggle';
import { DateChips, isSameDay, nextDays } from '@/components/date-chips';
import { GameCard } from '@/components/game-card';
import { HeaderGreeting } from '@/components/header-greeting';
import { SearchBar } from '@/components/search-bar';
import { colors, space, typography } from '@/theme';

// TODO: real name from the signed-in profile once auth lands.
const MOCK_USER_NAME = 'Panther';

type LoadState =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'ready'; games: GameWithDetails[] };

type DevMock = 'empty' | 'loading' | 'error';

// Dev-only: /?mock=empty|loading|error shows that state on a phone. 'empty' goes through the
// API's mock switch; loading and error have no API hook, so they stay local to this screen.
function loaderFor(mock: DevMock | undefined): () => Promise<GameWithDetails[]> {
  if (!__DEV__ || !mock) {
    setMockScenario('default');
    return listGames;
  }
  if (mock === 'loading') return () => new Promise(() => {});
  if (mock === 'error') return () => Promise.reject(new Error('Mock network error'));
  setMockScenario('empty');
  return listGames;
}

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { mock } = useLocalSearchParams<{ mock?: DevMock }>();
  const load = useMemo(() => loaderFor(mock), [mock]);

  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [campus, setCampus] = useState<Campus>('MMC');
  const [query, setQuery] = useState('');
  const days = useMemo(() => nextDays(7), []);
  const [day, setDay] = useState(days[0]);

  // State starts as 'loading', so the first fetch only sets state once the data is back.
  const fetchGames = useCallback(
    () =>
      load()
        .then((games) => setState({ kind: 'ready', games }))
        .catch(() => setState({ kind: 'error' })),
    [load],
  );

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const retry = () => {
    setState({ kind: 'loading' });
    fetchGames();
  };

  const games = useMemo(() => {
    if (state.kind !== 'ready') return [];
    return state.games
      .filter((g) => g.location.campus === campus && isSameDay(new Date(g.starts_at), day))
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  }, [state, campus, day]);

  const header = (
    <View style={styles.header}>
      <HeaderGreeting name={MOCK_USER_NAME} onBellPress={() => router.push('/notifications')} />
      <CampusToggle value={campus} onChange={setCampus} />
      <SearchBar value={query} onChangeText={setQuery} />
      <DateChips days={days} selected={day} onSelect={setDay} />
    </View>
  );

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + space[16] }]}
      data={games}
      keyExtractor={(g) => g.id}
      renderItem={({ item }) => <GameCard game={item} onPress={() => router.push(`/game/${item.id}`)} />}
      ItemSeparatorComponent={Separator}
      ListHeaderComponent={header}
      ListEmptyComponent={<ListState state={state} isToday={isSameDay(day, days[0])} onRetry={retry} />}
    />
  );
}

function Separator() {
  return <View style={{ height: space[12] }} />;
}

function ListState({ state, isToday, onRetry }: { state: LoadState; isToday: boolean; onRetry: () => void }) {
  if (state.kind === 'loading') {
    return (
      <View style={styles.state}>
        <ActivityIndicator color={colors.icon.active} accessibilityLabel="Loading games" />
      </View>
    );
  }
  if (state.kind === 'error') {
    return (
      <View style={styles.state}>
        <Text style={styles.stateTitle}>Couldn&apos;t load games</Text>
        <Text style={styles.stateBody}>Check your connection and try again.</Text>
        <ButtonOutline label="Try again" onPress={onRetry} />
      </View>
    );
  }
  return (
    <View style={styles.state}>
      <Text style={styles.stateTitle}>{isToday ? 'No games today' : 'No games this day'}</Text>
      <Text style={styles.stateBody}>Be the first: tap + to post one.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  content: { paddingHorizontal: space[16], paddingBottom: space[20] },
  header: { gap: space[16], marginBottom: space[16] },
  state: { alignItems: 'center', gap: space[12], paddingVertical: space[20] * 2 },
  stateTitle: { ...typography['Title/Game'], color: colors.text.primary, textAlign: 'center' },
  stateBody: { ...typography['Body/Regular'], color: colors.text.muted, textAlign: 'center' },
});
