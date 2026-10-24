// Social tab: one friend in the Friends list. Photo (or initials), name, campus, and a
// "Pending" pill while a friend request hasn't been accepted.
// TODO: no Figma frame yet; match it to the library once Felipe adds one.
import { Image } from 'expo-image';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import type { Friend } from '@/api';
import { colors, radius, space, typography } from '@/theme';

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

type FriendRowProps = {
  friend: Friend;
  style?: StyleProp<ViewStyle>;
};

export function FriendRow({ friend, style }: FriendRowProps) {
  const pending = friend.status === 'pending';
  return (
    <View
      style={[styles.row, style]}
      accessible
      accessibilityLabel={`${friend.full_name}, ${friend.home_campus}${pending ? ', request pending' : ''}`}>
      {friend.avatar_url ? (
        <Image source={friend.avatar_url} style={styles.avatar} accessibilityIgnoresInvertColors />
      ) : (
        <View style={styles.avatar} testID="friend-avatar-fallback">
          <Text style={styles.initials}>{initials(friend.full_name)}</Text>
        </View>
      )}
      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={1}>
          {friend.full_name}
        </Text>
        <Text style={styles.campus}>{friend.home_campus}</Text>
      </View>
      {pending && (
        <View style={styles.pending}>
          <Text style={styles.pendingLabel}>Pending</Text>
        </View>
      )}
    </View>
  );
}

const AVATAR = 44;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[12],
    padding: space[12],
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.surface,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: radius.pill,
    backgroundColor: colors.bg.avatar,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { ...typography['Body/Strong'], color: colors.text.primary },
  text: { flex: 1, gap: space[4] },
  name: { ...typography['Body/Medium'], color: colors.text.primary },
  campus: { ...typography.Caption, color: colors.text.muted },
  // Same shape as Badge/Status, neutral colors.
  pending: {
    paddingHorizontal: space[8],
    paddingVertical: space[4],
    borderRadius: radius.pill,
    backgroundColor: colors.bg.neutral,
  },
  pendingLabel: { ...typography.Label, color: colors.text.muted },
});
