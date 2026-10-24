// Social (W2-09). Skeleton on mock data, scope in docs/social-tab-scope.md (pending Felipe's
// sign-off): friends' upcoming games, the friends list with search, and Add friend (no-op).
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { listFriends, listFriendsGames, setMockScenario, type Friend, type GameWithDetails } from '@/api';
import { ButtonOutline } from '@/components/button-outline';
import { FriendRow } from '@/components/friend-row';
import { GameCard } from '@/components/game-card';
import { SearchBar } from '@/components/search-bar';
import { colors, space, typography } from '@/theme';

type SocialData = { friends: Friend[]; games: GameWithDetails[] };

type LoadState = { kind: 'loading' } | { kind: 'error' } | { kind: 'ready'; data: SocialData };

type DevMock = 'empty' | 'loading' | 'error';

const loadSocial = async (): Promise<SocialData> => {
  const [friends, games] = await Promise.all([listFriends(), listFriendsGames()]);
  return { friends, games };
};

// Dev-only: /social?mock=empty|loading|error, same switch as Discover.
function loaderFor(mock: DevMock | undefined): () => Promise<SocialData> {
  if (!__DEV__ || !mock) {
    setMockScenario('default');
    return loadSocial;
  }
  if (mock === 'loading') return () => new Promise(() => {});
  if (mock === 'error') return () => Promise.reject(new Error('Mock network error'));
  setMockScenario('empty');
  return loadSocial;
}

// TODO: open the Add friend search once it's built (see the scope note).
const onAddFriend = () => {};

export default function SocialScreen() {
  const insets = useSafeAreaInsets();
  const { mock } = useLocalSearchParams<{ mock?: DevMock }>();
  const load = useMemo(() => loaderFor(mock), [mock]);

  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [query, setQuery] = useState('');

  const fetchData = useCallback(
    () =>
      load()
        .then((data) => setState({ kind: 'ready', data }))
        .catch(() => setState({ kind: 'error' })),
    [load],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const retry = () => {
    setState({ kind: 'loading' });
    fetchData();
  };

  const friends = useMemo(() => {
    if (state.kind !== 'ready') return [];
    const q = query.trim().toLowerCase();
    return state.data.friends.filter((f) => f.full_name.toLowerCase().includes(q));
  }, [state, query]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + space[16] }]}
      keyboardShouldPersistTaps="handled">
      <Text style={styles.title} accessibilityRole="header">
        Social
      </Text>
      <Body state={state} friends={friends} query={query} onQueryChange={setQuery} onRetry={retry} />
    </ScrollView>
  );
}

type BodyProps = {
  state: LoadState;
  friends: Friend[];
  query: string;
  onQueryChange: (q: string) => void;
  onRetry: () => void;
};

function Body({ state, friends, query, onQueryChange, onRetry }: BodyProps) {
  if (state.kind === 'loading') {
    return (
      <View style={styles.state}>
        <ActivityIndicator color={colors.icon.active} accessibilityLabel="Loading friends" />
      </View>
    );
  }
  if (state.kind === 'error') {
    return (
      <View style={styles.state}>
        <Text style={styles.stateTitle}>Couldn&apos;t load friends</Text>
        <Text style={[styles.stateBody, styles.centered]}>Check your connection and try again.</Text>
        <ButtonOutline label="Try again" onPress={onRetry} />
      </View>
    );
  }
  if (state.data.friends.length === 0) {
    return (
      <View style={styles.state}>
        <Text style={styles.stateTitle}>No friends yet</Text>
        <Text style={[styles.stateBody, styles.centered]}>Add friends to see the games they&apos;re playing.</Text>
        <ButtonOutline label="Add friend" onPress={onAddFriend} />
      </View>
    );
  }

  const { games } = state.data;
  return (
    <View style={styles.body}>
      <SearchBar value={query} onChangeText={onQueryChange} placeholder="Search friends" />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Playing soon</Text>
        {games.length === 0 ? (
          <Text style={styles.stateBody}>No upcoming games from your friends.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.games}>
            {games.map((g) => (
              <GameCard key={g.id} game={g} style={styles.gameCard} onPress={() => router.push(`/game/${g.id}`)} />
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Friends</Text>
        {friends.length === 0 ? (
          <Text style={styles.stateBody}>No friends match &quot;{query.trim()}&quot;.</Text>
        ) : (
          friends.map((f) => <FriendRow key={f.id} friend={f} />)
        )}
      </View>

      <ButtonOutline label="Add friend" onPress={onAddFriend} />
    </View>
  );
}

const GAME_CARD_WIDTH = 280;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  content: { paddingHorizontal: space[16], paddingBottom: space[20], gap: space[16] },
  title: { ...typography['Display/Name'], color: colors.text.primary },
  body: { gap: space[20] },
  section: { gap: space[12] },
  sectionTitle: { ...typography['Body/Strong'], color: colors.text.muted, textTransform: 'uppercase' },
  games: { gap: space[12] },
  gameCard: { width: GAME_CARD_WIDTH },
  state: { alignItems: 'center', gap: space[12], paddingVertical: space[20] * 2 },
  stateTitle: { ...typography['Title/Game'], color: colors.text.primary, textAlign: 'center' },
  stateBody: { ...typography['Body/Regular'], color: colors.text.muted },
  centered: { textAlign: 'center' },
});
