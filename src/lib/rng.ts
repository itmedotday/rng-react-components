/** Returns a uniform random number in [0, 1). */
export type Rng = () => number;

export const defaultRng: Rng = () => Math.random();

export function resolveRng(rng?: Rng): Rng {
  return rng ?? defaultRng;
}
