// Read functions for campus locations. Mock data for now, Supabase later; keep the
// names, arguments and return types the same.
import { mockLocations } from './mock-data';
import { delay, MOCK_DELAY_MS } from './mock-delay';
import type { Location } from './types';

// Every fixed campus location (the pins on the Map tab).
export async function listLocations(): Promise<Location[]> {
  await delay(MOCK_DELAY_MS);
  return mockLocations.map((l) => ({ ...l }));
}
