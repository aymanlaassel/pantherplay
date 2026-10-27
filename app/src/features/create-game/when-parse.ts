const pad = (n: number) => String(n).padStart(2, '0');

export const dateText = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const timeText = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

// Browser inputs give "" when cleared, so an unparseable value keeps the current date.
export function withDate(current: Date, text: string): Date {
  const [y, m, d] = text.split('-').map(Number);
  if (!y || !m || !d) return current;
  const next = new Date(current);
  next.setFullYear(y, m - 1, d);
  return next;
}

export function withTime(current: Date, text: string): Date {
  const [h, min] = text.split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(min)) return current;
  const next = new Date(current);
  next.setHours(h, min, 0, 0);
  return next;
}
