// Web has no native picker, so use the browser's own date and time inputs.
import type { CSSProperties } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, space, typography } from '@/theme';

import { dateText, timeText, withDate, withTime } from './when-parse';

type WhenFieldsProps = { value: Date; onChange: (value: Date) => void; error?: string };

export function WhenFields({ value, onChange, error }: WhenFieldsProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.cell}>
          <Text style={styles.label}>Date</Text>
          <input
            type="date"
            aria-label="Date"
            min={dateText(new Date())}
            value={dateText(value)}
            onChange={(event) => onChange(withDate(value, event.target.value))}
            style={inputStyle}
          />
        </View>
        <View style={styles.cell}>
          <Text style={styles.label}>Time</Text>
          <input
            type="time"
            aria-label="Time"
            value={timeText(value)}
            onChange={(event) => onChange(withTime(value, event.target.value))}
            style={inputStyle}
          />
        </View>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const inputStyle: CSSProperties = {
  minHeight: 48,
  padding: `0 ${space[16]}px`,
  borderRadius: radius.card,
  border: `1px solid ${colors.border.default}`,
  backgroundColor: colors.bg.surface,
  fontFamily: typography['Body/Regular'].fontFamily,
  fontSize: typography['Body/Regular'].fontSize,
  color: colors.text.primary,
  width: '100%',
  boxSizing: 'border-box',
};

const styles = StyleSheet.create({
  wrap: { gap: space[8] },
  row: { flexDirection: 'row', gap: space[12] },
  cell: { flex: 1, gap: space[8] },
  label: { ...typography.Label, color: colors.text.primary },
  error: { ...typography.Caption, color: colors.text.error },
});
