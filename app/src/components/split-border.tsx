// The brand's signature outline: navy on one side, gold on the other, meeting on a hard
// diagonal. Figma draws it as a linear gradient at a fixed angle in pixel space, so the
// angle must not change with the box's shape. We measure the box with onLayout and draw
// the stroke with react-native-svg using a userSpaceOnUse gradient, which works in pixels.
// (expo-linear-gradient uses 0..1 start/end points, so its angle drifts on wide boxes.)
import { useId, useState, type PropsWithChildren } from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { colors, radius } from '@/theme';

// Gradient direction from Figma. The export is rounded, so normalize it to a true unit
// vector; otherwise the 0.5 stop lands a hair off the box's center.
const FIGMA_DIRECTION = { x: 0.857, y: 0.514 };
const FIGMA_LENGTH = Math.hypot(FIGMA_DIRECTION.x, FIGMA_DIRECTION.y);
export const SPLIT_DIRECTION = {
  x: FIGMA_DIRECTION.x / FIGMA_LENGTH,
  y: FIGMA_DIRECTION.y / FIGMA_LENGTH,
} as const;

/**
 * Where the gradient line ends for a box of the given size, starting from (0, 0).
 * The line is long enough that the whole box projects onto it, so the 0.5 stop
 * (the navy/gold split) always passes through the box's center.
 */
export function splitGradientEnd(width: number, height: number) {
  const length = width * SPLIT_DIRECTION.x + height * SPLIT_DIRECTION.y;
  return { x: length * SPLIT_DIRECTION.x, y: length * SPLIT_DIRECTION.y };
}

type SplitBorderProps = PropsWithChildren<{
  /** Stroke thickness in px. */
  borderWidth?: number;
  /** Corner radius. Defaults to a full pill. */
  borderRadius?: number;
  /** Fill inside the border. Defaults to transparent. */
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}>;

export function SplitBorder({
  borderWidth = 2,
  borderRadius = radius.pill,
  backgroundColor,
  style,
  testID,
  children,
}: SplitBorderProps) {
  const gradientId = useId(); // unique per instance, or two borders on one screen would share one gradient
  const [size, setSize] = useState({ width: 0, height: 0 });

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width !== size.width || height !== size.height) setSize({ width, height });
  };

  const { width, height } = size;
  const end = splitGradientEnd(width, height);
  // Inset by half the stroke so the whole stroke stays inside the box.
  const inset = borderWidth / 2;
  const rx = Math.max(Math.min(borderRadius, Math.min(width, height) / 2) - inset, 0);

  return (
    <View testID={testID} onLayout={onLayout} style={[{ borderRadius, backgroundColor }, style]}>
      {width > 0 && height > 0 && (
        <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            <LinearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={end.x} y2={end.y}>
              <Stop offset={0} stopColor={colors.border.navy} />
              <Stop offset={0.5} stopColor={colors.border.navy} />
              <Stop offset={0.5} stopColor={colors.border.gold} />
              <Stop offset={1} stopColor={colors.border.gold} />
            </LinearGradient>
          </Defs>
          <Rect
            x={inset}
            y={inset}
            width={width - borderWidth}
            height={height - borderWidth}
            rx={rx}
            ry={rx}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={borderWidth}
          />
        </Svg>
      )}
      {children}
    </View>
  );
}
