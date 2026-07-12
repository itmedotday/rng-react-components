import type { ConsoleLayoutOptions } from '../../lib/layoutOptions';
import type { GameOutcomeBase } from '../../lib/session';
import type { Rng } from '../../lib/rng';

export type CardRank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
export type CardSuit = '♠' | '♥' | '♦' | '♣';

export interface Card {
  rank: CardRank;
  suit: CardSuit;
  /** Base pip value (Ace = 11, face = 10). Soft/hard totals come from handValue(). */
  value: number;
}

export type HandOutcome = 'win' | 'loss' | 'push';

export type TwentyOnePhase =
  | 'betting'
  | 'insurance'
  | 'player'
  | 'dealer'
  | 'settled';

export interface HandValue {
  /** Best total ≤ 21, or lowest bust total. */
  total: number;
  /** Soft (Ace counted as 11) when still usable. */
  soft: boolean;
  /** Hard total always treating Aces as 1. */
  hard: number;
  /** Soft total when an Ace can still count as 11; otherwise null. */
  softTotal: number | null;
  isBlackjack: boolean;
  isBust: boolean;
}

export interface TwentyOneResult extends GameOutcomeBase {
  playerTotal: number;
  dealerTotal: number;
  playerCards: Card[];
  dealerCards: Card[];
  outcome: HandOutcome;
  bet: number;
  payout: number;
  doubled: boolean;
  insuranceBet: number;
  insurancePayout: number;
  isBlackjack: boolean;
}

export interface TwentyOneHandle {
  /** Places a bet with the current amount and starts a hand. */
  deal: () => void;
}

export interface TwentyOneProps extends ConsoleLayoutOptions {
  onDealStart?: () => void;
  onDealComplete?: (result: TwentyOneResult, isWin: boolean) => void;
  onIsDealingChange?: (isDealing: boolean) => void;
  /** Increment to trigger deal from a parent (same as Bet). */
  dealRequest?: number;
  initialHistory?: TwentyOneResult[];
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
}
