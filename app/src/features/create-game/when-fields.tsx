import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { ButtonOutline } from '@/components/button-outline';
import { Field } from '@/components/field';
import { colors, space, typography } from '@/theme';

type Mode = 'date' | 'time';
type WhenFieldsProps = { value: Date; onChange: (value: Date) => void; error?: string };

const formats: Record<Mode, Intl.DateTimeFormatOptions> = {
  date: { weekday: 'short', month: 'short', day: 'numeric' },
  time: { hour: 'numeric', minute: '2-digit' },
};

export function WhenFields({ value, onChange, error }: WhenFieldsProps) {
  const [open, setOpen] = useState<Mode | null>(null);

  const show = (mode: Mode) => {
    if (Platform.OS !== 'android') return setOpen(open === mode ? null : mode);
    DateTimePickerAndroid.open({ value, mode, onValueChange: (_event, picked) => onChange(picked) });
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {(['date', 'time'] as const).map((mode) => (
          <Field
            key={mode}
            label={mode === 'date' ? 'Date' : 'Time'}
            value={value.toLocaleString(undefined, formats[mode])}
            onPress={() => show(mode)}
            active={open === mode}
          />
        ))}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {open ? (
        <>
          <DateTimePicker
            value={value}
            mode={open}
            display="spinner"
            onValueChange={(_event, picked) => onChange(picked)}
          />
          <ButtonOutline label="Done" onPress={() => setOpen(null)} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space[8] },
  row: { flexDirection: 'row', gap: space[12] },
  error: { ...typography.Caption, color: colors.text.error },
});
