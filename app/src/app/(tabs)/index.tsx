import { Link } from 'expo-router';
import { Text, View } from 'react-native';

export default function DiscoverScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Discover</Text>
      {/* TODO: remove test links once Discover has real game cards */}
      <Link href="/game/123">Open game 123</Link>
      <Link href="/notifications">Notifications</Link>
      <Link href="/theme-preview">Theme preview</Link>
    </View>
  );
}
