import { Tabs, router } from 'expo-router';


export default function TabLayout() {
    return (
        <Tabs>
            <Tabs.Screen name="index" options={{ title: 'Discover', headerShown: false }}/>
            <Tabs.Screen name="map" options={{ title: 'Map', headerShown: false }}/>
            <Tabs.Screen name="create-button" options={{ title: '+' }} listeners={{
                tabPress: (e) => {
                    e.preventDefault();
                    router.push('/game/create');
                }
            }}/>
            <Tabs.Screen name="social" options={{ title: 'Social' }}/>
            <Tabs.Screen name="profile" options={{ title: 'Profile', headerShown: false }}/>
        </Tabs>
)
}