// send-push: runs when a row is added to notifications (a database webhook calls it), and sends
// that notification to every phone the user is signed in on, through Expo Push.
// Setup (webhook, secrets): docs/push-notifications-setup.md
import { createClient } from '@supabase/supabase-js';

import { buildMessages, invalidTokens, shouldPush, type NotificationRow, type PushTicket } from './message.ts';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

// What a Supabase database webhook sends for an insert.
type WebhookPayload = { type: string; table: string; record: NotificationRow };

// Secrets come from the function's settings, never from the repo. Supabase fills in the first two.
const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const WEBHOOK_SECRET = Deno.env.get('PUSH_WEBHOOK_SECRET');
const EXPO_ACCESS_TOKEN = Deno.env.get('EXPO_ACCESS_TOKEN'); // optional: only if Expo's push security is on

function reply(status: number, message: string): Response {
  return new Response(JSON.stringify({ message }), { status, headers: { 'Content-Type': 'application/json' } });
}

Deno.serve(async (request) => {
  // Only our database webhook knows this secret, so nobody else can make the function send pushes.
  if (!WEBHOOK_SECRET || request.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
    return reply(401, 'Not allowed');
  }

  const payload: WebhookPayload = await request.json();
  if (payload.type !== 'INSERT' || payload.table !== 'notifications') {
    return reply(200, 'Ignored: not a new notification');
  }
  const notification = payload.record;
  if (!shouldPush(notification.type)) {
    return reply(200, `Ignored: ${notification.type} is in-app only`);
  }

  // The user's phones. push_tokens is filled by the app after they allow notifications (W8-17).
  const { data, error } = await supabase.from('push_tokens').select('token').eq('user_id', notification.user_id);
  if (error) return reply(500, error.message);
  const tokens = (data as { token: string }[]).map((row) => row.token);
  if (tokens.length === 0) return reply(200, 'No phones to send to');

  // Expo takes up to 100 messages at once; one person won't have that many phones.
  const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (EXPO_ACCESS_TOKEN) headers.Authorization = `Bearer ${EXPO_ACCESS_TOKEN}`;
  const response = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(buildMessages(notification, tokens)),
  });
  if (!response.ok) return reply(502, `Expo Push answered ${response.status}`);
  const { data: tickets } = (await response.json()) as { data: PushTicket[] };

  // Forget tokens that will never work again, so we stop sending to them.
  const invalid = invalidTokens(tokens, tickets);
  if (invalid.length > 0) {
    const { error: deleteError } = await supabase.from('push_tokens').delete().in('token', invalid);
    if (deleteError) return reply(500, deleteError.message);
  }

  return reply(200, `Sent to ${tokens.length - invalid.length} of ${tokens.length} phones`);
});
