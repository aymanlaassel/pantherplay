import { Text, View } from 'react-native';
import { useState } from 'react';
import MapView, {Marker} from 'react-native-maps';

export default function MapScreen() {
  
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  
  
  type Game = {
    id: string,
    name: string,
    sport: "soccer" | "basketball" | "volleyball",
    location_id: string,
    spots_left: number
  }
  
  type Location = {
    id: string;
    campus: 'MMC' | 'BBC';
    name: string;
    photo_url: string | null;
    latitude: number;
    longitude: number;
  };
  
  // TODO: for asad's brainstorm: can pass image prop on marker, for custom marker
  // TODO: for asad's brainstorm: callout element when marker pressed?
  
  const mockGames: Game[] = [
    {
      id: '1',
      name: '5v5 Soccer',
      sport: 'soccer',
      location_id: 'l-field',
      spots_left: 3,
    },
    {
      id: '2',
      name: 'Friday 5v5 Pickup',
      sport: 'basketball',
      location_id: 'l-rec',
      spots_left: 1,
    },
    {
      id: '2',
      name: 'Friday 3v3 Pickup',
      sport: 'basketball',
      location_id: 'l-bbc',
      spots_left: 1,
    }
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

  const selectedLocation = mockLocations.find((location) => location.id === selectedGame?.location_id);

  const FIU_MMC_REGION = {
    latitude: 25.7563,
    longitude: -80.3755,
    latitudeDelta: 0.012,
    longitudeDelta: 0.012,
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={FIU_MMC_REGION}>
        {mockGames.map((game) => {
          // Find the location associated with this game
          const location = mockLocations.find(
            (location) => location.id === game.location_id);

          if (!location) return null;

          const isSelected = selectedGame?.id === game.id;

          return (
            <Marker
              key={game.id}
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              onPress={() => setSelectedGame(game)}
              tracksViewChanges={true}>
              <View
                style={{
                  backgroundColor: isSelected ? '#DDA63A' : '#002D52',
                  borderRadius: 50,
                  padding: 12,
                  borderWidth: 3,
                  borderColor: 'white',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {selectedGame && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'white',
            padding: 20,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
            {selectedGame.name}
          </Text>

          <Text>
            {selectedLocation?.name}
          </Text>

          <Text>
            {selectedGame.spots_left} spots left
          </Text>
        </View>
      )}
    </View>
  )
}
