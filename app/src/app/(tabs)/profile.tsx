// The Profile tab: loads the signed-in user through src/api/ and shows loading, error or their profile.
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ButtonOutline } from '@/components/button-outline';
import { ProfileContent } from '@/features/profile/profile-content';
import { useProfile } from '@/features/profile/use-profile';
import { colors, space, typography } from '@/theme';

export default function ProfileScreen() {
  const { data, status, retry } = useProfile();

  if (status === 'ready' && data) return <ProfileContent profile={data.profile} gamesPlayed={data.gamesPlayed} myGames={data.myGames} />;

  return (
    <View style={styles.center}>
      {status === 'error' ? (
        <>
          <Text style={styles.message}>{"Couldn't load your profile."}</Text>
          <ButtonOutline label="Try again" onPress={retry} />
        </>
      ) : (
        <ActivityIndicator accessibilityLabel="Loading profile" color={colors.icon.active} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[12],
    padding: space[20],
    backgroundColor: colors.bg.screen,
  },
  message: { ...typography['Body/Regular'], color: colors.text.muted, textAlign: 'center' },
});
