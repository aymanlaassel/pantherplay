// The fixed list of game spots. Returns mock data; replaced by a Supabase read in W3-08.
import type { Campus } from '@/components/campus-toggle';
import { LOCATIONS } from '@/mock/locations';

import { delay } from './delay';
import type { Location } from './types';

export async function getLocations(campus: Campus): Promise<Location[]> {
  await delay();
  return LOCATIONS.filter((l) => l.campus === campus);
}
