import type { Rng } from '../../lib/rng';
import type { CoinSide } from '../CoinFlip/types';

export interface PhaserCoinFlipResult {
  landed: CoinSide;
}

export interface PhaserCoinFlipHandle {
  flip: () => void;
}

export interface PhaserCoinFlipProps {
  onFlipStart?: () => void;
  onFlipComplete?: (landed: CoinSide) => void;
  onIsFlippingChange?: (isFlipping: boolean) => void;
  /** Increment to trigger a flip from a parent component. */
  flipRequest?: number;
  /** Flip animation length in ms. */
  animationDuration?: number;
  /** Maximum rendered coin width in px (the canvas is square and scales down responsively). */
  size?: number;
  disabled?: boolean;
  /** Hide the built-in Flip button when driving flips externally. */
  showFlipButton?: boolean;
  className?: string;
  rng?: Rng;
}
