/** Deal / reveal cadence for TwentyOne. Zero when reduced motion is preferred. */

export const DEAL_STEP_MS = 240;
export const DEALER_HIT_MS = 320;
export const HOLE_REVEAL_MS = 380;
export const SETTLE_PAUSE_MS = 180;

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function motionDelay(ms: number): number {
  return prefersReducedMotion() ? 0 : ms;
}

export function wait(ms: number): Promise<void> {
  const delay = motionDelay(ms);
  if (delay <= 0) return Promise.resolve();
  return new Promise((resolve) => {
    window.setTimeout(resolve, delay);
  });
}
