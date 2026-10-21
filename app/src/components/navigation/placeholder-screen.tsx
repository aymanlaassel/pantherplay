import { StyleSheet, Text, View } from 'react-native';

import { useTabBarOffset } from '@/components/navigation/glass-tab-bar';
import { FontFamily, Palette } from '@/constants/theme';

export function PlaceholderScreen({ title }: { title: string }) {
  const bottomOffset = useTabBarOffset();
  return (
    <View style={[styles.container, { paddingBottom: bottomOffset }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.white,
  },
  title: { fontFamily: FontFamily.heading, fontSize: 28, color: Palette.navy },
  subtitle: { fontFamily: FontFamily.body, fontSize: 15, color: Palette.muted, marginTop: 4 },
});
