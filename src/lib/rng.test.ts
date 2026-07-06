import { describe, expect, it } from 'vitest';
import { defaultRng, resolveRng } from './rng';

describe('resolveRng', () => {
  it('returns defaultRng when no adapter is provided', () => {
    expect(resolveRng()).toBe(defaultRng);
  });

  it('returns the provided adapter', () => {
    const fixed = () => 0.42;
    expect(resolveRng(fixed)).toBe(fixed);
  });

  it('fixed adapter produces deterministic values', () => {
    const rng = resolveRng(() => 0.25);
    expect(rng()).toBe(0.25);
    expect(rng()).toBe(0.25);
  });
});
