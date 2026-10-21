import { Tabs } from 'expo-router';

import { GlassTabBar } from '@/components/navigation/glass-tab-bar';
import { Palette } from '@/constants/theme';

export const unstable_settings = {
  initialRouteName: 'map',
};

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="map"
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: Palette.white } }}>
      <Tabs.Screen name="index" options={{ title: 'Discover' }} />
      <Tabs.Screen name="map" options={{ title: 'Map' }} />
      <Tabs.Screen name="community" options={{ title: 'Community' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="post" options={{ title: 'Post', href: null }} />
    </Tabs>
  );
}
