/** Simulated network latency so loading states are actually visible while the app
 * runs entirely on in-memory mock data. Swap callers to real fetches later and this
 * import disappears with them. */
export function delay(ms = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
