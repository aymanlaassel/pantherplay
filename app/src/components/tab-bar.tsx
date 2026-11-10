// Figma: Tab bar (87:71), Tab/Item (87:70) and Button/Create (86:6). The app's bottom navigation:
// a floating white pill, gray tabs, the selected tab in navy with a gold dot, and a raised navy [+].
import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/icon';
import { colors, radius, space, typography } from '@/theme';

// The [+] is a route so the layout keeps its slot, but it opens Create game and is never selected.
const CREATE_ROUTE = 'create-button';
const CREATE_LABEL = 'Post';

const TAB_ICONS: Record<string, IconName> = {
  index: 'search',
  map: 'pin',
  social: 'people',
  profile: 'person',
};

const ICON_SIZE = 24;
const CREATE_SIZE = 56;
const CREATE_ICON_SIZE = 28;
// How far the [+] circle pokes above the pill.
const CREATE_RAISE = space[16];
const DOT_SIZE = 5;

export function TabBar({ state, descriptors, emitter, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      testID="tab-bar"
      accessibilityRole="tablist"
      style={[styles.bar, { paddingBottom: Math.max(insets.bottom, space[8]) }]}>
      <View testID="tab-bar-pill" style={styles.pill}>
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
                  <Icon name="plus" color={colors.icon.inverse} size={CREATE_ICON_SIZE} />
                </Pressable>
                <Text style={styles.label}>{CREATE_LABEL}</Text>
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
              <Icon name={icon} color={focused ? colors.icon.active : colors.icon.muted} size={ICON_SIZE} />
              <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
              {/* Always laid out, so labels don't shift when the selected tab changes. */}
              <View testID={`tab-dot-${route.name}`} style={[styles.dot, focused && styles.dotActive]} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // The bar stays in the layout (not absolutely positioned), so React Navigation
  // keeps screens above it and the pill or the raised [+] never cover their content.
  bar: {
    backgroundColor: colors.bg.screen,
    paddingHorizontal: space[16],
    paddingTop: CREATE_RAISE + space[4],
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.bg.surface,
    borderRadius: radius.pill,
    paddingHorizontal: space[8],
    paddingBottom: space[8],
    shadowColor: colors.bg.brand,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  item: {
    flex: 1,
    minHeight: 44,
    paddingTop: space[12],
    alignItems: 'center',
    gap: space[4],
  },
  label: { ...typography.Caption, color: colors.text.muted },
  labelActive: { ...typography.Label, color: colors.text.primary },
  dot: { width: DOT_SIZE, height: DOT_SIZE, borderRadius: radius.pill },
  dotActive: { backgroundColor: colors.brand.gold },
  // The circle is pulled up so it rises above the top edge of the pill.
  createSlot: { flex: 1, alignItems: 'center', gap: space[4], marginTop: -CREATE_RAISE },
  create: {
    width: CREATE_SIZE,
    height: CREATE_SIZE,
    borderRadius: radius.pill,
    backgroundColor: colors.bg.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
