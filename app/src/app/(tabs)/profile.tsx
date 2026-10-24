// Profile (W2-08). Skeleton on mock data: avatar, name, home campus, sports with levels,
// hosted/played counts, an Edit profile button (does nothing yet) and the Settings gear.
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getCurrentProfile, mockLongNameProfile, type ProfileWithDetails } from '@/api';
import { Avatar } from '@/components/avatar';
import { BadgeLevel } from '@/components/badge-level';
import { ButtonOutline } from '@/components/button-outline';
import { sportName } from '@/components/game-card';
import { ProfileStat } from '@/components/profile-stat';
import { colors, radius, space, typography } from '@/theme';

const CAMPUS_LABEL = { MMC: 'MMC campus', BBC: 'BBC campus' } as const;
const AVATAR_SIZE = 96;

type LoadState =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'ready'; profile: ProfileWithDetails };

// Dev-only: /profile?mock=long shows a profile with no avatar and a very long name.
function loaderFor(mock: string | undefined): () => Promise<ProfileWithDetails> {
  if (__DEV__ && mock === 'long') return async () => mockLongNameProfile;
  return getCurrentProfile;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { mock } = useLocalSearchParams<{ mock?: string }>();
  const load = useMemo(() => loaderFor(mock), [mock]);
  const [state, setState] = useState<LoadState>({ kind: 'loading' });

  const fetchProfile = useCallback(
    () =>
      load()
        .then((profile) => setState({ kind: 'ready', profile }))
        .catch(() => setState({ kind: 'error' })),
    [load],
  );

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const retry = () => {
    setState({ kind: 'loading' });
    fetchProfile();
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + space[16] }]}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.push('/settings')}
          accessibilityRole="button"
          accessibilityLabel="Settings"
          hitSlop={space[8]}
          style={({ pressed }) => pressed && styles.pressed}>
          <SymbolView
            name={{ ios: 'gearshape', android: 'settings', web: 'settings' }}
            size={24}
            tintColor={colors.icon.active}
          />
        </Pressable>
      </View>

      {state.kind === 'loading' && (
        <View style={styles.state}>
          <ActivityIndicator color={colors.icon.active} accessibilityLabel="Loading profile" />
        </View>
      )}
      {state.kind === 'error' && (
        <View style={styles.state}>
          <Text style={styles.stateTitle}>Couldn&apos;t load your profile</Text>
          <ButtonOutline label="Try again" onPress={retry} />
        </View>
      )}
      {state.kind === 'ready' && <ProfileBody profile={state.profile} />}
    </ScrollView>
  );
}

function ProfileBody({ profile }: { profile: ProfileWithDetails }) {
  return (
    <View style={styles.body}>
      <View style={styles.identity}>
        <Avatar name={profile.full_name} url={profile.avatar_url} size={AVATAR_SIZE} />
        <Text style={styles.name} numberOfLines={2}>
          {profile.full_name}
        </Text>
        <View style={styles.campus}>
          <Text style={styles.campusLabel}>{CAMPUS_LABEL[profile.home_campus]}</Text>
        </View>
      </View>

      {/* TODO: no-op until the edit flow is designed. */}
      <ButtonOutline label="Edit profile" />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Games</Text>
        <View style={[styles.card, styles.statsRow]}>
          <ProfileStat value={profile.games_hosted} label="Hosted" />
          <View style={styles.divider} />
          <ProfileStat value={profile.games_played} label="Played" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sports</Text>
        <View style={styles.card}>
          {profile.sports.length === 0 ? (
            <Text style={styles.empty}>No sports yet.</Text>
          ) : (
            profile.sports.map((s, i) => (
              <View key={s.sport} style={[styles.sportRow, i > 0 && styles.sportRowBorder]}>
                <Text style={styles.sportName} numberOfLines={1}>
                  {sportName(s.sport)}
                </Text>
                <BadgeLevel level={s.skill_level} />
              </View>
            ))
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  content: { paddingHorizontal: space[16], paddingBottom: space[20] },
  topBar: { flexDirection: 'row', justifyContent: 'flex-end' },
  pressed: { opacity: 0.7 },
  body: { gap: space[20] },
  identity: { alignItems: 'center', gap: space[12] },
  name: { ...typography['Display/Name'], color: colors.text.primary, textAlign: 'center', alignSelf: 'stretch' },
  campus: {
    paddingHorizontal: space[12],
    paddingVertical: space[4],
    borderRadius: radius.pill,
    backgroundColor: colors.bg.goldSoft,
  },
  campusLabel: { ...typography.Label, color: colors.text.gold },
  section: { gap: space[8] },
  sectionTitle: { ...typography.Label, color: colors.text.muted, textTransform: 'uppercase' },
  card: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingHorizontal: space[16],
  },
  statsRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: space[16] },
  divider: { width: 1, alignSelf: 'stretch', backgroundColor: colors.border.default },
  sportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[12],
    paddingVertical: space[12],
  },
  sportRowBorder: { borderTopWidth: 1, borderTopColor: colors.border.default },
  sportName: { ...typography['Body/Medium'], color: colors.text.primary, flexShrink: 1 },
  empty: { ...typography['Body/Regular'], color: colors.text.muted, paddingVertical: space[12] },
  state: { alignItems: 'center', gap: space[12], paddingVertical: space[20] * 2 },
  stateTitle: { ...typography['Title/Game'], color: colors.text.primary, textAlign: 'center' },
});
