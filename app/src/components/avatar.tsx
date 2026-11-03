import { StyleSheet, Text, View, type ViewProps } from 'react-native';

import { colors } from '@/theme';

const AvatarColors = {
  background: colors.bg.avatar,
  text: colors.text.primary,
  ringBrand: colors.border.navy,
  ringGold: colors.border.gold,
} as const;

const Sizes = {
  small: { size: 32, fontSize: 12 },
  medium: { size: 40, fontSize: 14 },
  row: { size: 48, fontSize: 16 },
  large: { size: 88, fontSize: 30 },
} as const;

export type AvatarProps = ViewProps & {
  initials: string;
  size?: keyof typeof Sizes;
};

/** Initials avatar. `large` has the split navy|gold ring used in the Profile header. */
export function Avatar({ initials, size = 'small', style, ...rest }: AvatarProps) {
  const { size: dimension, fontSize } = Sizes[size];

  return (
    <View
      style={[
        styles.avatar,
        { width: dimension, height: dimension, borderRadius: dimension / 2 },
        size === 'large' && styles.ring,
        style,
      ]}
      {...rest}>
      <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AvatarColors.background,
  },
  ring: {
    borderWidth: 3,
    borderTopColor: AvatarColors.ringBrand,
    borderLeftColor: AvatarColors.ringBrand,
    borderRightColor: AvatarColors.ringGold,
    borderBottomColor: AvatarColors.ringGold,
  },
  initials: {
    fontWeight: 600,
    color: AvatarColors.text,
  },
});
