import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';

import { Palette, SoftShadow } from '@/constants/theme';
import { SPORT_EMOJI, spotsLeft, type Game } from '@/types/game';

type GamePinProps = {
  game: Game;
  selected: boolean;
  onPress: (id: string) => void;
};

/** How long the marker keeps re-rendering its custom view after a change. */
const TRACK_VIEW_CHANGES_MS = 300;

export function GamePin({ game, selected, onPress }: GamePinProps) {
  // Custom marker views are snapshotted natively. tracksViewChanges must be
  // true for the new look to be picked up, but leaving it on costs performance.
  // So: turn it on whenever `selected` changes, then off again shortly after.
  const [tracks, setTracks] = useState(true);

  useEffect(() => {
    setTracks(true);
    const timer = setTimeout(() => setTracks(false), TRACK_VIEW_CHANGES_MS);
    return () => clearTimeout(timer);
  }, [selected]);

  const label = `${game.sport} at ${game.location}, ${spotsLeft(game)} spots left`;

  return (
    <Marker
      coordinate={{ latitude: game.lat, longitude: game.lng }}
      anchor={{ x: 0.5, y: 1 }}
      onPress={() => onPress(game.id)}
      tracksViewChanges={tracks}
      zIndex={selected ? 2 : 1}
      accessibilityLabel={label}>
      <View style={styles.pin}>
        <View style={[styles.circle, selected ? styles.circleSelected : styles.circleDefault]}>
          <Text style={selected ? styles.emojiSelected : styles.emojiDefault}>
            {SPORT_EMOJI[game.sport]}
          </Text>
        </View>
        <View style={[styles.dot, selected ? styles.dotSelected : styles.dotDefault]} />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  pin: {
    alignItems: 'center',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Palette.white,
    ...SoftShadow,
  },
  circleDefault: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.navy,
  },
  circleSelected: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Palette.gold,
  },
  emojiDefault: {
    fontSize: 20,
  },
  emojiSelected: {
    fontSize: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 2,
  },
  dotDefault: {
    backgroundColor: Palette.navy,
  },
  dotSelected: {
    backgroundColor: Palette.gold,
  },
});
