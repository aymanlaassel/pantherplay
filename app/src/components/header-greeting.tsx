// Figma: Header/Greeting (87:14). Top of Discover: greeting, name and the notifications bell.
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, space, typography } from '@/theme';

type HeaderGreetingProps = {
  name: string;
  onBellPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function HeaderGreeting({ name, onBellPress, style }: HeaderGreetingProps) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.text}>
        <Text style={styles.hello}>Hey there,</Text>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
      </View>
      <Pressable
        onPress={onBellPress}
        accessibilityRole="button"
        accessibilityLabel="Notifications"
        hitSlop={space[8]}
        style={({ pressed }) => pressed && styles.pressed}>
        <SymbolView
          name={{ ios: 'bell', android: 'notifications', web: 'notifications' }}
          size={24}
          tintColor={colors.icon.active}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[12] },
  text: { flexShrink: 1, gap: space[4] },
  hello: { ...typography['Body/Regular'], color: colors.text.muted },
  name: { ...typography['Display/Name'], color: colors.text.primary },
  pressed: { opacity: 0.7 },
});
