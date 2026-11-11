// The sports table (Ricky's reference data). Felipe still has to confirm the v1 list.
// shortcut: hard-coded copy of the table, read it from Supabase in W3-08 if the list starts changing.
import type { Sport } from './types';

export const SPORTS: Sport[] = [
  { code: 'basketball', name: 'Basketball' },
  { code: 'soccer', name: 'Soccer' },
  { code: 'volleyball', name: 'Volleyball' },
  { code: 'tennis', name: 'Tennis' },
  { code: 'pickleball', name: 'Pickleball' },
  { code: 'flag_football', name: 'Flag Football' },
];
