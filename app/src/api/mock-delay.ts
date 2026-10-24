// Fake network delay for the mock API, so screens show their loading state.
export const MOCK_DELAY_MS = 400;

export function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
