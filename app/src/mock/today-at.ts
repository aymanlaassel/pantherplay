// Mock games happen today at the given time, so they always pass the "today" filter.
export function todayAt(hour: number, minute = 0): string {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}
