// Map (W2-07). Skeleton on mock data: a map of FIU with one pin per campus location showing
// how many games are there. Tapping a pin opens a bottom sheet with that location's games.
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { listGames, listLocations, type GameWithDetails, type Location } from '@/api';
import { BottomSheet } from '@/components/bottom-sheet';
import { MapGamePin } from '@/components/map-game-pin';
import { MapGameRow } from '@/components/map-game-row';
import { MapView, Marker, type Region } from '@/components/map-view';
import { colors, radius, space, typography } from '@/theme';

// FIU Modesto A. Maidique Campus (MMC), zoomed to show the whole campus.
const FIU_MMC_REGION: Region = {
  latitude: 25.7563,
  longitude: -80.3755,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

// Collapsed shows the handle, the title and one row.
const COLLAPSED_HEIGHT = 210;
const EXPANDED_SHARE = 0.6;

type LoadState =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'ready'; locations: Location[]; games: GameWithDetails[] };

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    Promise.all([listLocations(), listGames()])
      .then(([locations, games]) => setState({ kind: 'ready', locations, games }))
      .catch(() => setState({ kind: 'error' }));
  }, []);

  // Games grouped by location id; listGames() already sorts them soonest first.
  const gamesByLocation = useMemo(() => {
    const map = new Map<string, GameWithDetails[]>();
    if (state.kind !== 'ready') return map;
    for (const g of state.games) {
      map.set(g.location_id, [...(map.get(g.location_id) ?? []), g]);
    }
    return map;
  }, [state]);

  const locations = state.kind === 'ready' ? state.locations : [];
  const selected = locations.find((l) => l.id === selectedId) ?? null;
  const selectedGames = selected ? (gamesByLocation.get(selected.id) ?? []) : [];

  const selectPin = (id: string) => {
    setSelectedId(id);
    setExpanded(false);
  };

  return (
    <GestureHandlerRootView style={styles.screen}>
      <MapView testID="map-view" style={StyleSheet.absoluteFill} initialRegion={FIU_MMC_REGION}>
        {locations.map((l) => {
          const count = gamesByLocation.get(l.id)?.length ?? 0;
          return (
            <Marker
              key={l.id}
              testID={`map-pin-${l.id}`}
              identifier={l.id}
              coordinate={{ latitude: l.latitude, longitude: l.longitude }}
              accessibilityLabel={`${l.name}, ${count} ${count === 1 ? 'game' : 'games'}`}
              onPress={() => selectPin(l.id)}>
              <MapGamePin count={count} selected={l.id === selectedId} />
            </Marker>
          );
        })}
      </MapView>

      {state.kind === 'error' && (
        <View style={[styles.banner, { top: insets.top + space[12] }]}>
          <Text style={styles.bannerText}>Couldn&apos;t load games</Text>
        </View>
      )}

      {selected && (
        <BottomSheet
          testID="map-sheet"
          expanded={expanded}
          onExpandedChange={setExpanded}
          collapsedHeight={COLLAPSED_HEIGHT}
          expandedHeight={Math.max(windowHeight * EXPANDED_SHARE, COLLAPSED_HEIGHT)}
          header={
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle} numberOfLines={1}>
                {selected.name}
              </Text>
              <Text style={styles.sheetCount}>
                {selectedGames.length} {selectedGames.length === 1 ? 'game' : 'games'}
              </Text>
            </View>
          }>
          <FlatList
            data={selectedGames}
            keyExtractor={(g) => g.id}
            scrollEnabled={expanded}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <MapGameRow game={item} onPress={() => router.push(`/game/${item.id}`)} />
            )}
            ItemSeparatorComponent={Separator}
            ListEmptyComponent={<Text style={styles.empty}>No games here yet.</Text>}
          />
        </BottomSheet>
      )}
    </GestureHandlerRootView>
  );
}

function Separator() {
  return <View style={{ height: space[8] }} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  banner: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: colors.bg.error,
    paddingHorizontal: space[12],
    paddingVertical: space[8],
    borderRadius: radius.pill,
  },
  bannerText: { ...typography.Label, color: colors.text.error },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: space[8],
    paddingHorizontal: space[16],
    paddingBottom: space[12],
  },
  sheetTitle: { ...typography['Title/Game'], color: colors.text.primary, flexShrink: 1 },
  sheetCount: { ...typography.Caption, color: colors.text.muted },
  list: { paddingHorizontal: space[16], paddingBottom: space[16] },
  empty: { ...typography['Body/Regular'], color: colors.text.muted },
});
