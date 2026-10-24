// Settings (placeholder). Not designed yet; the stack header gives it the title and back button.
import { StyleSheet, Text, View } from 'react-native';

import { colors, space, typography } from '@/theme';

export default function SettingsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.body}>Settings are coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space[20],
    backgroundColor: colors.bg.screen,
  },
  body: { ...typography['Body/Regular'], color: colors.text.muted, textAlign: 'center' },
});
