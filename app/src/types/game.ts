export type Sport = 'Basketball' | 'Soccer' | 'Volleyball' | 'Spikeball';

/** 'All' plus every Sport, in the order the filter chips show them. */
export type SportFilter = 'All' | Sport;

export const SPORT_FILTERS: SportFilter[] = ['All', 'Basketball', 'Soccer', 'Volleyball', 'Spikeball'];

export type Skill = 'Beginner' | 'Intermediate' | 'Advanced';

export type Campus = 'MMC' | 'BBC';

export const SPORT_EMOJI: Record<Sport, string> = {
  Basketball: '🏀',
  Soccer: '⚽',
  Volleyball: '🏐',
  Spikeball: '🟡',
};

export type Game = {
  id: string;
  sport: Sport;
  title: string;
  location: string;
  campus: Campus;
  /** Human-readable time range, e.g. "Today, 7:00 – 8:00 PM". */
  time: string;
  skill: Skill;
  joined: number;
  cap: number;
  /** Initials of joined players, in join order. */
  players: string[];
  /** Short status shown as a pill in lists, e.g. "Starting soon". */
  status?: string;
  lat: number;
  lng: number;
};

export function spotsLeft(game: Game) {
  return Math.max(game.cap - game.joined, 0);
}
