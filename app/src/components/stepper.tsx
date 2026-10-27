// Figma: Stepper (240:1137). Minus/plus around a number, clamped to [min, max].
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, space, typography } from '@/theme';

type StepperProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
};

export function Stepper({ label, value, min, max, onChange }: StepperProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <StepButton symbol="-" name={`Decrease ${label}`} disabled={value <= min} onPress={() => onChange(value - 1)} />
        <Text accessibilityLabel={`${label}: ${value}`} style={styles.value}>
          {value}
        </Text>
        <StepButton symbol="+" name={`Increase ${label}`} disabled={value >= max} onPress={() => onChange(value + 1)} />
      </View>
    </View>
  );
}

type StepButtonProps = { symbol: string; name: string; disabled: boolean; onPress: () => void };

function StepButton({ symbol, name, disabled, onPress }: StepButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={name}
      accessibilityState={{ disabled }}
      style={[styles.button, disabled && styles.disabled]}>
      <Text style={styles.symbol}>{symbol}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space[8] },
  label: { ...typography.Label, color: colors.text.primary },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[20] },
  button: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.4 },
  symbol: { ...typography.Button, color: colors.text.primary },
  value: { ...typography.Price, color: colors.text.primary, minWidth: 32, textAlign: 'center' },
});
