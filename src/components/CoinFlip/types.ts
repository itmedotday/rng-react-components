export type CoinSide = 'orange' | 'blue';

export interface CoinFlipResult {
  id: string;
  landed: CoinSide;
  prediction: CoinSide;
  isWin: boolean;
  timestamp: Date;
}

export interface CoinFlipHandle {
  flip: () => void;
}

export interface ClickToFlipCoinHandle {
  flip: () => void;
}

export interface ClickToFlipCoinProps {
  onFlipStart?: () => void;
  onFlipComplete?: (landed: CoinSide) => void;
  onIsFlippingChange?: (isFlipping: boolean) => void;
  flipRequest?: number;
  disabled?: boolean;
  className?: string;
  animationDuration?: number;
}

export interface CoinFlipProps {
  onFlipStart?: () => void;
  onFlipComplete?: (landed: CoinSide, isWin: boolean) => void;
  /** Fires whenever the flip animation phase changes. */
  onIsFlippingChange?: (isFlipping: boolean) => void;
  /** Increment to trigger a flip from the parent (e.g. `setN((n) => n + 1)`). */
  flipRequest?: number;
  initialPrediction?: CoinSide;
  disabled?: boolean;
  className?: string;
  animationDuration?: number;
}
