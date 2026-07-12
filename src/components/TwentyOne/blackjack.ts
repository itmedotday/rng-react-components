import type { Rng } from '../../lib/rng';
import type {
  Card,
  CardRank,
  CardSuit,
  HandOutcome,
  HandValue,
} from './types';

const SUITS: CardSuit[] = ['♠', '♥', '♦', '♣'];
const RANKS: CardRank[] = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
];

export const RESHUFFLE_THRESHOLD = 20;

export function rankValue(rank: CardRank): number {
  if (rank === 'A') return 11;
  if (rank === 'J' || rank === 'Q' || rank === 'K') return 10;
  return Number(rank);
}

export function createShoe(decks = 1): Card[] {
  const shoe: Card[] = [];
  for (let d = 0; d < decks; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        shoe.push({ rank, suit, value: rankValue(rank) });
      }
    }
  }
  return shoe;
}

/** Fisher–Yates shuffle using injectable rng. */
export function shuffleShoe(shoe: Card[], rng: Rng): Card[] {
  const next = [...shoe];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = next[i];
    next[i] = next[j];
    next[j] = tmp;
  }
  return next;
}

export function ensureShoe(shoe: Card[], rng: Rng, decks = 1): Card[] {
  if (shoe.length < RESHUFFLE_THRESHOLD) {
    return shuffleShoe(createShoe(decks), rng);
  }
  return shoe;
}

export function drawCard(shoe: Card[]): { card: Card; shoe: Card[] } {
  if (shoe.length === 0) {
    throw new Error('Cannot draw from an empty shoe');
  }
  const [card, ...rest] = shoe;
  return { card, shoe: rest };
}

export function handValue(cards: readonly Card[]): HandValue {
  let hard = 0;
  let aces = 0;
  for (const card of cards) {
    if (card.rank === 'A') {
      aces += 1;
      hard += 1;
    } else {
      hard += card.value;
    }
  }

  let total = hard;
  let soft = false;
  let softTotal: number | null = null;

  if (aces > 0) {
    const withSoft = hard + 10;
    if (withSoft <= 21) {
      total = withSoft;
      soft = true;
      softTotal = withSoft;
    }
  }

  const isBlackjack = cards.length === 2 && total === 21;
  const isBust = total > 21;

  return { total, soft, hard, softTotal, isBlackjack, isBust };
}

/** Display string for score pill: soft hands show "hard, soft". */
export function formatHandTotals(value: HandValue): string {
  if (value.soft && value.softTotal !== null && value.hard !== value.softTotal) {
    return `${value.hard}, ${value.softTotal}`;
  }
  return String(value.total);
}

export function isPair(cards: readonly Card[]): boolean {
  if (cards.length !== 2) return false;
  return cards[0].value === cards[1].value;
}

export function isBlackjack(cards: readonly Card[]): boolean {
  return handValue(cards).isBlackjack;
}

/** Dealer hits soft 17. */
export function dealerShouldHit(cards: readonly Card[]): boolean {
  const v = handValue(cards);
  if (v.isBust) return false;
  if (v.total < 17) return true;
  if (v.total === 17 && v.soft) return true;
  return false;
}

export function playDealer(
  dealerCards: Card[],
  shoe: Card[],
): { cards: Card[]; shoe: Card[] } {
  let cards = [...dealerCards];
  let remaining = shoe;
  while (dealerShouldHit(cards)) {
    const drawn = drawCard(remaining);
    cards = [...cards, drawn.card];
    remaining = drawn.shoe;
  }
  return { cards, shoe: remaining };
}

export interface SettleMainParams {
  playerCards: readonly Card[];
  dealerCards: readonly Card[];
  bet: number;
  doubled: boolean;
}

export interface SettleMainResult {
  outcome: HandOutcome;
  payout: number;
  isBlackjack: boolean;
}

/**
 * Main-hand settlement (excludes insurance).
 * Payout is the total returned to the player for the main bet
 * (stake + winnings, or 0 on loss, or stake on push).
 */
export function settleMainHand({
  playerCards,
  dealerCards,
  bet,
  doubled,
}: SettleMainParams): SettleMainResult {
  const stake = doubled ? bet * 2 : bet;
  const player = handValue(playerCards);
  const dealer = handValue(dealerCards);

  if (player.isBlackjack && dealer.isBlackjack) {
    return { outcome: 'push', payout: stake, isBlackjack: true };
  }
  if (player.isBlackjack) {
    return { outcome: 'win', payout: stake + stake * 1.5, isBlackjack: true };
  }
  if (dealer.isBlackjack) {
    return { outcome: 'loss', payout: 0, isBlackjack: false };
  }
  if (player.isBust) {
    return { outcome: 'loss', payout: 0, isBlackjack: false };
  }
  if (dealer.isBust) {
    return { outcome: 'win', payout: stake * 2, isBlackjack: false };
  }
  if (player.total > dealer.total) {
    return { outcome: 'win', payout: stake * 2, isBlackjack: false };
  }
  if (player.total < dealer.total) {
    return { outcome: 'loss', payout: 0, isBlackjack: false };
  }
  return { outcome: 'push', payout: stake, isBlackjack: false };
}

/** Insurance pays 2:1 (returns 3× insurance stake including stake). */
export function settleInsurance(
  dealerCards: readonly Card[],
  insuranceBet: number,
): number {
  if (insuranceBet <= 0) return 0;
  if (isBlackjack(dealerCards)) {
    return insuranceBet * 3;
  }
  return 0;
}

export function insuranceCost(bet: number): number {
  return bet / 2;
}
