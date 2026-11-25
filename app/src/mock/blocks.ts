// Blocks and reports, until their tables exist (W8-01, #81).
import type { ReportReason, ReportTarget } from '@/api/safety';
import type { Profile } from '@/api/types';

import { mockGames } from './games';
import { person } from './people';

type MockReport = { targetType: ReportTarget; targetId: string; reason: ReportReason; details: string | null };

const seed = (): Profile[] => [person(7, 'Chris M.'), person(8, 'Dana K.')];

const blocked = seed();
const reports: MockReport[] = [];

export const mockBlocked = () => blocked;
export const mockReports = () => reports;
export const resetMockBlocked = (next: Profile[] = seed()) => {
  blocked.splice(0, blocked.length, ...next);
  reports.splice(0);
};

// The profile for an id, found among the mock games' hosts and players.
export function mockProfile(id: string): Profile {
  const everyone = mockGames().flatMap((g) => [g.host, ...g.players.map((p) => p.profile)]);
  return everyone.find((p) => p.id === id) ?? { id, fullName: 'Player', avatarUrl: null, campus: null };
}
