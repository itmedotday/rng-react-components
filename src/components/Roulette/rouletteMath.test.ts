import { describe, expect, it } from 'vitest';
import {
  betToSpot,
  resolveRouletteColor,
  settleStacks,
  spotHits,
  spotKey,
  spotOdds,
} from './rouletteMath';

describe('rouletteMath', () => {
  it('resolves pocket colours', () => {
    expect(resolveRouletteColor(0)).toBe('green');
    expect(resolveRouletteColor(1)).toBe('red');
    expect(resolveRouletteColor(2)).toBe('black');
  });

  it('hits straight, colour, dozen, column, parity, and range spots', () => {
    expect(spotHits(17, { type: 'number', number: 17 })).toBe(true);
    expect(spotHits(17, { type: 'color', color: 'black' })).toBe(true);
    expect(spotHits(17, { type: 'dozen', dozen: 2 })).toBe(true);
    expect(spotHits(17, { type: 'column', column: 2 })).toBe(true);
    expect(spotHits(17, { type: 'parity', parity: 'odd' })).toBe(true);
    expect(spotHits(17, { type: 'range', range: 'low' })).toBe(true);
    expect(spotHits(0, { type: 'color', color: 'red' })).toBe(false);
    expect(spotHits(0, { type: 'parity', parity: 'even' })).toBe(false);
  });

  it('settles multiple stacks independently', () => {
    const settlements = settleStacks(
      [
        { spot: { type: 'number', number: 17 }, amount: 10 },
        { spot: { type: 'color', color: 'black' }, amount: 5 },
        { spot: { type: 'color', color: 'red' }, amount: 5 },
      ],
      17,
    );
    expect(settlements[0]).toMatchObject({ won: true, returned: 360, profit: 350 });
    expect(settlements[1]).toMatchObject({ won: true, returned: 10, profit: 5 });
    expect(settlements[2]).toMatchObject({ won: false, returned: 0, profit: -5 });
  });

  it('maps legacy bets and odds', () => {
    expect(spotKey(betToSpot({ type: 'color', color: 'green' }))).toBe('n:0');
    expect(spotOdds({ type: 'number', number: 1 })).toBe(35);
    expect(spotOdds({ type: 'dozen', dozen: 1 })).toBe(2);
  });
});
