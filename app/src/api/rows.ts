// What Supabase sends back (snake_case rows) and how each row becomes a contract type.
// The only place that knows the database's column names.
import type { SkillLevel } from '@/components/badge-level';
import type { Campus } from '@/components/campus-toggle';

import type { Duration, GameRecord, GameStatus, Location, PlayerStatus, Profile, SportCode } from './types';

export type ProfileRow = { id: string; display_name: string; avatar_url: string | null; campus: Campus | null };
export type LocationRow = { id: string; campus: Campus; name: string; photo_url: string | null; latitude: number; longitude: number };

export type GameRow = {
  id: string;
  starts_at: string;
  duration_minutes: Duration;
  skill_level: SkillLevel;
  max_players: number;
  notes: string | null;
  status: GameStatus;
  host: ProfileRow;
  sport: { code: SportCode; name: string };
  location: LocationRow;
  players: { status: PlayerStatus; joined_at: string; profile: ProfileRow }[];
};

const PROFILE_COLUMNS = 'id, display_name, avatar_url, campus';
export const LOCATION_COLUMNS = 'id, campus, name, photo_url, latitude, longitude';

// One request for a game and everything its card and page show. `!host_id` / `!user_id` say which
// link to profiles to follow; `!inner` lets getGames filter games by their location's campus.
export const GAME_COLUMNS = `
  id, starts_at, duration_minutes, skill_level, max_players, notes, status,
  host:profiles!host_id (${PROFILE_COLUMNS}),
  sport:sports (code, name),
  location:locations!inner (${LOCATION_COLUMNS}),
  players:game_players (status, joined_at, profile:profiles!user_id (${PROFILE_COLUMNS}))
`;

export function toProfile(row: ProfileRow): Profile {
  return { id: row.id, fullName: row.display_name, avatarUrl: row.avatar_url, campus: row.campus };
}

export function toLocation(row: LocationRow): Location {
  return { id: row.id, campus: row.campus, name: row.name, photoUrl: row.photo_url, latitude: row.latitude, longitude: row.longitude };
}

export function toGameRecord(row: GameRow): GameRecord {
  return {
    id: row.id,
    host: toProfile(row.host),
    sport: row.sport,
    location: toLocation(row.location),
    startsAt: row.starts_at,
    durationMinutes: row.duration_minutes,
    skillLevel: row.skill_level,
    maxPlayers: row.max_players,
    notes: row.notes,
    status: row.status,
    players: row.players.map((p) => ({ profile: toProfile(p.profile), status: p.status, joinedAt: p.joined_at })),
  };
}
