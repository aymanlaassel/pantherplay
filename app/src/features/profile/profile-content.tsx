// The Profile tab's sections. Takes the user as a prop so tests can pass hostile data.
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BadgeStatus } from '@/components/badge-status';
import { Icon } from '@/components/icon';
import { InitialsAvatar } from '@/components/initials-avatar';
import { formatTimeRange } from '@/lib/format-time';
import { colors, radius, space, typography } from '@/theme';

const ICON_SIZE = 24;
const ACCENT_WIDTH = 5;
const ACCENT_RADIUS = 3;
const STAT_CARD_MIN_HEIGHT = 84;
const OUTLINE_WIDTH = 2;

export type ProfileUser = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string | null;
  scheduledGame: {
    title: string;
    location: string;
    startsAt: string;
    endsAt: string;
    joined: boolean;
  };
  record: { wins: number; losses: number; winRate: string };
  reliability: { cancellations: number };
};

const firstLetter = (name: string) => Array.from(name.trim())[0]?.toUpperCase() ?? '';

// "Maria", "Gonzalez" -> "MG". Empty names can't crash it; with no letters at all it shows "?".
export const profileInitials = (firstName: string, lastName: string) =>
  `${firstLetter(firstName)}${firstLetter(lastName)}` || '?';

export function ProfileContent({ user }: { user: ProfileUser }) {
  const { scheduledGame, record, reliability } = user;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.greeting} numberOfLines={2}>
            Greetings {user.firstName}!
          </Text>
          <Text style={styles.tagline}>Your games, your community.</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => router.push('/settings')}
            accessibilityRole="button"
            accessibilityLabel="Settings"
            hitSlop={8}>
            <Image source={require('@/assets/images/profile/gear.svg')} style={styles.icon} />
          </Pressable>
        </View>
      </View>

      <View style={styles.identity}>
        <InitialsAvatar
          initials={profileInitials(user.firstName, user.lastName)}
          imageUrl={user.avatarUrl}
          size="large"
        />
        <View style={styles.identityText}>
          <Text style={styles.name} numberOfLines={2}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.name} numberOfLines={1}>
            @{user.username}
          </Text>
          <Pressable accessibilityRole="button" style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit profile ↗</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.sectionTitle}>GAMES SCHEDULED</Text>
      <View style={styles.gameCard}>
        <View style={styles.gameAccent} />
        <View style={styles.gameBody}>
          <Text style={styles.gameTitle}>{scheduledGame.title}</Text>
          <View style={styles.detailRow}>
            <Icon name="pin" color={colors.icon.active} size={ICON_SIZE} />
            <Text style={styles.detailSmall}>{scheduledGame.location}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="calendar" color={colors.icon.active} size={ICON_SIZE} />
            <Text style={styles.detail}>
              {`Today, ${formatTimeRange(scheduledGame.startsAt, scheduledGame.endsAt)}`}
            </Text>
          </View>
          {scheduledGame.joined && <BadgeStatus status="joined" style={styles.joinedBadge} />}
        </View>
      </View>

      <Text style={styles.sectionTitle}>WIN / LOSS RECORD</Text>
      <View style={[styles.statCard, styles.recordCard]}>
        <Stat value={record.wins} label="Wins" />
        <Stat value={record.losses} label="Losses" />
        <Stat value={record.winRate} label="Win rate" />
      </View>

      <Text style={styles.sectionTitle}>RELIABILITY</Text>
      <View style={[styles.statCard, styles.reliabilityCard]}>
        <Text style={styles.statValue}>{reliability.cancellations}</Text>
        <View style={styles.reliabilityText}>
          <Text style={styles.reliabilityTitle}>Cancellations</Text>
          <Text style={styles.statLabel}>Games canceled after scheduling or joining</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.screen,
  },
  content: {
    paddingHorizontal: space[20],
    paddingTop: space[20],
    paddingBottom: space[20],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: space[12],
  },
  headerText: {
    flex: 1,
    gap: space[8],
  },
  greeting: {
    ...typography['Title/Game'],
    color: colors.text.primary,
  },
  tagline: {
    ...typography['Body/Regular'],
    color: colors.text.muted,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[16],
    paddingTop: space[8],
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[16],
    marginTop: space[20],
  },
  identityText: {
    flex: 1,
    gap: space[4],
  },
  name: {
    ...typography.Button,
    color: colors.text.primary,
  },
  editButton: {
    alignSelf: 'flex-start',
    marginTop: space[4],
    paddingHorizontal: space[20],
    paddingVertical: space[8],
    borderRadius: radius.pill,
    borderWidth: OUTLINE_WIDTH,
    borderColor: colors.border.gold,
    backgroundColor: colors.bg.surface,
  },
  editButtonText: {
    ...typography.Label,
    color: colors.text.primary,
  },
  sectionTitle: {
    ...typography['Body/Strong'],
    color: colors.text.gold,
    marginTop: space[20],
    marginBottom: space[16],
  },
  gameCard: {
    flexDirection: 'row',
    borderRadius: radius.card,
    backgroundColor: colors.bg.surface,
    overflow: 'hidden',
  },
  gameAccent: {
    width: ACCENT_WIDTH,
    borderRadius: ACCENT_RADIUS,
    backgroundColor: colors.brand.gold,
  },
  gameBody: {
    flex: 1,
    padding: space[16],
    gap: space[8],
  },
  gameTitle: {
    ...typography.Button,
    color: colors.text.primary,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[12],
  },
  detailSmall: {
    ...typography.Caption,
    color: colors.text.primary,
  },
  detail: {
    ...typography['Body/Medium'],
    color: colors.text.primary,
  },
  joinedBadge: {
    alignSelf: 'flex-end',
  },
  statCard: {
    minHeight: STAT_CARD_MIN_HEIGHT,
    borderRadius: radius.card,
    borderWidth: OUTLINE_WIDTH,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.surface,
    paddingHorizontal: space[20],
    alignItems: 'center',
  },
  recordCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
    gap: space[4],
  },
  statValue: {
    ...typography.Price,
    color: colors.text.primary,
  },
  statLabel: {
    ...typography.Caption,
    color: colors.text.muted,
  },
  reliabilityCard: {
    flexDirection: 'row',
    gap: space[20],
  },
  reliabilityText: {
    flex: 1,
    gap: space[4],
  },
  reliabilityTitle: {
    ...typography.Button,
    color: colors.text.primary,
  },
});
