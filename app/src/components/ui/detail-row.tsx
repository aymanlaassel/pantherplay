import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { FontFamily, Palette } from '@/constants/theme';

type DetailRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  style?: StyleProp<ViewStyle>;
};

/** Icon + text row, e.g. calendar + "Today, 7:00 – 8:00 PM". */
export function DetailRow({ icon, text, style }: DetailRowProps) {
  return (
    <View style={[styles.row, style]}>
      <Ionicons name={icon} size={24} color={Palette.navy} />
      <Text style={styles.text} numberOfLines={2}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  text: {
    flexShrink: 1,
    color: Palette.navy,
    fontSize: 18,
    fontFamily: FontFamily.body,
  },
});
