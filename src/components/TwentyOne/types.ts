import type { ConsoleLayoutOptions } from '../../lib/layoutOptions';
import type { GameOutcomeBase } from '../../lib/session';
import type { Rng } from '../../lib/rng';

export interface TwentyOneResult extends GameOutcomeBase {
  playerTotal: number;
  dealerTotal: number;
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
