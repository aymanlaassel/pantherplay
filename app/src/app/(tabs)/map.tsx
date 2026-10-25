import { Pressable, Text, View, ScrollView } from 'react-native';
import { useRef, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { router } from 'expo-router';
import { colors } from '@/theme';

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

          const isSelected = selectedGame?.id === game.id;

          return (
            <Marker
              key={game.id}
              coordinate={{ latitude: location.latitude, longitude: location.longitude }}
              onPress={() => selectGame(game)}
              tracksViewChanges={true}>
              <View
                style={{
                  backgroundColor: isSelected ? colors.brand.gold : colors.bg.brand,
                  borderRadius: 50,
                  padding: 12,
                  borderWidth: 3,
                  borderColor: colors.bg.surface,
                }}
              />
            </Marker>
          );
        })}
      </MapView>

      <View
        style={{
          position: 'absolute',
          top: 60,
          left: 16,
          flexDirection: 'row',
          backgroundColor: colors.bg.surface,
          borderRadius: 20,
        }}>
        {CAMPUSES.map((option) => (
          <Pressable key={option} onPress={() => switchCampus(option)} style={{ padding: 10 }}>
            <Text style={{ fontWeight: campus === option ? 'bold' : 'normal' }}>{option}</Text>
          </Pressable>
        ))}
      </View>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: expanded ? '60%' : '20%',
          backgroundColor: colors.bg.surface,
          padding: 20,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}>
        <Pressable onPress={() => setExpanded(!expanded)}>
          <Text>{expanded ? '▼ Collapse' : '▲ Expand'}</Text>
        </Pressable>

        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Games near {campus}</Text>
        <Text>{visibleGames.length} games today · sorted by start time</Text>

        <ScrollView>
          {visibleGames.map((game) => (
            <Pressable
              key={game.id}
              onPress={() => selectGame(game)}
              style={{
                padding: 15,
                borderBottomWidth: 1,
                borderBottomColor: colors.border.default,
                backgroundColor: selectedGame?.id === game.id ? colors.bg.goldSoft : colors.bg.surface,
              }}>
              <Text style={{ fontWeight: 'bold' }}>{game.name}</Text>
              <Text>
                {findLocation(game)?.name} · {formatTime(game.starts_at)}
              </Text>
              <Text>
                {game.spots_left} spots left
                {mockMyGameIds.includes(game.id) && ' · ✓ Joined'}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
