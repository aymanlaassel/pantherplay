// Figma: Badge/Status (86:21). Small pill that tells the state of a game at a glance.
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, space, typography } from '@/theme';

export type GameBadgeStatus = 'starting-soon' | 'confirmed' | 'almost-full' | 'full' | 'joined' | 'cancelled';

export const BADGE_STATUS_LABEL: Record<GameBadgeStatus, string> = {
  'starting-soon': 'Starting soon',
  confirmed: 'Confirmed',
  'almost-full': 'Almost full',
  full: 'Full',
  joined: 'Joined',
  cancelled: 'Cancelled',
};

// One background/text pair per state, all from the theme.
const palette: Record<GameBadgeStatus, { backgroundColor: string; color: string }> = {
  'starting-soon': { backgroundColor: colors.bg.goldSoft, color: colors.text.gold },
  // Green like the game card's "Confirmed" label. Joined ranks above it, so the two never show together.
  confirmed: { backgroundColor: colors.bg.success, color: colors.text.success },
  'almost-full': { backgroundColor: colors.bg.goldSoft, color: colors.text.gold },
  full: { backgroundColor: colors.bg.neutral, color: colors.text.muted },
  joined: { backgroundColor: colors.bg.success, color: colors.text.success },
  cancelled: { backgroundColor: colors.bg.error, color: colors.text.error },
};

type BadgeStatusProps = {
  status: GameBadgeStatus;
  style?: StyleProp<ViewStyle>;
};

export function BadgeStatus({ status, style }: BadgeStatusProps) {
  const { backgroundColor, color } = palette[status];
  return (
    <View style={[styles.pill, { backgroundColor }, style]}>
      <Text style={[styles.label, { color }]}>{BADGE_STATUS_LABEL[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: space[8],
    paddingVertical: space[4],
    borderRadius: radius.pill,
  },
  label: typography.Label,
});
