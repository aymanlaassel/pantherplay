// A round avatar: the photo when there is one, otherwise initials.
// `size="large"` is the Profile avatar, with the brand's split navy and gold ring.
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { SplitBorder } from '@/components/split-border';
import { colors, space, typography } from '@/theme';

const LARGE_SIZE = 88;
const RING_WIDTH = 3;

type InitialsAvatarProps = {
  initials: string;
  size?: number | 'large';
  overlap?: boolean;
  imageUrl?: string | null;
};

export function InitialsAvatar({ initials, size = 36, overlap = false, imageUrl = null }: InitialsAvatarProps) {
  const large = size === 'large';
  const diameter = large ? LARGE_SIZE - RING_WIDTH * 2 : size;
  const circle = (
    <View
      accessibilityLabel={initials}
      style={[
        styles.circle,
        { width: diameter, height: diameter, borderRadius: diameter / 2 },
        overlap && styles.overlap,
        large && styles.insideRing,
      ]}>
      {imageUrl ? (
        <Image testID="avatar-photo" source={{ uri: imageUrl }} contentFit="cover" style={StyleSheet.absoluteFill} />
      ) : (
        <Text style={large ? styles.largeLabel : styles.label}>{initials}</Text>
      )}
    </View>
  );

  if (!large) return circle;
  return (
    <SplitBorder testID="avatar-ring" borderWidth={RING_WIDTH} style={styles.ring}>
      {circle}
    </SplitBorder>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.bg.avatar,
    borderWidth: 2,
    borderColor: colors.bg.surface,
  },
  overlap: { marginLeft: -space[8] },
  insideRing: { borderWidth: 0 },
  ring: { width: LARGE_SIZE, height: LARGE_SIZE, padding: RING_WIDTH },
  label: { ...typography.Label, color: colors.text.primary },
  largeLabel: { ...typography.Price, color: colors.text.primary },
});
