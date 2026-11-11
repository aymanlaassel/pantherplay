// Figma: Detail rows (104:268). When, where and level plus price, each with an icon.
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Game } from '@/api/types';
import { SKILL_LEVEL_LABEL } from '@/components/badge-level';
import { Icon, type IconName } from '@/components/icon';
import { endsAt, formatTimeRange } from '@/lib/format-time';
import { colors, space, typography } from '@/theme';

export function DetailRows({ game }: { game: Game }) {
  return (
    <View style={styles.rows}>
      <Row icon="calendar" text={`Today, ${formatTimeRange(game.startsAt, endsAt(game.startsAt, game.durationMinutes))}`} />
      <Row icon="pin" text={`${game.location.name} - ${game.location.campus}`} chevron />
      <Row icon="level" text={`${SKILL_LEVEL_LABEL[game.skillLevel]} - Free`} />
    </View>
  );
}

type RowProps = { icon: IconName; text: string; chevron?: boolean };

function Row({ icon, text, chevron = false }: RowProps) {
  const content = (
    <>
      <Icon name={icon} color={colors.icon.active} size={22} />
      <Text style={styles.text}>{text}</Text>
      {chevron ? <Icon name="chevronRight" color={colors.icon.active} /> : null}
    </>
  );
  return chevron ? (
    <Pressable accessibilityRole="button" accessibilityLabel={text} style={styles.row}>
      {content}
    </Pressable>
  ) : (
    <View style={styles.row}>{content}</View>
  );
}

const styles = StyleSheet.create({
  rows: { gap: space[8] },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[12], minHeight: 36 },
  text: { ...typography['Body/Medium'], color: colors.text.primary, flex: 1 },
});
