// Figma: Textarea (240:1146). Multi-line text input, e.g. game notes.
import { StyleSheet, TextInput, type StyleProp, type TextStyle } from 'react-native';

import { INPUT_RADIUS } from '@/components/field';
import { colors, space, typography } from '@/theme';

type TextareaProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  style?: StyleProp<TextStyle>;
};

export function Textarea({ value, onChangeText, placeholder, maxLength, style }: TextareaProps) {
  return (
    <TextInput
      multiline
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.text.muted}
      maxLength={maxLength}
      textAlignVertical="top"
      style={[styles.box, style]}
    />
  );
}

const styles = StyleSheet.create({
  box: {
    ...typography['Body/Regular'],
    lineHeight: undefined, // the theme's 100% line height clips wrapped lines
    color: colors.text.primary,
    minHeight: 96,
    padding: space[12],
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: INPUT_RADIUS,
    backgroundColor: colors.bg.surface,
  },
});
