import { Alert, Platform } from 'react-native';

// Alert.alert is a no-op on web, so ask with the browser's own dialog there.
export function confirmDiscard(onDiscard: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm('Discard this game?')) onDiscard();
    return;
  }
  Alert.alert('Discard this game?', 'Your changes will be lost.', [
    { text: 'Keep editing', style: 'cancel' },
    { text: 'Discard', style: 'destructive', onPress: onDiscard },
  ]);
}
