// Figma: Stepper (240:1137). "8 players" with a minus and a plus button.
// The buttons disable at min and max so the value can't leave the range.
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { INPUT_RADIUS } from '@/components/field';
import { colors, radius, space, typography } from '@/theme';

type StepperProps = {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  /** Text after the number, e.g. "players". */
  unit?: string;
  style?: StyleProp<ViewStyle>;
};

export function Stepper({ value, onChange, min, max, unit, style }: StepperProps) {
  const canDecrease = value > min;
  const canIncrease = value < max;
  return (
    <View style={[styles.box, style]}>
      <Text style={styles.value}>{unit ? `${value} ${unit}` : value}</Text>
      <Pressable
        onPress={() => onChange(value - 1)}
        disabled={!canDecrease}
        accessibilityRole="button"
        accessibilityLabel="Decrease"
        accessibilityState={{ disabled: !canDecrease }}
        style={[styles.button, styles.minus, !canDecrease && styles.disabled]}>
        <Text style={[styles.sign, styles.minusSign]}>−</Text>
      </Pressable>
      <Pressable
        onPress={() => onChange(value + 1)}
        disabled={!canIncrease}
        accessibilityRole="button"
        accessibilityLabel="Increase"
        accessibilityState={{ disabled: !canIncrease }}
        style={[styles.button, styles.plus, !canIncrease && styles.disabled]}>
        <Text style={[styles.sign, styles.plusSign]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[8],
    paddingLeft: space[12],
    paddingRight: space[8],
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: INPUT_RADIUS,
    backgroundColor: colors.bg.surface,
  },
  value: { ...typography['Body/Medium'], color: colors.text.primary, flex: 1 },
  button: { width: 32, height: 32, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  minus: { backgroundColor: colors.bg.neutral },
  plus: { backgroundColor: colors.bg.brand },
  sign: { ...typography.Button, lineHeight: undefined },
  minusSign: { color: colors.text.primary },
  plusSign: { color: colors.text.inverse },
  disabled: { opacity: 0.4 },
});
