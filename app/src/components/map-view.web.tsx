// Web stand-in for map-view.tsx. react-native-maps only runs on iOS and Android, and
// PantherPlay is a mobile app, so the web build shows a note instead of a map.
import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, space, typography } from '@/theme';

export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type MapViewProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  initialRegion?: Region;
  testID?: string;
}>;

export function MapView({ style, testID }: MapViewProps) {
  return (
    <View testID={testID} style={[styles.box, style]}>
      <Text style={styles.text}>The map is available in the mobile app.</Text>
    </View>
  );
}

export function Marker(_props: PropsWithChildren<Record<string, unknown>>) {
  return null;
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center', padding: space[20], backgroundColor: colors.bg.screen },
  text: { ...typography['Body/Regular'], color: colors.text.muted, textAlign: 'center' },
});
