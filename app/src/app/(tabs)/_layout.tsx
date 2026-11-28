import { Redirect, Tabs } from 'expo-router';
import { useEffect, useState } from 'react';

import { hasFinishedOnboarding } from '@/api/profile';
import { TabBar } from '@/components/tab-bar';
import { registerPushToken } from '@/lib/push-token';

export default function TabLayout() {
    // null while we check. Someone who hasn't finished onboarding is sent there instead of Discover.
    const [onboarded, setOnboarded] = useState<boolean | null>(null);

    // If the check fails (no network), let them in: most people opening the app are returning users,
    // and the check runs again on the next start, so a new user still gets onboarding then.
    useEffect(() => {
        hasFinishedOnboarding()
            .then(setOnboarded)
            .catch(() => setOnboarded(true));
    }, []);

    // On every start, save this phone's push token again in case it changed.
    // Only if they already allowed notifications: this never asks. A failure just waits for the next start.
    useEffect(() => {
        if (onboarded) {
            registerPushToken().catch(() => {});
        }
    }, [onboarded]);

    if (onboarded === null) {
        return null;
    }
    if (!onboarded) {
        return <Redirect href="/campus" />;
    }

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
