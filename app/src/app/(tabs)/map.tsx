import { Text, View } from 'react-native';
import { useState } from 'react';
import MapView, {Marker} from 'react-native-maps';

export default function MapScreen() {
  
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

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

  const mockGames = [
    {
      id: '1',
      name: '5v5 Soccer',
      sport: 'soccer',
      location_id: 'l-field',
      spotsLeft: 3,
    },
    {
      id: '2',
      name: 'Friday 5v5 Pickup',
      sport: 'basketball',
      location_id: 'l-rec',
      spotsLeft: 1,
    },
    {
      id: '2',
      name: 'Friday 3v3 Pickup',
      sport: 'basketball',
      location_id: 'l-bbc',
      spotsLeft: 1,
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
        {mockLocations.map((location) => (
          <Marker
            key={location.id}
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude}}
            title={location.name}
            onPress={() => setSelectedLocation(location)}
          />
        ))}
      </MapView>

      {selectedLocation ? (
      <View>
        <Text>{selectedLocation.name}</Text>
      </View>
        ) : null}
    </View>
  )
}
