// The parts of send-push that don't talk to the network, so they can be tested on their own.

// A row of the notifications table (contract in W8-04, #100).
export type NotificationRow = {
  id: string;
  user_id: string;
  type: string;
  game_id: string | null;
  title: string;
  body: string;
};

// One message for Expo Push: https://docs.expo.dev/push-notifications/sending-notifications/
export type PushMessage = {
  to: string;
  title: string;
  body: string;
  sound: 'default';
  data: { notificationId: string; type: string; gameId: string | null };
};

// What Expo sends back for each message, in the same order as the messages.
export type PushTicket =
  | { status: 'ok'; id: string }
  | { status: 'error'; message: string; details?: { error?: string } };

// Push only for events that change whether, when or where you show up (#90).
// Everything else (player-joined, player-left-late, friend-playing, rate-host) stays in the app's list only.
// starting-soon needs a scheduler, so it comes later.
export const PUSH_TYPES = ['game-cancelled', 'game-changed', 'waitlist-opened', 'game-confirmed'];

export function shouldPush(type: string): boolean {
  return PUSH_TYPES.includes(type);
}

// One message per phone the user has signed in on.
export function buildMessages(notification: NotificationRow, tokens: string[]): PushMessage[] {
  return tokens.map((token) => ({
    to: token,
    title: notification.title,
    body: notification.body,
    sound: 'default',
    // The app reads this when the notification is tapped, to open the game.
    data: { notificationId: notification.id, type: notification.type, gameId: notification.game_id },
  }));
}

// Tokens Expo says no longer work (the app was deleted, or the phone turned notifications off for good).
// tickets[i] is the answer for tokens[i].
export function invalidTokens(tokens: string[], tickets: PushTicket[]): string[] {
  const invalid: string[] = [];
  tickets.forEach((ticket, index) => {
    if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
      invalid.push(tokens[index]);
    }
  });
  return invalid;
}
