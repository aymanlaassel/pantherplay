// Figma: Action bar (104:304). The sticky bottom button; its label and look follow the game state.
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ButtonJoin } from '@/components/button-join';
import { ButtonOutline } from '@/components/button-outline';
import { colors, space } from '@/theme';

import type { GameState } from './mock-games';

export const ACTION_LABEL: Record<GameState, string> = {
  open: 'Join game',
  'starting-soon': 'Join game',
  'almost-full': 'Join game',
  full: 'Join waitlist',
  joined: 'Leave game',
  cancelled: 'Game cancelled',
};

export function ActionBar({ state }: { state: GameState }) {
  const insets = useSafeAreaInsets();
  const label = ACTION_LABEL[state];
  const outline = state === 'joined' || state === 'cancelled';

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + space[12] }]}>
      {outline ? (
        <ButtonOutline label={label} disabled={state === 'cancelled'} />
      ) : (
        <ButtonJoin label={label} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    padding: space[16],
    backgroundColor: colors.bg.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
});
