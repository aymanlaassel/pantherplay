import { StyleSheet, Text, View } from 'react-native';

import { colors, space, typography } from '@/theme';

// react-native-maps has no web build, so web shows a note instead of the map.
export default function MapScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Map</Text>
      <Text style={styles.note}>The map is available in the mobile app.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[8], backgroundColor: colors.bg.screen },
  title: { ...typography['Title/Game'], color: colors.text.primary },
  note: { ...typography['Body/Regular'], color: colors.text.muted },
});
