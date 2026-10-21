import { useCallback, useRef, useState } from 'react';
import { Linking, Platform, Share, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


import { GameMap, type GameMapHandle } from '@/components/map/game-map';
import { GameSheet, SHEET_COLLAPSED_RATIO } from '@/components/map/game-sheet';
import { LocateButton } from '@/components/map/locate-button';
import { SearchBar } from '@/components/map/search-bar';
import { SportChips } from '@/components/map/sport-chips';
import { useTabBarOffset } from '@/components/navigation/glass-tab-bar';
import { CampusToggle } from '@/components/ui/campus-toggle';
import { Spacing } from '@/constants/theme';
import { useMapGames } from '@/hooks/use-map-games';
import type { Game } from '@/types/game';

/** Opens the platform maps app with directions to the game. */
function openDirections(game: Game) {
  const label = encodeURIComponent(game.location);
  const url = Platform.select({
    ios: `maps:0,0?q=${label}@${game.lat},${game.lng}`,
    default: `geo:0,0?q=${game.lat},${game.lng}(${label})`,
  });
  Linking.openURL(url).catch(() => undefined);
}

function shareGame(game: Game) {
  Share.share({ message: `${game.title} at ${game.location}, ${game.time}. Join me on PantherPlay!` }).catch(
    () => undefined,
  );
}

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const tabBarOffset = useTabBarOffset();
  const mapRef = useRef<GameMapHandle>(null);
  const [query, setQuery] = useState('');
  const { sport, setSport, campus, setCampus, games, selectedGame, nearbyGames, selectGame } = useMapGames();

  // Locate button sits just above the collapsed sheet.
  const floatingBottom = height * SHEET_COLLAPSED_RATIO + Spacing.three;

  const handleJoin = useCallback(
    (id: string) => {
      // Backend not wired yet. Selection is kept so the sheet stays on this game.
      selectGame(id);
    },
    [selectGame],
  );

  return (
    <View style={styles.container}>
      <GameMap
        ref={mapRef}
        games={games}
        selectedGameId={selectedGame?.id ?? null}
        onSelectGame={selectGame}
      />

      <View style={[styles.topOverlay, { top: insets.top + Spacing.two }]} pointerEvents="box-none">
        <SearchBar value={query} onChangeText={setQuery} style={styles.search} />
        <SportChips value={sport} onChange={setSport} />
        <CampusToggle value={campus} onChange={setCampus} style={styles.campus} />
      </View>

      <View style={[styles.floating, { bottom: floatingBottom }]} pointerEvents="box-none">
        <LocateButton onPress={() => mapRef.current?.centerOnUser()} />
      </View>

      <GameSheet
        game={selectedGame}
        nearby={nearbyGames}
        onSelectGame={selectGame}
        onJoin={handleJoin}
        onDirections={openDirections}
        onShare={shareGame}
        bottomInset={tabBarOffset}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    gap: Spacing.two,
  },
  search: { marginHorizontal: Spacing.three },
  campus: { alignSelf: 'flex-end', marginRight: Spacing.three },
  floating: {
    position: 'absolute',
    right: Spacing.three,
    alignItems: 'center',
    gap: Spacing.two,
  },
});
