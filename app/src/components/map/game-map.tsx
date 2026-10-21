/**
 * Map view for the Map tab.
 * This file and game-pin.tsx are the ONLY places that import react-native-maps,
 * so the map library can be swapped (e.g. for Mapbox) without touching screens.
 */
import * as Location from 'expo-location';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { type Region } from 'react-native-maps';

import { GamePin } from '@/components/map/game-pin';
import { FIU_MMC } from '@/constants/theme';
import type { Game } from '@/types/game';

export type GameMapHandle = {
  centerOnUser: () => void;
};

type GameMapProps = {
  games: Game[];
  selectedGameId: string | null;
  onSelectGame: (id: string) => void;
};

const DELTA = 0.012;
const ANIMATION_MS = 350;

function regionAt(latitude: number, longitude: number): Region {
  return { latitude, longitude, latitudeDelta: DELTA, longitudeDelta: DELTA };
}

const CAMPUS_REGION = regionAt(FIU_MMC.latitude, FIU_MMC.longitude);

export const GameMap = forwardRef<GameMapHandle, GameMapProps>(function GameMap(
  { games, selectedGameId, onSelectGame },
  ref
) {
  const mapRef = useRef<MapView>(null);
  const permissionGranted = useRef(false);

  // Ask for location once. If denied or it fails, the map just stays on campus.
  useEffect(() => {
    Location.requestForegroundPermissionsAsync()
      .then(({ status }) => {
        permissionGranted.current = status === Location.PermissionStatus.GRANTED;
      })
      .catch(() => {
        permissionGranted.current = false;
      });
  }, []);

  const centerOnUser = useCallback(async () => {
    if (!permissionGranted.current) {
      mapRef.current?.animateToRegion(CAMPUS_REGION, ANIMATION_MS);
      return;
    }
    try {
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      mapRef.current?.animateToRegion(regionAt(coords.latitude, coords.longitude), ANIMATION_MS);
    } catch {
      mapRef.current?.animateToRegion(CAMPUS_REGION, ANIMATION_MS);
    }
  }, []);

  useImperativeHandle(ref, () => ({ centerOnUser: () => void centerOnUser() }), [centerOnUser]);

  // Pan to the selected game whenever the selection changes.
  useEffect(() => {
    const game = games.find((g) => g.id === selectedGameId);
    if (game) {
      mapRef.current?.animateToRegion(regionAt(game.lat, game.lng), ANIMATION_MS);
    }
    // Only react to selection changes, not to the games list being refiltered.
  }, [selectedGameId]);

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      initialRegion={CAMPUS_REGION}
      showsUserLocation
      showsMyLocationButton={false}
      showsCompass={false}
      toolbarEnabled={false}>
      {games.map((game) => (
        <GamePin
          key={game.id}
          game={game}
          selected={game.id === selectedGameId}
          onPress={onSelectGame}
        />
      ))}
    </MapView>
  );
});
