import type { ConsoleLayoutOptions } from '../../lib/layoutOptions';
import type { GameOutcomeBase } from '../../lib/session';
import type { Rng } from '../../lib/rng';

export interface DiceSliderHandle {
  roll: () => void;
}

export interface DiceSliderProps extends ConsoleLayoutOptions {
  /**
   * Optional callback when the roll animation starts.
   */
  onRollStart?: () => void;

  /**
   * Optional callback when the roll completes.
   * @param outcome The final rolled number.
   * @param isWin Whether the roll resulted in a win.
   */
  onRollComplete?: (outcome: number, isWin: boolean) => void;

  /** Fires whenever the roll animation phase changes. */
  onIsRollingChange?: (isRolling: boolean) => void;

  /** Increment to trigger a roll from the parent (e.g. `setN((n) => n + 1)`). */
  rollRequest?: number;

  /**
   * Initial roll history to calculate starting statistics.
   */
  initialHistory?: RollResult[];

  /**
   * Initial roll target value (default: 50.00).
   */
  initialTarget?: number;

  /**
   * Initial roll mode (default: true for Roll Over).
   */
  initialIsRollOver?: boolean;

  /**
   * Whether the slider and controls are disabled.
   */
  disabled?: boolean;

  /**
   * Optional CSS class name for the root element.
   */
  className?: string;

  /**
   * Minimum allowed target value.
   */
  minTarget?: number;

  /**
   * Maximum allowed target value.
   */
  maxTarget?: number;

  /**
   * Roll animation duration in ms (default: 400).
   */
  animationDuration?: number;

  /** Injectable random source for outcome rolls. Defaults to `Math.random`. */
  rng?: Rng;
}

export interface RollResult extends GameOutcomeBase {
  outcome: number;
  target: number;
  isRollOver: boolean;
}
