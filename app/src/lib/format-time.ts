// Timestamps are stored as UTC; these show them in the device timezone.
export const endsAt = (startsAt: string, durationMinutes: number): string =>
  new Date(new Date(startsAt).getTime() + durationMinutes * 60_000).toISOString();

export function formatTimeRange(startsAt: string, endsAt: string): string {
  const format = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return `${format(startsAt)} - ${format(endsAt)}`;
}

// "Today" for a time today, otherwise a short date like "Thu, Nov 27".
export function formatDay(iso: string): string {
  const date = new Date(iso);
  if (date.toDateString() === new Date().toDateString()) return 'Today';
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}
