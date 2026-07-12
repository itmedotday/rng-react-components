import type {
  RouletteBet,
  RouletteColor,
  RouletteSpot,
  SpotSettlement,
  SpotStack,
} from './types';

/** Standard European single-zero wheel order (clockwise from top). */
export const WHEEL_SEQUENCE = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
  16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
] as const;

export const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

/** Default chip denominations for the sidebar strip. */
export const DEFAULT_CHIP_VALUES = [1, 5, 10, 25, 100, 500, 1000, 5000];

/**
 * Standard table layout (top → bottom rows):
 *   3 6 9 … 36
 *   2 5 8 … 35
 *   1 4 7 … 34
 */
export const NUMBER_ROWS: number[][] = [
  [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
  [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
  [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
];

export function resolveRouletteColor(value: number): RouletteColor {
  if (value === 0) return 'green';
  return RED_NUMBERS.has(value) ? 'red' : 'black';
}

export function spotKey(spot: RouletteSpot): string {
  switch (spot.type) {
    case 'number':
      return `n:${spot.number}`;
    case 'color':
      return `c:${spot.color}`;
    case 'dozen':
      return `d:${spot.dozen}`;
    case 'column':
      return `col:${spot.column}`;
    case 'parity':
      return `p:${spot.parity}`;
    case 'range':
      return `r:${spot.range}`;
    default: {
      const _exhaustive: never = spot;
      return _exhaustive;
    }
  }
}

/** True payout multiplier (profit only — stake is returned separately on win). */
export function spotOdds(spot: RouletteSpot): number {
  switch (spot.type) {
    case 'number':
      return 35;
    case 'color':
    case 'parity':
    case 'range':
      return 1;
    case 'dozen':
    case 'column':
      return 2;
    default: {
      const _exhaustive: never = spot;
      return _exhaustive;
    }
  }
}

export function spotHits(landed: number, spot: RouletteSpot): boolean {
  const color = resolveRouletteColor(landed);
  switch (spot.type) {
    case 'number':
      return spot.number === landed;
    case 'color':
      return color === spot.color;
    case 'dozen': {
      if (landed === 0) return false;
      const dozen = (Math.ceil(landed / 12) || 1) as 1 | 2 | 3;
      return dozen === spot.dozen;
    }
    case 'column': {
      if (landed === 0) return false;
      // Column 1 = 1,4,7…; column 2 = 2,5,8…; column 3 = 3,6,9…
      const column = (((landed - 1) % 3) + 1) as 1 | 2 | 3;
      return column === spot.column;
    }
    case 'parity':
      if (landed === 0) return false;
      return spot.parity === 'even' ? landed % 2 === 0 : landed % 2 === 1;
    case 'range':
      if (landed === 0) return false;
      return spot.range === 'low' ? landed <= 18 : landed >= 19;
    default: {
      const _exhaustive: never = spot;
      return _exhaustive;
    }
  }
}

export function settleStacks(
  stacks: readonly SpotStack[],
  landed: number,
): SpotSettlement[] {
  return stacks.map((stack) => {
    const won = spotHits(landed, stack.spot);
    const returned = won ? stack.amount * (spotOdds(stack.spot) + 1) : 0;
    return {
      spot: stack.spot,
      amount: stack.amount,
      won,
      returned,
      profit: returned - stack.amount,
    };
  });
}

export function stacksFromPlacements(
  placements: ReadonlyMap<string, SpotStack>,
): SpotStack[] {
  return Array.from(placements.values()).filter((s) => s.amount > 0);
}

export function totalWager(stacks: readonly SpotStack[]): number {
  return stacks.reduce((sum, s) => sum + s.amount, 0);
}

/** Map legacy single bet → a spot (green colour becomes number 0). */
export function betToSpot(bet: RouletteBet): RouletteSpot {
  if (bet.type === 'number') return { type: 'number', number: bet.number };
  if (bet.color === 'green') return { type: 'number', number: 0 };
  return { type: 'color', color: bet.color };
}

/** Best-effort single bet for backward-compat result.bet. */
export function spotToLegacyBet(spot: RouletteSpot): RouletteBet {
  switch (spot.type) {
    case 'number':
      return { type: 'number', number: spot.number };
    case 'color':
      return { type: 'color', color: spot.color };
    case 'dozen':
      return { type: 'number', number: (spot.dozen - 1) * 12 + 1 };
    case 'column':
      return { type: 'number', number: spot.column };
    case 'parity':
      return { type: 'color', color: 'red' };
    case 'range':
      return { type: 'color', color: 'black' };
    default: {
      const _exhaustive: never = spot;
      return _exhaustive;
    }
  }
}

export function formatChipAmount(n: number): string {
  if (n >= 1_000_000_000) return `${n / 1_000_000_000}B`;
  if (n >= 1_000_000) return `${n / 1_000_000}M`;
  if (n >= 1_000) return `${n / 1_000}K`;
  return String(n);
}

export function spotLabel(spot: RouletteSpot): string {
  switch (spot.type) {
    case 'number':
      return `#${spot.number}`;
    case 'color':
      return spot.color.toUpperCase();
    case 'dozen':
      return spot.dozen === 1 ? '1 to 12' : spot.dozen === 2 ? '13 to 24' : '25 to 36';
    case 'column':
      return `Col ${spot.column} 2:1`;
    case 'parity':
      return spot.parity === 'even' ? 'Even' : 'Odd';
    case 'range':
      return spot.range === 'low' ? '1 to 18' : '19 to 36';
    default: {
      const _exhaustive: never = spot;
      return _exhaustive;
    }
  }
}
