import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Palette } from '@/constants/theme';

type SplitRingProps = PropsWithChildren<{
  /** Outer width. Defaults to stretching to the parent. */
  width?: number | `${number}%`;
  /** Outer height, including the ring. */
  height: number;
  /** Ring thickness. */
  ringWidth?: number;
  /** Fill color inside the ring. */
  fill?: string;
  style?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
}>;

/**
 * Pill or circle with the brand two-tone outline: navy on the left, gold on the
 * right, split on a diagonal. Used by the Join button, selected chips, the
 * Create button and the avatar ring. Pass height === width for a circle.
 */
export function SplitRing({
  width,
  height,
  ringWidth = 3,
  fill = Palette.white,
  style,
  innerStyle,
  children,
}: SplitRingProps) {
  const radius = height / 2;
  return (
    <View style={[styles.outer, { width, height, borderRadius: radius }, style]}>
      <View style={styles.gold} />
      <View
        style={[
          styles.inner,
          { margin: ringWidth, borderRadius: radius - ringWidth, backgroundColor: fill },
          innerStyle,
        ]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    overflow: 'hidden',
    backgroundColor: Palette.navy,
    alignSelf: 'stretch',
  },
  // Covers the right side on a slant so the two colors meet on a diagonal.
  gold: {
    position: 'absolute',
    top: -10,
    bottom: -10,
    left: '52%',
    right: -40,
    backgroundColor: Palette.gold,
    transform: [{ skewX: '-18deg' }],
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
