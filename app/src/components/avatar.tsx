// Round profile photo. With no photo it shows the person's initials instead.
import { Image } from 'expo-image';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, typography } from '@/theme';

// "Ana Rodriguez" -> "AR". Only the first two words count.
export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

type AvatarProps = {
  name: string;
  url: string | null;
  /** Width and height in px. */
  size?: number;
  style?: StyleProp<ViewStyle>;
};

// Big avatars get the display font for the initials, small ones the caption.
const LARGE = 64;

export function Avatar({ name, url, size = 40, style }: AvatarProps) {
  const box = { width: size, height: size };
  return (
    <View
      style={[styles.circle, box, style]}
      testID={url ? 'avatar-image' : 'avatar-fallback'}
      accessibilityLabel={name}>
      {url ? (
        <Image source={url} style={box} accessibilityIgnoresInvertColors />
      ) : (
        <Text style={size >= LARGE ? styles.initialsLarge : styles.initialsSmall}>{initials(name)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderRadius: radius.pill,
    backgroundColor: colors.bg.avatar,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initialsLarge: { ...typography['Title/Game'], color: colors.text.primary },
  initialsSmall: { ...typography.Caption, color: colors.text.primary },
});
