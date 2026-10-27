import { StyleSheet, Text, View } from 'react-native';

import { colors, space, typography } from '@/theme';

type InitialsAvatarProps = { initials: string; size?: number; overlap?: boolean };

export function InitialsAvatar({ initials, size = 36, overlap = false }: InitialsAvatarProps) {
  return (
    <View
      accessibilityLabel={initials}
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }, overlap && styles.overlap]}>
      <Text style={styles.label}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg.avatar,
    borderWidth: 2,
    borderColor: colors.bg.surface,
  },
  overlap: { marginLeft: -space[8] },
  label: { ...typography.Label, color: colors.text.primary },
});
