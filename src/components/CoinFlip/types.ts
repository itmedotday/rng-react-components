import type { ConsoleLayoutOptions } from '../../lib/layoutOptions';
import type { GameOutcomeBase } from '../../lib/session';
import type { Rng } from '../../lib/rng';

export type CoinSide = 'orange' | 'blue';

export interface CoinFlipResult extends GameOutcomeBase {
  landed: CoinSide;
  prediction: CoinSide;
}

export interface CoinFlipHandle {
  flip: () => void;
}

/** @deprecated Use `CoinFlipHandle` instead. */
export type ClickToFlipCoinHandle = CoinFlipHandle;

export interface CoinFlipProps {
  onFlipStart?: () => void;
  onFlipComplete?: (landed: CoinSide) => void;
  onIsFlippingChange?: (isFlipping: boolean) => void;
  flipRequest?: number;
  disabled?: boolean;
  className?: string;
  animationDuration?: number;
  /** Injectable random source for outcome rolls. Defaults to `Math.random`. */
  rng?: Rng;
}

/** @deprecated Use `CoinFlipProps` instead. */
export type ClickToFlipCoinProps = CoinFlipProps;

export interface CoinFlipConsoleHandle {
  flip: () => void;
}

export interface CoinFlipConsoleProps extends ConsoleLayoutOptions {
  onFlipStart?: () => void;
  onFlipComplete?: (landed: CoinSide, isWin: boolean) => void;
  onIsFlippingChange?: (isFlipping: boolean) => void;
  flipRequest?: number;
  initialPrediction?: CoinSide;
  initialHistory?: CoinFlipResult[];
  disabled?: boolean;
  className?: string;
  animationDuration?: number;
  rng?: Rng;
  /** Show prediction side selector. Default true. */
  showPrediction?: boolean;
}
