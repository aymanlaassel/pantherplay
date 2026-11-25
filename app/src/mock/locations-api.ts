// A stand-in for src/api/locations.ts that returns the mock spots, for screen tests.
// In a test: jest.mock('@/api/locations', () => require('@/mock/locations-api'));
import { delay } from '@/api/delay';
import type { Location } from '@/api/types';
import type { Campus } from '@/components/campus-toggle';

import { LOCATIONS } from './locations';

export async function getLocations(campus: Campus): Promise<Location[]> {
  await delay();
  return LOCATIONS.filter((l) => l.campus === campus);
}
