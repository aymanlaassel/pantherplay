import { Redirect, Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { hasConfirmedAdult, hasFinishedOnboarding } from '@/api/profile';
import { ButtonOutline } from '@/components/button-outline';
import { TabBar } from '@/components/tab-bar';
import { registerPushToken } from '@/lib/push-token';
import { colors, space, typography } from '@/theme';

// Where the gate sends someone: still checking, to the 18+ step, to the rest of onboarding,
// into the tabs, or the check failed.
type Gate = 'checking' | 'confirm-adult' | 'onboarding' | 'tabs' | 'failed';

export default function TabLayout() {
    const [gate, setGate] = useState<Gate>('checking');
    const [attempt, setAttempt] = useState(0);

    // Nobody reaches the tabs without confirming they're 18+ (an App Store must-have), then finishing onboarding.
    // If the check fails (no network), say so with Try again: letting them in could skip the 18+ step.
    useEffect(() => {
        Promise.all([hasConfirmedAdult(), hasFinishedOnboarding()]).then(
            ([adult, finished]) => {
                if (!adult) setGate('confirm-adult');
                else if (!finished) setGate('onboarding');
                else setGate('tabs');
            },
            () => setGate('failed'),
        );
    }, [attempt]);

    // On every start, save this phone's push token again in case it changed.
    // Only if they already allowed notifications: this never asks. A failure just waits for the next start.
    useEffect(() => {
        if (gate === 'tabs') {
            registerPushToken().catch(() => {});
        }
    }, [gate]);

    if (gate === 'checking') {
        return null;
    }
    if (gate === 'failed') {
        const retry = () => {
            setGate('checking');
            setAttempt(attempt + 1);
        };
        return (
            <View style={styles.failed}>
                <Text style={styles.failedText}>Couldn&apos;t load your account.</Text>
                <ButtonOutline label="Try again" onPress={retry} />
            </View>
        );
    }
    if (gate === 'confirm-adult') {
        return <Redirect href="/adult" />;
    }
    if (gate === 'onboarding') {
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

const styles = StyleSheet.create({
    failed: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[12], backgroundColor: colors.bg.screen },
    failedText: { ...typography['Body/Regular'], color: colors.text.primary },
});
