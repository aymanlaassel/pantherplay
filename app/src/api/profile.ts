// Mock until Supabase is wired in (W3-08). Then these read and write profiles.onboarding_completed_at.
// For now the time is saved on the phone, so reopening the app still skips onboarding.
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getUserId } from '@/lib/auth';
import { endsAt } from '@/lib/format-time';
import { supabase } from '@/lib/supabase';
import { ME } from '@/mock/people';

import { delay } from './delay';
import { notEnded, startedAfter, toGames } from './games';
import { GAME_COLUMNS, PROFILE_COLUMNS, toProfile, type GameRow, type ProfileRow } from './rows';
import type { Game, Profile } from './types';

// Postgres's code for text that isn't a valid id, like a mistyped link.
const INVALID_ID = '22P02';
const ONBOARDING_KEY = 'mock:onboarding_completed_at';

// Called when the last onboarding step is done. Stamps the current time.
export async function finishOnboarding(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, new Date().toISOString());
}

// True once finishOnboarding() has run.
export async function hasFinishedOnboarding(): Promise<boolean> {
  const completedAt = await AsyncStorage.getItem(ONBOARDING_KEY);
  return completedAt !== null;
}

// The signed-in user's profile. W3-08 reads it from the profiles table by the Supabase user id.
export async function getProfile(): Promise<Profile> {
  await delay();
  return ME;
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
