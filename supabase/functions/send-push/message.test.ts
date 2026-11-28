// Run from this folder (so Deno finds deno.json): cd supabase/functions/send-push && deno test
import { assertEquals } from '@std/assert';

import { buildMessages, invalidTokens, shouldPush, type NotificationRow } from './message.ts';

const cancelled: NotificationRow = {
  id: 'n1',
  user_id: 'u1',
  type: 'game-cancelled',
  game_id: 'g1',
  title: 'Game cancelled',
  body: 'Pickup soccer at Panther Field on Sat 6:00 PM was cancelled by the host.',
};

Deno.test('a game-cancelled notification becomes one message per phone', () => {
  assertEquals(buildMessages(cancelled, ['ExponentPushToken[a]', 'ExponentPushToken[b]']), [
    {
      to: 'ExponentPushToken[a]',
      title: 'Game cancelled',
      body: 'Pickup soccer at Panther Field on Sat 6:00 PM was cancelled by the host.',
      sound: 'default',
      data: { notificationId: 'n1', type: 'game-cancelled', gameId: 'g1' },
    },
    {
      to: 'ExponentPushToken[b]',
      title: 'Game cancelled',
      body: 'Pickup soccer at Panther Field on Sat 6:00 PM was cancelled by the host.',
      sound: 'default',
      data: { notificationId: 'n1', type: 'game-cancelled', gameId: 'g1' },
    },
  ]);
});

Deno.test('no phones means no messages', () => {
  assertEquals(buildMessages(cancelled, []), []);
});

Deno.test('only events that change whether, when or where you show up are pushed', () => {
  for (const type of ['game-cancelled', 'game-changed', 'waitlist-opened', 'game-confirmed']) {
    assertEquals(shouldPush(type), true, type);
  }
  for (const type of ['player-joined', 'player-left-late', 'starting-soon', 'friend-playing', 'rate-host']) {
    assertEquals(shouldPush(type), false, type);
  }
});

Deno.test('only tokens Expo reports as not registered are invalid', () => {
  const tokens = ['ExponentPushToken[ok]', 'ExponentPushToken[gone]', 'ExponentPushToken[busy]'];
  const tickets = [
    { status: 'ok' as const, id: 't1' },
    { status: 'error' as const, message: 'not registered', details: { error: 'DeviceNotRegistered' } },
    { status: 'error' as const, message: 'too many', details: { error: 'MessageRateExceeded' } },
  ];
  assertEquals(invalidTokens(tokens, tickets), ['ExponentPushToken[gone]']);
});
