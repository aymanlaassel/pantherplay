// The Profile tab's sections. Takes the user as a prop so tests can pass hostile data.
// Shows games played; username, win/loss record and reliability stay hidden (Felipe, Nov 25).
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Game, Profile } from '@/api/types';
import { BadgeStatus } from '@/components/badge-status';
import { ButtonOutline } from '@/components/button-outline';
import { Icon } from '@/components/icon';
import { InitialsAvatar } from '@/components/initials-avatar';
import { signOut } from '@/lib/auth';
import { endsAt, formatDay, formatTimeRange } from '@/lib/format-time';
import { initials } from '@/lib/initials';
import { colors, radius, space, typography } from '@/theme';

const ICON_SIZE = 24;
const ACCENT_WIDTH = 5;
const ACCENT_RADIUS = 3;
const OUTLINE_WIDTH = 2;

// "Panther Student" -> "Panther". With no name at all it greets "Panther", like Discover.
const firstName = (fullName: string) => fullName.trim().split(/\s+/)[0] || 'Panther';

type ProfileContentProps = {
  profile: Profile;
  gamesPlayed: number;
  myGames: Game[]; // games I host or joined that haven't ended, soonest first
};

export function ProfileContent({ profile, gamesPlayed, myGames }: ProfileContentProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.greeting} numberOfLines={2}>
            Greetings {firstName(profile.fullName)}!
          </Text>
          <Text style={styles.tagline}>Your games, your community.</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => router.push('/settings')}
            accessibilityRole="button"
            accessibilityLabel="Settings"
            hitSlop={8}>
            <Icon name="gear" color={colors.icon.active} size={ICON_SIZE} />
          </Pressable>
        </View>
      </View>

      <View style={styles.identity}>
        <InitialsAvatar
          initials={initials(profile.fullName) || '?'}
          imageUrl={profile.avatarUrl}
          size="large"
        />
        <View style={styles.identityText}>
          <Text style={styles.name} numberOfLines={2}>
            {profile.fullName}
          </Text>
          <Pressable accessibilityRole="button" style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit profile ↗</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.stat}>
        <Text style={styles.statValue}>{gamesPlayed}</Text>
        <Text style={styles.statLabel}>{gamesPlayed === 1 ? 'Game played' : 'Games played'}</Text>
      </View>

      <Text style={styles.sectionTitle}>MY GAMES</Text>
      {myGames.length > 0 ? (
        <View style={styles.gameList}>
          {myGames.map((game) => (
            <MyGameCard key={game.id} game={game} />
          ))}
        </View>
      ) : (
        <Text style={styles.noGames}>No games coming up. Join one from Discover.</Text>
      )}

      {/* TEMPORARY: lets us test the auth gate until Settings has a real Sign out. Remove then. */}
      <ButtonOutline label="Sign out" onPress={signOut} style={styles.signOut} />
    </ScrollView>
  );
}

// One of My Games. Tapping it opens Game detail.
function MyGameCard({ game }: { game: Game }) {
  return (
    <Pressable
      onPress={() => router.push(`/game/${game.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${game.sport.name}, ${formatDay(game.startsAt)}`}
      style={styles.gameCard}>
      <View style={styles.gameAccent} />
      <View style={styles.gameBody}>
        <Text style={styles.gameTitle}>{game.sport.name}</Text>
        <View style={styles.detailRow}>
          <Icon name="pin" color={colors.icon.active} size={ICON_SIZE} />
          <Text style={styles.detailSmall}>{`${game.location.name} · ${game.location.campus}`}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="calendar" color={colors.icon.active} size={ICON_SIZE} />
          <Text style={styles.detail}>
            {`${formatDay(game.startsAt)}, ${formatTimeRange(game.startsAt, endsAt(game.startsAt, game.durationMinutes))}`}
          </Text>
        </View>
        {game.isHost ? <Text style={styles.hosting}>Hosting</Text> : <BadgeStatus status="joined" style={styles.joinedBadge} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stat: {
    marginTop: space[20],
    padding: space[16],
    gap: space[4],
    borderRadius: radius.card,
    backgroundColor: colors.bg.surface,
  },
  statValue: { ...typography.Price, color: colors.text.primary },
  statLabel: { ...typography.Label, color: colors.text.muted },
  gameList: { gap: space[12] },
  hosting: { ...typography.Label, color: colors.text.gold, alignSelf: 'flex-end' },
  signOut: { marginTop: space[20] },
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
    flex: 1,
    ...typography.Caption,
    color: colors.text.primary,
  },
  detail: {
    flex: 1,
    ...typography['Body/Medium'],
    color: colors.text.primary,
  },
  joinedBadge: {
    alignSelf: 'flex-end',
  },
  noGames: {
    ...typography['Body/Regular'],
    color: colors.text.muted,
  },
});
