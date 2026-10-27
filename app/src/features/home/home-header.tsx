// Figma: Screen/Home header. Greeting on the left, notifications and avatar on the right.
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SplitBorder } from '@/components/split-border';
import { colors, space, typography } from '@/theme';

import { Icon } from '@/components/icon';

type HomeHeaderProps = { name: string; onBellPress: () => void };

export function HomeHeader({ name, onBellPress }: HomeHeaderProps) {
  return (
    <View style={styles.row}>
      <View>
        <Text style={styles.greeting}>Good morning,</Text>
        <Text style={styles.name}>{name}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={onBellPress} accessibilityRole="button" accessibilityLabel="Notifications" style={styles.bell}>
          <Icon name="bell" color={colors.icon.active} />
          <View style={styles.dot} />
        </Pressable>
        <SplitBorder borderWidth={3} style={styles.avatar}>
          <Icon name="person" color={colors.icon.active} />
        </SplitBorder>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greeting: { ...typography['Body/Medium'], color: colors.text.muted },
  name: { ...typography['Display/Name'], color: colors.text.primary },
  actions: { flexDirection: 'row', alignItems: 'center', gap: space[12] },
  bell: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', top: 10, right: 11, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brand.gold },
  avatar: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
});
