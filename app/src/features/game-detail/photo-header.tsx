// Figma: Photo button (104:286). The game photo in a split border with back and share buttons.
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { SplitBorder } from '@/components/split-border';
import { colors, radius, space } from '@/theme';

type PhotoHeaderProps = { onBack: () => void };

export function PhotoHeader({ onBack }: PhotoHeaderProps) {
  return (
    <SplitBorder borderWidth={3} borderRadius={radius.card} style={styles.frame}>
      <Image
        source={require('@/assets/images/game-photo-placeholder.png')}
        accessibilityIgnoresInvertColors
        style={styles.photo}
      />
      <View style={styles.buttons}>
        <RoundButton icon="chevronLeft" label="Back" onPress={onBack} />
        <RoundButton icon="share" label="Share" />
      </View>
    </SplitBorder>
  );
}

type RoundButtonProps = { icon: 'chevronLeft' | 'share'; label: string; onPress?: () => void };

function RoundButton({ icon, label, onPress }: RoundButtonProps) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.round}>
      <Icon name={icon} color={colors.icon.active} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden' },
  photo: { width: '100%', height: 176 },
  buttons: {
    position: 'absolute',
    top: space[12],
    left: space[12],
    right: space[12],
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  round: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.bg.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
