import type { ConsoleLayoutOptions } from '../../lib/layoutOptions';
import type { GameOutcomeBase } from '../../lib/session';
import type { Rng } from '../../lib/rng';

export interface WheelSpinResult extends GameOutcomeBase {
  outcomeAngle: number;
}

export interface RngWheelHandle {
  spin: () => void;
}

export interface RngWheelProps extends ConsoleLayoutOptions {
  /**
   * Optional callback when the spin animation starts.
   */
  onSpinStart?: () => void;

  /**
   * Optional callback when the spin completes.
   * @param isWin Whether the spin landed on the red segment.
   */
  onSpinComplete?: (isWin: boolean) => void;

  /** Fires whenever the spin animation phase changes. */
  onIsSpinningChange?: (isSpinning: boolean) => void;

  /** Increment to trigger a spin from the parent (e.g. `setN((n) => n + 1)`). */
  spinRequest?: number;

  /**
   * Optional initial spin history.
   */
  initialHistory?: WheelSpinResult[];

  /**
   * Whether the spin button is disabled.
   */
  disabled?: boolean;

  /**
   * Optional CSS class name for the root element.
   */
  className?: string;

  /**
   * Spin animation duration in ms.
   */
  spinDuration?: number;

  /**
   * Initial win chance percentage (default: 10.00).
   */
  initialWinChance?: number;

  /** Injectable random source for outcome rolls. Defaults to `Math.random`. */
  rng?: Rng;
}
