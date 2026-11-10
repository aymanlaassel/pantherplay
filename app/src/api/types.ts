// The contract between screens and the database. Mirrors the W3-04 tables, in camelCase.
import type { SkillLevel } from '@/components/badge-level';
import type { Campus } from '@/components/campus-toggle';

export type GameStatus = 'open' | 'confirmed' | 'full' | 'cancelled' | 'completed';
export type PlayerStatus = 'joined' | 'waitlisted' | 'left' | 'no_show';
export type JoinResult = 'joined' | 'waitlisted';

export type Profile = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  campus: Campus | null;
};

export type Location = {
  id: string;
  campus: Campus;
  name: string;
  photoUrl: string | null;
  latitude: number;
  longitude: number;
};

export type Player = {
  profile: Profile;
  status: PlayerStatus;
  joinedAt: string;
};

// What is stored for a game.
export type GameRecord = {
  id: string;
  host: Profile;
  sport: string;
  location: Location;
  startsAt: string; // ISO time
  durationMinutes: number;
  skillLevel: SkillLevel;
  maxPlayers: number;
  notes: string | null;
  status: GameStatus;
  players: Player[];
};

// What screens get: the record plus two values counted from its players, never stored.
export type Game = GameRecord & {
  spotsFilled: number; // players with status joined
  myStatus: 'joined' | 'waitlisted' | null; // the signed-in user's place in this game
};

export type NewGame = {
  sport: string;
  campus: Campus;
  location: string;
  startsAt: string;
  durationMinutes: number;
  maxPlayers: number;
  skillLevel: SkillLevel;
  notes: string;
};
