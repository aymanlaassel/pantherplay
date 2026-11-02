// Figma: Notification/Leading (146:771). The 40x40 circle at the start of a Notification row.
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius } from '@/theme';

export type NotificationLeadingKind = 'avatar' | 'game' | 'alert' | 'success';

// The exact Figma exports: each is the full tinted circle plus its icon.
const ICONS = {
  game: require('@/assets/images/icons/notification-game.svg'),
  alert: require('@/assets/images/icons/notification-alert.svg'),
  success: require('@/assets/images/icons/notification-success.svg'),
};

// "Alex R." -> "AR", "Marcus" -> "M".
export const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0].toUpperCase()).join('');

type NotificationLeadingProps = {
  kind: NotificationLeadingKind;
  // Who the notification is about; only the avatar kind shows it.
  name?: string;
};

export function NotificationLeading({ kind, name = '' }: NotificationLeadingProps) {
  if (kind === 'avatar') {
    return (
      <View testID="notification-leading-avatar" style={styles.avatar}>
        <Text style={styles.initials}>{initials(name)}</Text>
      </View>
    );
  }
  return <Image testID={`notification-leading-${kind}`} source={ICONS[kind]} style={styles.size} />;
}

const styles = StyleSheet.create({
  size: { width: 40, height: 40 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.bg.avatar,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontFamily: fonts.interSemiBold, fontSize: 13, color: colors.text.primary },
});
