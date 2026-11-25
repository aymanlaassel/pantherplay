import { confirmDestructive } from '@/lib/confirm';

export function confirmDiscard(onDiscard: () => void) {
  confirmDestructive(
    { title: 'Discard this game?', message: 'Your changes will be lost.', keepLabel: 'Keep editing', confirmLabel: 'Discard' },
    onDiscard,
  );
}
