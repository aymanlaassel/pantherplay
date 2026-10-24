// Types that mirror the database tables in docs/ARCHITECTURE.md (section 5).
// Field names are snake_case because that's what Supabase returns.
// Times are ISO strings from `timestamptz` columns; format them in the device timezone.

export type Campus = 'MMC' | 'BBC';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export type GameStatus = 'open' | 'confirmed' | 'full' | 'cancelled' | 'completed';

export type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  home_campus: Campus;
  onboarding_completed_at: string | null;
};

export type Location = {
  id: string;
  campus: Campus;
  name: string;
  photo_url: string | null;
  latitude: number;
  longitude: number;
};

export type Game = {
  id: string;
  host_id: string;
  sport: string; // SPORTS.code, e.g. 'soccer'
  location_id: string;
  starts_at: string;
  duration_minutes: 60 | 90 | 120;
  max_players: number;
  min_players: number;
  skill_level: SkillLevel;
  notes: string | null;
  status: GameStatus;
};

// What screens get: the game row joined with its host and location,
// plus how many players have joined (a count of `joined` GAME_PLAYERS rows).
export type GameWithDetails = Game & {
  host: Profile;
  location: Location;
  players_joined: number;
};
