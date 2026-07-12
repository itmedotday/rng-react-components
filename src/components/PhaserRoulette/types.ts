import type { Rng } from '../../lib/rng';
import type { RouletteColor } from '../Roulette/types';

export interface PhaserRouletteResult {
  number: number;
  color: RouletteColor;
}

export interface PhaserRouletteHandle {
  spin: () => void;
}

export interface PhaserRouletteProps {
  onSpinStart?: () => void;
  onSpinComplete?: (result: PhaserRouletteResult) => void;
  onIsSpinningChange?: (isSpinning: boolean) => void;
  /** Increment to trigger a spin from a parent component. */
  spinRequest?: number;
  /** Spin animation length in ms. */
  spinDuration?: number;
  /** Maximum rendered wheel width in px (the canvas is square and scales down responsively). */
  size?: number;
  disabled?: boolean;
  /** Hide the built-in Spin button when driving spins externally. */
  showSpinButton?: boolean;
  className?: string;
  rng?: Rng;
}
