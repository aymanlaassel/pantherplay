// Screen/Settings, with W3-11's excluded rows omitted.
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { ButtonOutline } from '@/components/button-outline';
import { Icon, type IconName } from '@/components/icon';
import { colors, radius, space, typography } from '@/theme';

// Screen-local artwork; no additions to the shared icon library.
const rowPaths: Record<string, string> = {
  'Sports & levels': 'm12 7 5 4-2 6H9l-2-6 5-4ZM12 3v4M3.5 9l3.5 2M6.5 19l2.5-2M17.5 19 15 17M20.5 9 17 11',
  'Blocked players': 'M6 6l12 12',
  'Help & feedback': 'M9 9a3 3 0 0 1 6 0c0 2-3 2-3 5M12 17v.1',
  'Report a problem': 'M6 21V3h12l-2 4 2 4H6',
  'Terms & Privacy Policy': 'M6 3h8l4 4v14H6V3ZM14 3v5h4M9 12h6M9 16h6',
};

const sections: { title: string; rows: { label: string; value?: string; icon?: IconName }[] }[] = [
  { title: 'Account', rows: [{ label: 'Sports & levels', value: '2 sports' }, { label: 'Home campus', value: 'MMC', icon: 'pin' }] },
  { title: 'Preferences', rows: [{ label: 'Notifications', value: 'On', icon: 'bell' }] },
  { title: 'Privacy & Safety', rows: [{ label: 'Blocked players', value: '0' }] },
  { title: 'Support', rows: [{ label: 'Help & feedback' }, { label: 'Report a problem' }, { label: 'Terms & Privacy Policy' }] },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: insets.top + space[16], paddingBottom: insets.bottom + space[20] }]}>
      <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" style={styles.back}>
        <Icon name="chevronLeft" color={colors.icon.active} size={24} />
      </Pressable>
      <Text style={styles.title}>Settings</Text>
      {/* Profile editing is a later ticket; mock identity only. */}
      <Pressable accessibilityRole="button" accessibilityLabel="User, Edit profile, Signed in with Google" style={styles.profile}>
        <View style={styles.avatar}><Text style={styles.name}>U</Text></View>
        <View style={styles.profileText}>
          <Text style={styles.name}>User</Text>
          <Text style={styles.caption}>Edit profile · Signed in with Google</Text>
        </View>
        <Icon name="chevronRight" color={colors.icon.muted} />
      </Pressable>
      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.card}>
            {section.rows.map((row, index) => (
              <Pressable
                key={row.label}
                accessibilityRole="button"
                accessibilityLabel={row.value ? `${row.label}, ${row.value}` : row.label}
                onPress={row.label === 'Terms & Privacy Policy' ? () => { void WebBrowser.openBrowserAsync('https://example.com'); } : undefined}
                style={styles.row}>
                <View style={styles.iconBox}>
                  {row.icon ? <Icon name={row.icon} color={colors.icon.active} size={18} /> : (
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
                      {['Sports & levels', 'Blocked players', 'Help & feedback'].includes(row.label) ? <Circle cx={12} cy={12} r={9} stroke={colors.icon.active} strokeWidth={2} /> : null}
                      <Path d={rowPaths[row.label]} stroke={colors.icon.active} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  )}
                </View>
                <View style={[styles.rowContent, index > 0 && styles.divider]}>
                  <Text style={styles.rowLabel}>{row.label}</Text>
                  {row.value ? <Text style={styles.value}>{row.value}</Text> : null}
                  <Icon name="chevronRight" color={colors.icon.muted} />
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
      <View style={styles.actions}>
        {/* TODO (#51): call signOut() from lib/auth when authentication lands. */}
        <ButtonOutline label="Sign out" />
        <Pressable onPress={() => router.push('/settings/delete-account')} accessibilityRole="button" accessibilityLabel="Delete account" style={styles.link}>
          <Text style={styles.danger}>Delete account</Text>
        </Pressable>
        <Text style={styles.footer}>PantherPlay 1.0 · Made at FIU</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  content: { paddingHorizontal: space[20] },
  back: { minHeight: 44, width: 44, justifyContent: 'center' },
  title: { ...typography['Title/Game'], color: colors.text.primary, marginBottom: space[20] },
  profile: { flexDirection: 'row', alignItems: 'center', gap: space[12], padding: space[16], backgroundColor: colors.bg.surface, borderWidth: 1, borderColor: colors.border.default, borderRadius: radius.card },
  avatar: { width: 48, height: 48, borderRadius: radius.pill, backgroundColor: colors.bg.avatar, alignItems: 'center', justifyContent: 'center' },
  profileText: { flex: 1, gap: space[4] },
  name: { ...typography['Body/Strong'], color: colors.text.primary },
  caption: { ...typography.Caption, color: colors.text.muted, lineHeight: 16 },
  section: { marginTop: space[20], gap: space[8] },
  sectionTitle: { ...typography.Label, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.8 },
  card: { backgroundColor: colors.bg.surface, borderWidth: 1, borderColor: colors.border.default, borderRadius: radius.card, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingLeft: space[16], gap: space[12] },
  iconBox: { width: 30, height: 30, borderRadius: space[8], backgroundColor: colors.bg.neutral, alignItems: 'center', justifyContent: 'center' },
  rowContent: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: space[12], paddingVertical: space[12], paddingRight: space[12] },
  divider: { borderTopWidth: 1, borderTopColor: colors.border.default },
  rowLabel: { ...typography['Body/Medium'], color: colors.text.primary, flex: 1 },
  value: { ...typography['Body/Regular'], color: colors.text.muted },
  actions: { marginTop: space[20] },
  link: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  danger: { ...typography['Body/Medium'], color: colors.text.error },
  footer: { ...typography.Caption, color: colors.text.muted, textAlign: 'center', marginTop: space[8] },
});
