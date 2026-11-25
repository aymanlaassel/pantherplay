import { Alert, Platform } from 'react-native';

type ConfirmOptions = { title: string; message: string; keepLabel: string; confirmLabel: string };

// Asks before a destructive action. Alert.alert is a no-op on web, so ask with the browser's own dialog there.
export function confirmDestructive({ title, message, keepLabel, confirmLabel }: ConfirmOptions, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(title)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: keepLabel, style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
