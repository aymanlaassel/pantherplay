/**
 * Web fallback for GameMap. react-native-maps has no web build, so on web we
 * show the games as a simple selectable list instead of a map.
 * Same props and ref handle as game-map.tsx so screens don't need to care.
 */
import { forwardRef, useImperativeHandle } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FontFamily, Palette, Radius } from '@/constants/theme';
import type { Game } from '@/types/game';

export type GameMapHandle = {
  centerOnUser: () => void;
};

type GameMapProps = {
  games: Game[];
  selectedGameId: string | null;
  onSelectGame: (id: string) => void;
};

export const GameMap = forwardRef<GameMapHandle, GameMapProps>(function GameMap(
  { games, selectedGameId, onSelectGame },
  ref,
) {
  useImperativeHandle(ref, () => ({ centerOnUser: () => undefined }), []);

  return (
    <View style={styles.container}>
      <Text style={styles.notice}>The map is available on iOS and Android. Pick a game:</Text>
      <View style={styles.pins}>
        {games.map((game) => {
          const selected = game.id === selectedGameId;
          return (
            <Pressable
              key={game.id}
              onPress={() => onSelectGame(game.id)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${game.sport} at ${game.location}, ${game.joined} of ${game.cap} joined`}
              style={[styles.pin, selected && styles.pinSelected]}>
              <Text style={[styles.pinText, selected && styles.pinTextSelected]}>
                {game.joined}/{game.cap}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Palette.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  notice: { fontFamily: FontFamily.body, fontSize: 14, color: Palette.muted, textAlign: 'center' },
  pins: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  pin: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: Palette.navy,
    borderWidth: 2,
    borderColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinSelected: { backgroundColor: Palette.gold, width: 52, height: 52 },
  pinText: { fontFamily: FontFamily.bodySemiBold, fontSize: 12, color: Palette.white },
  pinTextSelected: { color: Palette.navy, fontSize: 14 },
});
