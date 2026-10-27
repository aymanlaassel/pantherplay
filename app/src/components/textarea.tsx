// Figma: Textarea (240:1146). Multiline input with a live character count.
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { inputBox } from '@/components/field';
import { colors, space, typography } from '@/theme';

type TextareaProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  maxLength: number;
  placeholder?: string;
  error?: string;
};

export function Textarea({ label, value, onChangeText, maxLength, placeholder, error }: TextareaProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        multiline
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.muted}
        accessibilityLabel={label}
        style={[styles.input, error ? styles.inputError : null]}
      />
      <View style={styles.footer}>
        <Text style={styles.error}>{error ?? ''}</Text>
        <Text style={styles.count}>{`${value.length} / ${maxLength}`}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space[8] },
  label: { ...typography.Label, color: colors.text.primary },
  input: {
    ...inputBox,
    ...typography['Body/Regular'],
    lineHeight: 20,
    minHeight: 96,
    paddingVertical: space[12],
    textAlignVertical: 'top',
    color: colors.text.primary,
  },
  inputError: { borderColor: colors.text.error },
  footer: { flexDirection: 'row', justifyContent: 'space-between' },
  error: { ...typography.Caption, color: colors.text.error, flex: 1 },
  count: { ...typography.Caption, color: colors.text.muted },
});
