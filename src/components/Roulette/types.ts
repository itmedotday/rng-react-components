import type { ConsoleLayoutOptions } from '../../lib/layoutOptions';
import type { GameOutcomeBase } from '../../lib/session';
import type { Rng } from '../../lib/rng';

export type RouletteColor = 'red' | 'black' | 'green';

/** A player's active wager — either on a colour or a specific number (0–36). */
export type RouletteBet =
  | { type: 'color'; color: RouletteColor }
  | { type: 'number'; number: number };

export interface RouletteSpinResult extends GameOutcomeBase {
  number: number;
  color: RouletteColor;
  /** The colour of the prediction at the time of the spin (backward-compat). */
  prediction: RouletteColor;
  /** The full bet that was active when the wheel was spun. */
  bet: RouletteBet;
}

export interface RouletteHandle {
  spin: () => void;
}

export interface RouletteProps extends ConsoleLayoutOptions {
  onSpinStart?: () => void;
  onSpinComplete?: (result: RouletteSpinResult, isWin: boolean) => void;
  onIsSpinningChange?: (isSpinning: boolean) => void;
  spinRequest?: number;
  /** @deprecated Prefer `initialBet`. Sets the initial colour-only prediction. */
  initialPrediction?: RouletteColor;
  /** Initial bet. Takes precedence over `initialPrediction` when provided. */
  initialBet?: RouletteBet;
  initialHistory?: RouletteSpinResult[];
  disabled?: boolean;
  className?: string;
  spinDuration?: number;
  rng?: Rng;
}
