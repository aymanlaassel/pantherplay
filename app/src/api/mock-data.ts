// Fake data for building screens before Supabase exists. Deleted once real calls land.
// Includes hostile cases on purpose, so screens get tested against ugly data early.
import type { Game, GameWithDetails, Location, Profile } from './types';

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

export const mockProfiles: Profile[] = [
  {
    id: 'p-ana',
    full_name: 'Ana Rodriguez',
    avatar_url: 'https://i.pravatar.cc/200?u=p-ana',
    home_campus: 'MMC',
    onboarding_completed_at: '2026-09-01T14:00:00Z',
  },
  {
    // Hostile: no avatar.
    id: 'p-ben',
    full_name: 'Ben Carter',
    avatar_url: null,
    home_campus: 'MMC',
    onboarding_completed_at: '2026-09-02T14:00:00Z',
  },
  {
    // Hostile: very long host name.
    id: 'p-long',
    full_name: 'Maximiliano Alejandro de la Concepción Fernández-Villanueva',
    avatar_url: 'https://i.pravatar.cc/200?u=p-long',
    home_campus: 'BBC',
    onboarding_completed_at: '2026-09-03T14:00:00Z',
  },
];

export const mockLocations: Location[] = [
  { id: 'l-field', campus: 'MMC', name: 'Panther Field', photo_url: 'https://picsum.photos/seed/panther-field/800/400' },
  { id: 'l-rec', campus: 'MMC', name: 'Rec Center Courts', photo_url: 'https://picsum.photos/seed/rec-center/800/400' },
  { id: 'l-bbc', campus: 'BBC', name: 'BBC Recreation Field', photo_url: null },
];

type MockGame = { game: Game; players_joined: number };

function game(
  id: string,
  startsAt: Date,
  fields: Partial<Omit<Game, 'id' | 'starts_at'>>,
  players_joined: number,
): MockGame {
  return {
    game: {
      id,
      host_id: 'p-ana',
      title: 'Pickup soccer',
      sport: 'soccer',
      location_id: 'l-field',
      starts_at: startsAt.toISOString(),
      duration_minutes: 90,
      max_players: 10,
      min_players: 6,
      skill_level: 'intermediate',
      notes: null,
      status: 'open',
      ...fields,
    },
    players_joined,
  };
}

// Built relative to `now` so "starting in 5 minutes" stays true whenever the app runs.
function buildMockGames(now: Date): MockGame[] {
  const tomorrow = new Date(now.getTime() + DAY);
  tomorrow.setHours(8, 0, 0, 0);
  const at = (base: Date, minutes: number) => new Date(base.getTime() + minutes * MINUTE);

  const named: MockGame[] = [
    // Hostile: starts in 5 minutes.
    game('g-soon', at(now, 5), { title: 'Quick 5v5 before class', status: 'confirmed' }, 7),
    // Hostile: full. Stored status 'full' always matches players_joined === max_players.
    game(
      'g-full',
      at(now, 3 * 60),
      { title: 'Basketball run', sport: 'basketball', location_id: 'l-rec', host_id: 'p-ben', status: 'full' },
      10,
    ),
    // Hostile: cancelled.
    game('g-cancelled', at(now, 5 * 60), { title: 'Sunset volleyball', sport: 'volleyball', status: 'cancelled' }, 2),
    // Hostile: 60-character title, long host name, long notes.
    game(
      'g-long',
      at(now, 26 * 60),
      {
        title: 'Saturday Morning Ultimate Frisbee at BBC, All Levels Welcome',
        sport: 'ultimate',
        location_id: 'l-bbc',
        host_id: 'p-long',
        skill_level: 'beginner',
        notes:
          'Bring a light and a dark shirt. We play to 11, win by 2. Water is on you. If it rains we move under the bleachers and wait it out.',
      },
      3,
    ),
  ];

  // Hostile: 47 games on one day (tomorrow, every 15 minutes from 8:00).
  const crowdedDay = Array.from({ length: 47 }, (_, i) =>
    game(`g-day-${i + 1}`, at(tomorrow, i * 15), { title: `Pickup soccer #${i + 1}`, host_id: 'p-ben' }, i % 6),
  );

  return [...named, ...crowdedDay];
}

function withDetails({ game: g, players_joined }: MockGame): GameWithDetails {
  const host = mockProfiles.find((p) => p.id === g.host_id);
  const location = mockLocations.find((l) => l.id === g.location_id);
  if (!host || !location) throw new Error(`Mock game ${g.id} points to a missing host or location`);
  return { ...g, host, location, players_joined };
}

export function getMockGames(now: Date = new Date()): GameWithDetails[] {
  return buildMockGames(now).map(withDetails);
}

export type MockScenario = 'default' | 'empty';

let scenario: MockScenario = 'default';

// Dev-only switch: 'empty' makes listGames() return [] so the empty state can be built.
export function setMockScenario(next: MockScenario) {
  scenario = next;
}

export function getMockScenario(): MockScenario {
  return scenario;
}
