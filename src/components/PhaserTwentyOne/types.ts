import type { Rng } from '../../lib/rng';
import type { TwentyOneResult } from '../TwentyOne/types';

export interface PhaserTwentyOneHandle {
  /** Places a bet with the current amount and starts a hand. */
  deal: () => void;
}

export interface PhaserTwentyOneProps {
  onDealStart?: () => void;
  onDealComplete?: (result: TwentyOneResult, isWin: boolean) => void;
  onIsDealingChange?: (isDealing: boolean) => void;
  /** Increment to trigger deal from a parent (same as Bet). */
  dealRequest?: number;
  disabled?: boolean;
  className?: string;
  rng?: Rng;
  /** Starting demo balance. Default 1000. */
  initialBalance?: number;
  /** Starting bet amount. Default 10. */
  initialBet?: number;
  /** Currency label shown next to balance. Default "GG". */
  currencyLabel?: string;
  onBalanceChange?: (balance: number) => void;
  /** Maximum rendered width in px. */
  width?: number;
}
