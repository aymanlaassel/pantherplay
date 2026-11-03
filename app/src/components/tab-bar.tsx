// Figma: Tab bar (87:71), Tab/Item (87:70) and Button/Create (86:6). The app's bottom navigation.
import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/icon';
import { colors, radius, space, typography } from '@/theme';

// The [+] is a route so the layout keeps its slot, but it opens Create game and is never selected.
const CREATE_ROUTE = 'create-button';

const TAB_ICONS: Record<string, IconName> = {
  index: 'search',
  map: 'pin',
  social: 'people',
  profile: 'person',
};

const ICON_SIZE = 24;
const CREATE_SIZE = 56;
const CREATE_ICON_SIZE = 28;
const CREATE_RAISE = space[16];
const UNDERLINE_WIDTH = 28;
const UNDERLINE_HEIGHT = 3;

export function TabBar({ state, descriptors, emitter, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      testID="tab-bar"
      accessibilityRole="tablist"
      style={[styles.bar, { paddingBottom: Math.max(insets.bottom, space[8]) }]}>
      <View style={styles.background} />
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          if (route.name === CREATE_ROUTE) {
            return (
              <View key={route.key} style={styles.createSlot}>
                <Pressable
                  onPress={() => router.push('/game/create')}
                  accessibilityRole="button"
                  accessibilityLabel="Create game"
                  accessibilityState={{ selected: false }}
                  style={styles.create}>
                  <Icon name="plus" color={colors.icon.active} size={CREATE_ICON_SIZE} />
                </Pressable>
              </View>
            );
          }

          const icon = TAB_ICONS[route.name];
          if (!icon) return null;

          const focused = index === state.index;
          const label = descriptors[route.key].options.title ?? route.name;

          const onPress = () => {
            const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigateToTab(route.key);
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={() => emitter.emit({ type: 'tabLongPress', target: route.key })}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected: focused }}
              style={styles.item}>
              <Icon name={icon} color={focused ? colors.brand.gold : colors.icon.inverse} size={ICON_SIZE} />
              <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
              {/* Always laid out, so labels don't shift when the selected tab changes. */}
              <View style={[styles.underline, focused && styles.underlineActive]} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // The whole bar, raised [+] included, sits in the layout, so React Navigation
  // keeps screens above it and the circle can never cover their content.
  bar: { backgroundColor: colors.bg.screen },
  background: {
    ...StyleSheet.absoluteFill,
    top: CREATE_RAISE,
    backgroundColor: colors.bg.brand,
    borderRadius: radius.card,
  },
  row: { flexDirection: 'row' },
  item: {
    flex: 1,
    minHeight: 44,
    marginTop: CREATE_RAISE,
    paddingTop: space[8],
    alignItems: 'center',
    gap: space[4],
  },
  label: { ...typography.Caption, color: colors.text.inverse },
  labelActive: { color: colors.brand.gold },
  underline: { width: UNDERLINE_WIDTH, height: UNDERLINE_HEIGHT, borderRadius: radius.pill },
  underlineActive: { backgroundColor: colors.brand.gold },
  createSlot: { flex: 1, alignItems: 'center' },
  create: {
    width: CREATE_SIZE,
    height: CREATE_SIZE,
    borderRadius: radius.pill,
    backgroundColor: colors.brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
