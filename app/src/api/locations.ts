// The fixed list of game spots, read from the locations table.
import type { Campus } from '@/components/campus-toggle';
import { supabase } from '@/lib/supabase';

import { LOCATION_COLUMNS, toLocation, type LocationRow } from './rows';
import type { Location } from './types';

// The spots on one campus, by name.
export async function getLocations(campus: Campus): Promise<Location[]> {
  const { data, error } = await supabase.from('locations').select(LOCATION_COLUMNS).eq('campus', campus).order('name');
  if (error) throw new Error(error.message);
  return (data as LocationRow[]).map(toLocation);
}
