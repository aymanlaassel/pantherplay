import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CreateButton } from '@/components/ui/create-button';
import { FontFamily, MinTouchTarget, Palette } from '@/constants/theme';

export const TAB_BAR_HEIGHT = 72;

/** Bottom padding screens need to keep content above the tab bar. */
export function useTabBarOffset() {
  const insets = useSafeAreaInsets();
  return insets.bottom + TAB_BAR_HEIGHT;
}

type IconName = keyof typeof Ionicons.glyphMap;

type TabConfig = {
  name: string;
  label: string;
  icon: { active: IconName; inactive: IconName };
};

/** Only routes listed here get a tab button; others stay navigable but hidden. */
const TABS: TabConfig[] = [
  { name: 'index', label: 'Discover', icon: { active: 'search', inactive: 'search-outline' } },
  { name: 'map', label: 'Map', icon: { active: 'map', inactive: 'map-outline' } },
  // Create (+) button sits between these two; see CREATE_AFTER.
  { name: 'community', label: 'Community', icon: { active: 'people', inactive: 'people-outline' } },
  { name: 'profile', label: 'Profile', icon: { active: 'person', inactive: 'person-outline' } },
];

/** The Create button renders after this tab. */
const CREATE_AFTER = 'map';

export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const focusedKey = state.routes[state.index]?.key;

  const items = TABS.flatMap((tab) => {
    const route = state.routes.find((r) => r.name === tab.name);
    return route ? [{ tab, route }] : [];
  });

  return (
    <View
      style={[styles.bar, { height: TAB_BAR_HEIGHT + insets.bottom, paddingBottom: insets.bottom }]}
      pointerEvents="box-none">
      <View style={styles.row}>
        {items.map(({ tab, route }) => {
          const isFocused = route.key === focusedKey;
          const title = descriptors[route.key]?.options.title;
          const label = tab.label ?? title ?? route.name;
          const color = isFocused ? Palette.navy : Palette.muted;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          const tabButton = (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={label}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
              <View style={[styles.indicator, isFocused && styles.indicatorActive]} />
              <Ionicons
                name={isFocused ? tab.icon.active : tab.icon.inactive}
                size={26}
                color={color}
              />
              <Text style={[styles.label, { color }]} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          );

          if (tab.name !== CREATE_AFTER) return tabButton;
          return [
            tabButton,
            <View key="create" style={styles.createSlot}>
              <CreateButton onPress={() => navigation.navigate('post')} style={styles.create} />
            </View>,
          ];
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Palette.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Palette.border,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tab: {
    flex: 1,
    minHeight: MinTouchTarget,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  createSlot: {
    flex: 1,
    alignItems: 'center',
  },
  create: {
    marginTop: -20,
  },
  indicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  indicatorActive: {
    backgroundColor: Palette.gold,
  },
  label: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 15,
    marginTop: 6,
  },
  pressed: {
    opacity: 0.7,
  },
});
