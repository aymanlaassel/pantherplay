// The Map tab: the games at a campus as pins, plus a sheet listing them. Same games as Discover.
import { ActivityIndicator, Pressable, Text, View, ScrollView } from 'react-native';
import { useRef, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { router } from 'expo-router';

import type { Game, SportCode } from '@/api/types';
import { BadgeStatus } from '@/components/badge-status';
import { ButtonOutline } from '@/components/button-outline';
import { CampusToggle, type Campus } from '@/components/campus-toggle';
import { MapGamePin } from '@/components/map-game-pin';
import { MapGameRow } from '@/components/map-game-row';
import { useGames } from '@/features/home/use-games';
import { colors, radius, space, typography } from '@/theme';

// TODO: for asad's brainstorm: can pass image prop on marker, for custom marker
// TODO: for asad's brainstorm: callout element when marker pressed?

const CAMPUS_REGIONS = {
  MMC: { latitude: 25.7563, longitude: -80.3755, latitudeDelta: 0.012, longitudeDelta: 0.012 },
  BBC: { latitude: 25.9107, longitude: -80.1392, latitudeDelta: 0.012, longitudeDelta: 0.012 },
};

const SPORT_EMOJI: Record<SportCode, string> = {
  soccer: '⚽',
  basketball: '🏀',
  volleyball: '🏐',
  tennis: '🎾',
  pickleball: '🏓',
  flag_football: '🏈',
};

// Collapsed, the sheet shows its header plus the first game row in full.
const SHEET_COLLAPSED_HEIGHT = 176;

// Shows the time in the phone's timezone, e.g. "7:00 PM".
const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const [campus, setCampus] = useState<Campus>('MMC');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [expanded, setExpanded] = useState(false);
  // The same call Discover makes, so both tabs always show the same games for a campus.
  const { games: visibleGames, status, retry } = useGames(campus);

  // First tap: highlight the game and move the map to it. Second tap: open the game's page.
  const selectGame = (game: Game) => {
    if (selectedGame?.id === game.id) {
      router.push(`/game/${game.id}`);
      return;
    }
    setSelectedGame(game);
    mapRef.current?.animateToRegion({
      latitude: game.location.latitude,
      longitude: game.location.longitude,
      latitudeDelta: 0.006,
      longitudeDelta: 0.006,
    });
  };

  const switchCampus = (next: Campus) => {
    setCampus(next);
    setSelectedGame(null);
    mapRef.current?.animateToRegion(CAMPUS_REGIONS[next]);
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView ref={mapRef} style={{ flex: 1 }} initialRegion={CAMPUS_REGIONS.MMC}>
        {visibleGames.map((game) => (
          <Marker
            key={game.id}
            coordinate={{ latitude: game.location.latitude, longitude: game.location.longitude }}
            anchor={{ x: 0.5, y: 1 }}
            onPress={() => selectGame(game)}
            tracksViewChanges={true}>
            <MapGamePin emoji={SPORT_EMOJI[game.sport.code]} selected={selectedGame?.id === game.id} />
          </Marker>
        ))}
      </MapView>

      <CampusToggle
        value={campus}
        onChange={switchCampus}
        style={{ position: 'absolute', top: space[12], left: space[12] }}
      />

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: expanded ? '60%' : SHEET_COLLAPSED_HEIGHT,
          backgroundColor: colors.bg.surface,
          paddingTop: space[16],
          paddingHorizontal: space[16],
          borderTopLeftRadius: radius.card,
          borderTopRightRadius: radius.card,
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ ...typography.Price, color: colors.text.primary }}>Games near {campus}</Text>
            {status === 'ready' && (
              <Text style={{ ...typography['Body/Medium'], color: colors.text.muted, marginTop: space[4] }}>
                {visibleGames.length} games · sorted by start time
              </Text>
            )}
          </View>

          <Pressable
            onPress={() => setExpanded(!expanded)}
            accessibilityRole="button"
            accessibilityLabel={expanded ? 'Collapse game list' : 'Expand game list'}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.bg.neutral,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{ ...typography.Button, color: colors.text.primary }}>{expanded ? '▼' : '▲'}</Text>
          </Pressable>
        </View>

        <ScrollView style={{ marginTop: space[12] }} contentContainerStyle={{ gap: space[8], paddingBottom: space[20] }}>
          {status === 'loading' && <ActivityIndicator accessibilityLabel="Loading games" color={colors.icon.active} />}
          {status === 'error' && (
            <View style={{ gap: space[12] }}>
              <Text style={{ ...typography['Body/Regular'], color: colors.text.muted, textAlign: 'center' }}>
                {"Couldn't load games."}
              </Text>
              <ButtonOutline label="Try again" onPress={retry} />
            </View>
          )}
          {visibleGames.map((game) => (
            <MapGameRow
              key={game.id}
              emoji={SPORT_EMOJI[game.sport.code]}
              title={game.sport.name}
              details={`${game.location.name} · ${formatTime(game.startsAt)}`}
              spotsLeft={Math.max(game.maxPlayers - game.spotsFilled, 0)}
              badge={game.myStatus === 'joined' ? <BadgeStatus status="joined" style={{ alignSelf: 'flex-end' }} /> : undefined}
              selected={selectedGame?.id === game.id}
              onPress={() => selectGame(game)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
