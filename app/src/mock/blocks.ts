// Players the signed-in user has blocked, until the blocks table exists (W7-01, #81).
import type { Profile } from '@/api/types';

import { person } from './people';

const seed = (): Profile[] => [person(7, 'Chris M.'), person(8, 'Dana K.')];

const blocked = seed();

export const mockBlocked = () => blocked;
export const resetMockBlocked = (next: Profile[] = seed()) => blocked.splice(0, blocked.length, ...next);
