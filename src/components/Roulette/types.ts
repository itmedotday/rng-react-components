import type { ConsoleLayoutOptions } from '../../lib/layoutOptions';
import type { GameOutcomeBase } from '../../lib/session';
import type { Rng } from '../../lib/rng';

export type RouletteColor = 'red' | 'black' | 'green';

export interface RouletteSpinResult extends GameOutcomeBase {
  number: number;
  color: RouletteColor;
  prediction: RouletteColor;
}

export interface RouletteHandle {
  spin: () => void;
}

export interface RouletteProps extends ConsoleLayoutOptions {
  onSpinStart?: () => void;
  onSpinComplete?: (result: RouletteSpinResult, isWin: boolean) => void;
  onIsSpinningChange?: (isSpinning: boolean) => void;
  spinRequest?: number;
  initialPrediction?: RouletteColor;
  initialHistory?: RouletteSpinResult[];
  disabled?: boolean;
  className?: string;
  spinDuration?: number;
  rng?: Rng;
}
