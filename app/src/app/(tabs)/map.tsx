import { Pressable, Text, View, ScrollView } from 'react-native';
import { useRef, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { router } from 'expo-router';

import { BadgeStatus } from '@/components/badge-status';
import { MapGamePin } from '@/components/map-game-pin';
import { MapGameRow } from '@/components/map-game-row';
import { colors, radius, space, typography } from '@/theme';

type Campus = 'MMC' | 'BBC';

type Game = {
  id: string;
  name: string;
  sport: 'soccer' | 'basketball' | 'volleyball';
  location_id: string;
  spots_left: number;
  starts_at: string; // timestamptz from the DB, as an ISO string
};

type Location = {
  id: string;
  campus: Campus;
  name: string;
  photo_url: string | null;
  latitude: number;
  longitude: number;
};

// TODO: for asad's brainstorm: can pass image prop on marker, for custom marker
// TODO: for asad's brainstorm: callout element when marker pressed?

// Mock games happen today at the given hour, so they always pass the "today" filter.
const todayAt = (hour: number) => {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

const mockGames: Game[] = [
  {
    id: '1',
    name: '5v5 Soccer',
    sport: 'soccer',
    location_id: 'l-field',
    spots_left: 3,
    starts_at: todayAt(19),
  },
  {
    id: '2',
    name: 'Friday 5v5 Pickup',
    sport: 'basketball',
    location_id: 'l-rec',
    spots_left: 1,
    starts_at: todayAt(18),
  },
  {
    id: '3',
    name: 'Friday 3v3 Pickup',
    sport: 'basketball',
    location_id: 'l-bbc',
    spots_left: 1,
    starts_at: todayAt(20),
  },
];

const mockLocations: Location[] = [
  {
    id: 'l-field',
    campus: 'MMC',
    name: 'Panther Field',
    photo_url: 'https://picsum.photos/seed/panther-field/800/400',
    latitude: 25.7538,
    longitude: -80.3722,
  },
  {
    id: 'l-rec',
    campus: 'MMC',
    name: 'Rec Center Courts',
    photo_url: 'https://picsum.photos/seed/rec-center/800/400',
    latitude: 25.7572,
    longitude: -80.3781,
  },
  {
    id: 'l-bbc',
    campus: 'BBC',
    name: 'BBC Recreation Field',
    photo_url: null,
    latitude: 25.9126,
    longitude: -80.1411,
  },
];

// Games the signed-in user has joined. Will come from the DB once auth exists.
const mockMyGameIds = ['2'];

const CAMPUS_REGIONS = {
  MMC: { latitude: 25.7563, longitude: -80.3755, latitudeDelta: 0.012, longitudeDelta: 0.012 },
  BBC: { latitude: 25.9107, longitude: -80.1392, latitudeDelta: 0.012, longitudeDelta: 0.012 },
};

const CAMPUSES: Campus[] = ['MMC', 'BBC'];

const SPORT_EMOJI = { soccer: '⚽', basketball: '🏀', volleyball: '🏐' };

// Collapsed, the sheet shows its header plus the first game row in full.
const SHEET_COLLAPSED_HEIGHT = 176;

const findLocation = (game: Game) => mockLocations.find((location) => location.id === game.location_id);

// Shows the time in the phone's timezone, e.g. "7:00 PM".
const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

// True if the game is on today's date (in the phone's timezone).
const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const [campus, setCampus] = useState<Campus>('MMC');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [expanded, setExpanded] = useState(false);

  const visibleGames = mockGames
    .filter((game) => findLocation(game)?.campus === campus && isToday(game.starts_at))
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));

  // First tap: highlight the game and move the map to it. Second tap: open the game's page.
  const selectGame = (game: Game) => {
    if (selectedGame?.id === game.id) {
      router.push(`/game/${game.id}`);
      return;
    }
    setSelectedGame(game);
    const location = findLocation(game);
    if (!location) return;
    mapRef.current?.animateToRegion({
      latitude: location.latitude,
      longitude: location.longitude,
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
        {visibleGames.map((game) => {
          const location = findLocation(game);
          if (!location) return null;

          return (
            <Marker
              key={game.id}
              coordinate={{ latitude: location.latitude, longitude: location.longitude }}
              anchor={{ x: 0.5, y: 1 }}
              onPress={() => selectGame(game)}
              tracksViewChanges={true}>
              <MapGamePin emoji={SPORT_EMOJI[game.sport]} selected={selectedGame?.id === game.id} />
            </Marker>
          );
        })}
      </MapView>

      <View
        style={{
          position: 'absolute',
          top: space[12],
          left: space[12],
          flexDirection: 'row',
          padding: space[4],
          backgroundColor: colors.bg.surface,
          borderRadius: radius.pill,
        }}>
        {CAMPUSES.map((option) => (
          <Pressable
            key={option}
            onPress={() => switchCampus(option)}
            style={{ paddingHorizontal: space[16], paddingVertical: space[8] }}>
            <Text
              style={{
                ...(campus === option ? typography['Body/Strong'] : typography['Body/Medium']),
                color: campus === option ? colors.text.primary : colors.text.muted,
              }}>
              {option}
            </Text>
          </Pressable>
        ))}
      </View>

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
            <Text style={{ ...typography['Body/Medium'], color: colors.text.muted, marginTop: space[4] }}>
              {visibleGames.length} games today · sorted by start time
            </Text>
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
          {visibleGames.map((game) => (
            <MapGameRow
              key={game.id}
              emoji={SPORT_EMOJI[game.sport]}
              title={game.name}
              details={`${findLocation(game)?.name} · ${formatTime(game.starts_at)}`}
              spotsLeft={game.spots_left}
              badge={mockMyGameIds.includes(game.id) ? <BadgeStatus status="joined" style={{ alignSelf: 'flex-end' }} /> : undefined}
              selected={selectedGame?.id === game.id}
              onPress={() => selectGame(game)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
