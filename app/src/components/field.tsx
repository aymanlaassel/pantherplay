// Figma: Field (240:1128). Labelled text input, or a tappable read-only value when onPress is set.
import { Pressable, StyleSheet, Text, TextInput, View, type KeyboardTypeOptions } from 'react-native';

import { colors, radius, space, typography } from '@/theme';

type FieldProps = {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
  placeholder?: string;
  maxLength?: number;
  error?: string;
  required?: boolean;
  active?: boolean;
  keyboardType?: KeyboardTypeOptions;
};

export function Field({
  label,
  value,
  onChangeText,
  onPress,
  placeholder,
  maxLength,
  error,
  required,
  active,
  keyboardType,
}: FieldProps) {
  const box = [styles.box, active ? styles.boxActive : null, error ? styles.boxError : null];
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{required ? `${label} *` : label}</Text>
      {onPress ? (
        <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${label}: ${value}`} style={box}>
          <Text style={styles.value}>{value}</Text>
        </Pressable>
      ) : (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.muted}
          maxLength={maxLength}
          keyboardType={keyboardType}
          accessibilityLabel={label}
          style={[...box, styles.value]}
        />
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export const inputBox = {
  minHeight: 48,
  paddingHorizontal: space[16],
  borderRadius: radius.card,
  borderWidth: 1,
  borderColor: colors.border.default,
  backgroundColor: colors.bg.surface,
  justifyContent: 'center',
} as const;

const styles = StyleSheet.create({
  wrap: { gap: space[8], flex: 1 },
  label: { ...typography.Label, color: colors.text.primary },
  box: inputBox,
  boxActive: { borderColor: colors.border.navy },
  boxError: { borderColor: colors.text.error },
  value: { ...typography['Body/Regular'], color: colors.text.primary },
  error: { ...typography.Caption, color: colors.text.error },
});
