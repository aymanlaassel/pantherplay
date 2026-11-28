// The signed-in user's profile and onboarding answers, read from and saved to Supabase.
// Everything is keyed on the Supabase user id from lib/auth.ts.
import type { Campus } from '@/components/campus-toggle';
import { getUserId } from '@/lib/auth';
import { endsAt } from '@/lib/format-time';
import { supabase } from '@/lib/supabase';

import { notEnded, startedAfter, toGames } from './games';
import { GAME_COLUMNS, PROFILE_COLUMNS, toProfile, type GameRow, type ProfileRow } from './rows';
import type { Game, MySport, Profile } from './types';

// Postgres's code for text that isn't a valid id, like a mistyped link.
const INVALID_ID = '22P02';

// Called when the last onboarding step is done. Stamps profiles.onboarding_completed_at with the
// current time, so this account skips onboarding on every phone from now on.
export async function finishOnboarding(): Promise<void> {
  const me = await getUserId();
  if (!me) throw new Error('Not signed in');
  const { error } = await supabase
    .from('profiles')
    .update({ onboarding_completed_at: new Date().toISOString() })
    .eq('id', me);
  if (error) throw new Error(error.message);
}

// True once finishOnboarding() has run for this account (on any phone).
export async function hasFinishedOnboarding(): Promise<boolean> {
  const me = await getUserId();
  if (!me) return false;
  const { data, error } = await supabase.from('profiles').select('onboarding_completed_at').eq('id', me).maybeSingle();
  if (error) throw new Error(error.message);
  const row = data as { onboarding_completed_at: string | null } | null;
  return row !== null && row.onboarding_completed_at !== null;
}

// The campus picked in onboarding, or null if not picked yet (or nobody is signed in).
export async function getMyCampus(): Promise<Campus | null> {
  const me = await getUserId();
  if (!me) return null;
  const { data, error } = await supabase.from('profiles').select('campus').eq('id', me).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as { campus: Campus | null } | null)?.campus ?? null;
}

// Onboarding step 1: saves the home campus on the signed-in user's profile.
export async function saveCampus(campus: Campus): Promise<void> {
  const me = await getUserId();
  if (!me) throw new Error('Not signed in');
  const { error } = await supabase.from('profiles').update({ campus }).eq('id', me);
  if (error) throw new Error(error.message);
}

// The sports and levels picked in onboarding (rows of profile_sports). Empty if none yet.
export async function getMySports(): Promise<MySport[]> {
  const me = await getUserId();
  if (!me) return [];
  const { data, error } = await supabase.from('profile_sports').select('sport, level').eq('user_id', me);
  if (error) throw new Error(error.message);
  return data as MySport[];
}

// Onboarding step 2: replaces the signed-in user's sports with this list.
// Removes the old rows first, then adds the new ones, so a sport they unpicked doesn't stay behind.
export async function saveSports(list: MySport[]): Promise<void> {
  const me = await getUserId();
  if (!me) throw new Error('Not signed in');
  const { error: removeError } = await supabase.from('profile_sports').delete().eq('user_id', me);
  if (removeError) throw new Error(removeError.message);
  if (list.length === 0) return;
  const rows = list.map(({ sport, level }) => ({ user_id: me, sport, level }));
  const { error } = await supabase.from('profile_sports').insert(rows);
  if (error) throw new Error(error.message);
}

// The signed-in user's profile: name and photo (from Google or Apple at sign-up) and campus.
// The row is created at sign-up by a database trigger (PR #80), so a missing row is an error.
export async function getProfile(): Promise<Profile> {
  const me = await getUserId();
  if (!me) throw new Error('Not signed in');
  const { data, error } = await supabase.from('profiles').select(PROFILE_COLUMNS).eq('id', me).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Profile not found');
  return toProfile(data as ProfileRow);
}

// Another player's profile, from Supabase. null if nobody has this id (or their account was deleted).
export async function getPlayer(id: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select(PROFILE_COLUMNS).eq('id', id).maybeSingle();
  if (error?.code === INVALID_ID) return null;
  if (error) throw new Error(error.message);
  return data ? toProfile(data as ProfileRow) : null;
}

type PlayedRow = { game: { starts_at: string; duration_minutes: number } };

// How many games this player was in (joined, not waitlisted) that have ended. Cancelled games don't count.
export async function getGamesPlayed(userId: string, now: Date = new Date()): Promise<number> {
  const { data, error } = await supabase
    .from('game_players')
    .select('game:games!inner (starts_at, duration_minutes)')
    .eq('user_id', userId)
    .eq('status', 'joined')
    .neq('game.status', 'cancelled')
    .lt('game.starts_at', now.toISOString());
  if (error) throw new Error(error.message);
  // The database can only filter by start, so drop games still being played.
  return (data as unknown as PlayedRow[]).filter(({ game }) => new Date(endsAt(game.starts_at, game.duration_minutes)) <= now).length;
}

// The signed-in user's games played (see getGamesPlayed). 0 when nobody is signed in.
export async function getMyGamesPlayed(): Promise<number> {
  const me = await getUserId();
  return me ? getGamesPlayed(me) : 0;
}

// My Games: games I host or joined that haven't ended, soonest first. Cancelled games are left out.
export async function getMyGames(now: Date = new Date()): Promise<Game[]> {
  const me = await getUserId();
  if (!me) return [];
  const { data: mine, error: mineError } = await supabase.from('game_players').select('game_id').eq('user_id', me).eq('status', 'joined');
  if (mineError) throw new Error(mineError.message);
  const ids = (mine as { game_id: string }[]).map((row) => row.game_id);
  // Ids come from the database, so they are safe to put in the filter.
  const joined = ids.length > 0 ? `,id.in.(${ids.join(',')})` : '';
  const { data, error } = await supabase
    .from('games')
    .select(GAME_COLUMNS)
    .or(`host_id.eq.${me}${joined}`)
    .neq('status', 'cancelled')
    .gt('starts_at', startedAfter(now))
    .order('starts_at');
  if (error) throw new Error(error.message);
  return notEnded(await toGames(data as unknown as GameRow[]), now);
}
