import { useState } from 'react';

export function Probe({ on }: { on: boolean }) {
  if (on) useState(0);
  return null;
}
