import type { ConsoleLayoutOptions } from '../../lib/layoutOptions';
import type { GameOutcomeBase } from '../../lib/session';
import type { Rng } from '../../lib/rng';

export type CardRank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
export type CardSuit = '♠' | '♥' | '♦' | '♣';

export interface Card {
  rank: CardRank;
  suit: CardSuit;
  /** Numeric value of the card (Ace = 11, face cards = 10). */
  value: number;
}

export interface TwentyOneResult extends GameOutcomeBase {
  playerTotal: number;
  dealerTotal: number;
  playerCards: Card[];
  dealerCards: Card[];
}

export interface TwentyOneHandle {
  deal: () => void;
}

export interface TwentyOneProps extends ConsoleLayoutOptions {
  onDealStart?: () => void;
  onDealComplete?: (result: TwentyOneResult, isWin: boolean) => void;
  onIsDealingChange?: (isDealing: boolean) => void;
  dealRequest?: number;
  initialHistory?: TwentyOneResult[];
  disabled?: boolean;
  className?: string;
  dealDuration?: number;
  rng?: Rng;
}
