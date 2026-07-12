import type { ConsoleLayoutOptions } from '../../lib/layoutOptions';
import type { GameOutcomeBase } from '../../lib/session';
import type { Rng } from '../../lib/rng';

export type RouletteColor = 'red' | 'black' | 'green';

/**
 * A bettable spot on the cloth. Outside colour is red/black only;
 * zero is the number spot `0`.
 */
export type RouletteSpot =
  | { type: 'number'; number: number }
  | { type: 'color'; color: 'red' | 'black' }
  | { type: 'dozen'; dozen: 1 | 2 | 3 }
  | { type: 'column'; column: 1 | 2 | 3 }
  | { type: 'parity'; parity: 'even' | 'odd' }
  | { type: 'range'; range: 'low' | 'high' };

/**
 * @deprecated Single-selection wager. Prefer multi-chip placements via the
 * betting board. Kept for `initialBet` / result.bet backward compatibility.
 */
export type RouletteBet =
  | { type: 'color'; color: RouletteColor }
  | { type: 'number'; number: number };

/** One chip (or stack bump) placed on a spot. */
export interface ChipPlacement {
  id: string;
  spot: RouletteSpot;
  amount: number;
}

/** Aggregated chip total on one spot. */
export interface SpotStack {
  spot: RouletteSpot;
  amount: number;
}

/** Per-spot settlement after a spin. */
export interface SpotSettlement {
  spot: RouletteSpot;
  amount: number;
  won: boolean;
  /** Stake + winnings returned for this spot (0 if lost). */
  returned: number;
  /** returned − amount */
  profit: number;
}

export interface RouletteSpinResult extends GameOutcomeBase {
  number: number;
  color: RouletteColor;
  /** Colour of the landed pocket (backward-compat with colour-only prediction). */
  prediction: RouletteColor;
  /**
   * @deprecated Primary/first wager for older consumers. Prefer `settlements`.
   */
  bet: RouletteBet;
  /** Sum of all chips on the table when Play was pressed. */
  totalWagered: number;
  /** Sum of returned amounts across winning spots. */
  totalReturned: number;
  /** totalReturned − totalWagered */
  profit: number;
  settlements: SpotSettlement[];
}

export interface RouletteHandle {
  spin: () => void;
}

export interface RouletteProps extends ConsoleLayoutOptions {
  onSpinStart?: () => void;
  onSpinComplete?: (result: RouletteSpinResult, isWin: boolean) => void;
  onIsSpinningChange?: (isSpinning: boolean) => void;
  spinRequest?: number;
  /** @deprecated Prefer placing chips on the board. Sets an initial colour-only selection. */
  initialPrediction?: RouletteColor;
  /** @deprecated Prefer chip placements. Seeds one stack from a single bet. */
  initialBet?: RouletteBet;
  /** Starting chip denomination. */
  initialChipValue?: number;
  /** Available chip denominations shown in the sidebar. */
  chipValues?: number[];
  initialHistory?: RouletteSpinResult[];
  disabled?: boolean;
  className?: string;
  spinDuration?: number;
  rng?: Rng;
}
