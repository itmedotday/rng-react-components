import type { Rng } from '../../lib/rng';

export interface PhaserD20RollResult {
  roll: number;
  isCritical: boolean;
  isFumble: boolean;
}

export interface PhaserD20RollHandle {
  roll: () => void;
}

export interface PhaserD20RollProps {
  onRollStart?: () => void;
  onRollComplete?: (result: PhaserD20RollResult) => void;
  onIsRollingChange?: (isRolling: boolean) => void;
  /** Increment to trigger a roll from a parent component. */
  rollRequest?: number;
  /** Roll animation length in ms. */
  animationDuration?: number;
  /** Maximum rendered die width in px (the canvas is square and scales down responsively). */
  size?: number;
  disabled?: boolean;
  /** Hide the built-in Roll button when driving rolls externally. */
  showRollButton?: boolean;
  className?: string;
  rng?: Rng;
}
