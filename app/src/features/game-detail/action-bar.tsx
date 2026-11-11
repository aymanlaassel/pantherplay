// Figma: Action bar (104:304). The sticky bottom button; its label and look follow the game state.
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Game, JoinResult } from '@/api/types';
import { ButtonJoin } from '@/components/button-join';
import { ButtonOutline } from '@/components/button-outline';
import { gameState, type GameState } from '@/lib/game-state';
import { colors, space, typography } from '@/theme';

export const ACTION_LABEL: Record<GameState, string> = {
  open: 'Join game',
  'starting-soon': 'Join game',
  'almost-full': 'Join game',
  full: 'Join waitlist',
  joined: 'Leave game',
  cancelled: 'Game cancelled',
};

const ANSWER_LABEL: Record<JoinResult, string> = { joined: 'Joined', waitlisted: 'Waitlisted' };

type ActionBarProps = {
  game: Game;
  answer: JoinResult | null;
  busy: boolean;
  failed: boolean;
  onJoin: () => void;
  onLeave: () => void;
};

export function ActionBar({ game, answer, busy, failed, onJoin, onLeave }: ActionBarProps) {
  const insets = useSafeAreaInsets();
  const state = gameState(game);
  const cancelled = state === 'cancelled';
  const inGame = game.myStatus !== null;
  const label = ACTION_LABEL[cancelled ? 'cancelled' : inGame ? 'joined' : state];

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + space[12] }]}>
      {failed ? <Text style={[styles.note, styles.error]}>{"That didn't work. Try again."}</Text> : null}
      {answer ? (
        <Text accessibilityLiveRegion="polite" style={styles.note}>
          {ANSWER_LABEL[answer]}
        </Text>
      ) : null}
      {inGame || cancelled ? (
        <ButtonOutline label={label} disabled={cancelled || busy} onPress={onLeave} />
      ) : (
        <ButtonJoin label={label} disabled={busy} onPress={onJoin} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    padding: space[16],
    gap: space[8],
    backgroundColor: colors.bg.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  note: { ...typography['Body/Strong'], color: colors.text.success, textAlign: 'center' },
  error: { color: colors.text.error },
});
