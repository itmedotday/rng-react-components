import type { Rng } from '../../lib/rng';

export interface PhaserDiceSliderResult {
  outcome: number;
  isWin: boolean;
  target: number;
  isRollOver: boolean;
}

export interface PhaserDiceSliderHandle {
  roll: () => void;
}

export interface PhaserDiceSliderProps {
  onRollStart?: () => void;
  onRollComplete?: (outcome: number, isWin: boolean) => void;
  onIsRollingChange?: (isRolling: boolean) => void;
  /** Increment to trigger a roll from a parent component. */
  rollRequest?: number;
  /** Starting roll target (0.01-99.99). */
  initialTarget?: number;
  /** Start in roll-over mode (win when outcome >= target). */
  initialIsRollOver?: boolean;
  minTarget?: number;
  maxTarget?: number;
  /** Outcome badge animation length in ms. */
  animationDuration?: number;
  /** Maximum rendered width in px (the canvas scales down responsively). */
  width?: number;
  disabled?: boolean;
  /** Hide the DOM target/chance inputs and Roll button when driving rolls externally. */
  showControls?: boolean;
  className?: string;
  rng?: Rng;
}
