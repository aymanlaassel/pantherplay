// A simple two-state sheet pinned to the bottom of the screen: collapsed (a peek) or
// expanded. Tap the handle to toggle, or drag the handle area up and down.
// The parent owns `expanded`; a drag that settles on the other state calls onExpandedChange.
// Needs a GestureHandlerRootView above it (the drag uses react-native-gesture-handler).
import { useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { colors, radius, space } from '@/theme';

// A flick faster than this (points per second) picks its direction, whatever the position.
const FLICK_VELOCITY = 500;
const SPRING = { damping: 22, stiffness: 220 } as const;

type BottomSheetProps = {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  collapsedHeight: number;
  expandedHeight: number;
  /** Shown under the handle and draggable with it, e.g. a title. */
  header?: ReactNode;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function BottomSheet({
  expanded,
  onExpandedChange,
  collapsedHeight,
  expandedHeight,
  header,
  children,
  style,
  testID,
}: BottomSheetProps) {
  const height = useSharedValue(expanded ? expandedHeight : collapsedHeight);
  const dragStart = useSharedValue(0);

  // Follow the parent's state (handle taps, a new pin, a finished drag).
  useEffect(() => {
    height.set(withSpring(expanded ? expandedHeight : collapsedHeight, SPRING));
  }, [expanded, collapsedHeight, expandedHeight, height]);

  const pan = usePanGesture({
    activeOffsetY: [-8, 8],
    onBegin: () => {
      'worklet';
      dragStart.set(height.get());
    },
    onUpdate: (e) => {
      'worklet';
      // Dragging up (negative translation) makes the sheet taller.
      const next = dragStart.get() - e.translationY;
      height.set(Math.min(Math.max(next, collapsedHeight), expandedHeight));
    },
    onDeactivate: (e) => {
      'worklet';
      const middle = (collapsedHeight + expandedHeight) / 2;
      let open = height.get() > middle;
      if (e.velocityY < -FLICK_VELOCITY) open = true;
      if (e.velocityY > FLICK_VELOCITY) open = false;
      height.set(withSpring(open ? expandedHeight : collapsedHeight, SPRING));
      scheduleOnRN(onExpandedChange, open);
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({ height: height.get() }));

  return (
    <Animated.View testID={testID} style={[styles.sheet, animatedStyle, style]}>
      <GestureDetector gesture={pan}>
        <View>
          <Pressable
            onPress={() => onExpandedChange(!expanded)}
            accessibilityRole="button"
            accessibilityLabel={expanded ? 'Collapse list' : 'Expand list'}
            accessibilityState={{ expanded }}
            hitSlop={space[8]}
            style={styles.handleArea}>
            <View style={styles.handle} />
          </Pressable>
          {header}
        </View>
      </GestureDetector>
      <View style={styles.body}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bg.surface,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.border.default,
    overflow: 'hidden',
  },
  handleArea: { alignItems: 'center', paddingVertical: space[12] },
  handle: { width: 40, height: 4, borderRadius: radius.pill, backgroundColor: colors.border.default },
  body: { flex: 1 },
});
