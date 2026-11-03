import { Tabs } from 'expo-router';

import { TabBar } from '@/components/tab-bar';

export default function TabLayout() {
    return (
        <Tabs tabBar={(props) => <TabBar {...props} />}>
            <Tabs.Screen name="index" options={{ title: 'Discover', headerShown: false }}/>
            <Tabs.Screen name="map" options={{ title: 'Map' }}/>
            {/* TabBar turns this slot into the [+] button, which opens Create game. */}
            <Tabs.Screen name="create-button" options={{ title: '+' }}/>
            <Tabs.Screen name="social" options={{ title: 'Social' }}/>
            <Tabs.Screen name="profile" options={{ title: 'Profile' }}/>
        </Tabs>
)
}
