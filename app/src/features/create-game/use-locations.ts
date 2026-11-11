// Loads the fixed game spots for a campus: the list, null while loading, or 'failed'.
import { useEffect, useState } from 'react';

import { getLocations } from '@/api/locations';
import type { Location } from '@/api/types';
import type { Campus } from '@/components/campus-toggle';

type Result = { campus: Campus; list: Location[] | 'failed' };

export function useLocations(campus: Campus): Location[] | 'failed' | null {
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    // Ignore the answer if the campus changed while it was on its way.
    let current = true;
    getLocations(campus).then(
      (list) => current && setResult({ campus, list }),
      () => current && setResult({ campus, list: 'failed' }),
    );
    return () => {
      current = false;
    };
  }, [campus]);

  return result?.campus === campus ? result.list : null;
}
