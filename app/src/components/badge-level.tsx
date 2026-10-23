// Figma: Badge/Level (86:22). Neutral pill showing the skill level a game is pitched at.
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, space, typography } from '@/theme';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export const SKILL_LEVEL_LABEL: Record<SkillLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

type BadgeLevelProps = {
  level: SkillLevel;
  style?: StyleProp<ViewStyle>;
};

export function BadgeLevel({ level, style }: BadgeLevelProps) {
  return (
    <View style={[styles.pill, style]}>
      <Text style={styles.label}>{SKILL_LEVEL_LABEL[level]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: space[8],
    paddingVertical: space[4],
    borderRadius: radius.pill,
    backgroundColor: colors.bg.avatar,
  },
  label: { ...typography.Label, color: colors.text.primary },
});
