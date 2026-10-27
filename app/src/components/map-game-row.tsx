// Figma: Map/Game row (182:2064). A game listed in the map's bottom sheet.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { ReactNode } from 'react';

import { colors, fonts, radius, typography } from '@/theme';

type MapGameRowProps = {
  emoji: string;
  title: string;
  details: string; // "Panther Field · 7:00 PM"
  spotsLeft: number;
  badge?: ReactNode; // a Badge/Status, shown above the spots
  selected?: boolean;
  onPress?: () => void;
};

export function MapGameRow({ emoji, title, details, spotsLeft, badge, selected = false, onPress }: MapGameRowProps) {
  return (
    <Pressable onPress={onPress} style={[styles.row, selected && styles.rowSelected]}>
      <View style={styles.sport}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.location}>
          <IconPin />
          <Text style={styles.details} numberOfLines={1}>
            {details}
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        {badge}
        <Text style={styles.spots}>
          {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left
        </Text>
      </View>
    </Pressable>
  );
}

// Figma: icon/pin (182:941), drawn at 16px.
function IconPin() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21C12 21 5 14.8 5 10C5 8.14348 5.7375 6.36301 7.05025 5.05025C8.36301 3.7375 10.1435 3 12 3C13.8565 3 15.637 3.7375 16.9497 5.05025C18.2625 6.36301 19 8.14348 19 10C19 14.8 12 21 12 21Z"
        stroke={colors.icon.active}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.5 10C14.5 11.3807 13.3807 12.5 12 12.5C10.6193 12.5 9.5 11.3807 9.5 10C9.5 8.61929 10.6193 7.5 12 7.5C13.3807 7.5 14.5 8.61929 14.5 10Z"
        stroke={colors.icon.active}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.card,
    backgroundColor: colors.bg.surface,
  },
  rowSelected: { borderWidth: 2, borderColor: colors.border.gold },
  sport: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bg.avatar,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 20 },
  info: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.interSemiBold, fontSize: 16, color: colors.text.primary },
  location: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  details: { fontFamily: fonts.interMedium, fontSize: 12, color: colors.text.muted, flexShrink: 1 },
  right: { alignItems: 'flex-end', gap: 4 },
  spots: { ...typography.Label, color: colors.text.gold },
});
