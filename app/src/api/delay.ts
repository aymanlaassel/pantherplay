// The short wait that makes mock calls feel like a network, so loading states can be built.
const MOCK_DELAY_MS = 300;

export const delay = () => new Promise<void>((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
