import type { Location } from '@/api/types';

const spot = (id: string, campus: Location['campus'], name: string, latitude: number, longitude: number): Location => ({
  id,
  campus,
  name,
  photoUrl: null,
  latitude,
  longitude,
});

export const FIELD = spot('loc-field', 'MMC', 'Panther Field', 25.7563, -80.3755);
export const REC = spot('loc-rec', 'MMC', 'Rec Center Courts', 25.7529, -80.3763);
export const BBC_FIELD = spot('loc-bbc', 'BBC', 'BBC Recreation Field', 25.9111, -80.1389);
// A 60-character place name, to test long text.
export const LONG_NAME = spot('loc-long', 'MMC', 'The Very Long Named Intramural Recreation Field And Lawn Area', 25.755, -80.376);
