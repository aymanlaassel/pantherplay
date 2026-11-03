import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { colors, space } from '@/theme';

// Placeholder data until the profile is wired to the API.
const user = {
  firstName: 'First',
  lastName: 'Last',
  username: 'username',
};

const scheduledGame = {
  title: '🏀  Game title',
  location: 'Location',
  time: 'Day, 0:00 – 0:00 PM',
  joined: true,
};

const record = { wins: 0, losses: 0, winRate: '0%' };
const reliability = { cancellations: 0 };

export default function ProfileScreen() {
  const initials = `${user.firstName[0]}${user.lastName[0]}`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.greeting}>Greetings {user.firstName}!</Text>
          <Text style={styles.tagline}>Your games, your community.</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Toggle dark mode" hitSlop={8}>
            <Image source={require('@/assets/images/profile/dark-mode.svg')} style={styles.moonIcon} />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Settings" hitSlop={8}>
            <Image source={require('@/assets/images/profile/gear.svg')} style={styles.icon} />
          </Pressable>
        </View>
      </View>

      <View style={styles.identity}>
        <Avatar initials={initials} size="large" />
        <View style={styles.identityText}>
          <Text style={styles.name}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.name}>@{user.username}</Text>
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
            <Image source={require('@/assets/images/profile/pin.svg')} style={styles.icon} />
            <Text style={styles.detailSmall}>{scheduledGame.location}</Text>
          </View>
          <View style={styles.detailRow}>
            <Image source={require('@/assets/images/profile/calendar.svg')} style={styles.icon} />
            <Text style={styles.detail}>{scheduledGame.time}</Text>
          </View>
          {scheduledGame.joined && (
            <View style={styles.joinedBadge}>
              <Text style={styles.joinedText}>✓ Joined</Text>
            </View>
          )}
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
  },
  headerText: {
    flex: 1,
    gap: space[8],
  },
  greeting: {
    fontSize: 30,
    fontWeight: 700,
    color: colors.text.primary,
  },
  tagline: {
    fontSize: 13,
    color: colors.text.muted,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[16],
    paddingTop: space[8],
  },
  icon: {
    width: 24,
    height: 24,
  },
  moonIcon: {
    width: 20.7333,
    height: 20.7333,
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
    fontSize: 19,
    fontWeight: 700,
    color: colors.text.primary,
  },
  editButton: {
    alignSelf: 'flex-start',
    marginTop: space[4],
    paddingHorizontal: space[20],
    paddingVertical: space[8],
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.border.gold,
    backgroundColor: colors.bg.surface,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.text.primary,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: colors.text.gold,
    marginTop: space[20],
    marginBottom: space[16],
  },
  gameCard: {
    flexDirection: 'row',
    borderRadius: 18,
    backgroundColor: colors.bg.surface,
    overflow: 'hidden',
  },
  gameAccent: {
    width: 5,
    borderRadius: 3,
    backgroundColor: colors.brand.gold,
  },
  gameBody: {
    flex: 1,
    padding: space[16],
    gap: space[8],
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: colors.text.primary,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[12],
  },
  detailSmall: {
    fontSize: 12,
    color: colors.text.primary,
  },
  detail: {
    fontSize: 15,
    fontWeight: 500,
    color: colors.text.primary,
  },
  joinedBadge: {
    alignSelf: 'flex-end',
    paddingHorizontal: space[16],
    paddingVertical: space[4],
    borderRadius: 14,
    backgroundColor: colors.bg.success,
  },
  joinedText: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.text.success,
  },
  statCard: {
    minHeight: 84,
    borderRadius: 20,
    borderWidth: 2,
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
    fontSize: 28,
    fontWeight: 700,
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
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
    fontSize: 16,
    fontWeight: 700,
    color: colors.text.primary,
  },
});
