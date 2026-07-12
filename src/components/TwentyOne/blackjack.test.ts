import { describe, expect, it } from 'vitest';
import {
  createShoe,
  dealerShouldHit,
  formatHandTotals,
  handValue,
  insuranceCost,
  isPair,
  playDealer,
  settleInsurance,
  settleMainHand,
  shuffleShoe,
} from './blackjack';
import type { Card, CardRank, CardSuit } from './types';

function card(rank: CardRank, suit: CardSuit = '♠'): Card {
  const value =
    rank === 'A' ? 11 : rank === 'J' || rank === 'Q' || rank === 'K' ? 10 : Number(rank);
  return { rank, suit, value };
}

describe('handValue', () => {
  it('computes hard totals without aces', () => {
    const v = handValue([card('9'), card('7')]);
    expect(v.total).toBe(16);
    expect(v.hard).toBe(16);
    expect(v.soft).toBe(false);
    expect(v.softTotal).toBeNull();
    expect(v.isBust).toBe(false);
  });

  it('exposes soft totals for usable aces', () => {
    const v = handValue([card('A'), card('9')]);
    expect(v.hard).toBe(10);
    expect(v.softTotal).toBe(20);
    expect(v.total).toBe(20);
    expect(v.soft).toBe(true);
    expect(formatHandTotals(v)).toBe('10, 20');
  });

  it('falls back to hard when soft would bust', () => {
    const v = handValue([card('A'), card('9'), card('5')]);
    expect(v.total).toBe(15);
    expect(v.soft).toBe(false);
    expect(formatHandTotals(v)).toBe('15');
  });

  it('detects blackjack', () => {
    const v = handValue([card('A'), card('K')]);
    expect(v.isBlackjack).toBe(true);
    expect(v.total).toBe(21);
  });

  it('detects bust', () => {
    const v = handValue([card('K'), card('Q'), card('5')]);
    expect(v.isBust).toBe(true);
    expect(v.total).toBe(25);
  });
});

describe('isPair', () => {
  it('matches equal values including face tens', () => {
    expect(isPair([card('8'), card('8', '♥')])).toBe(true);
    expect(isPair([card('10'), card('K')])).toBe(true);
    expect(isPair([card('A'), card('A', '♦')])).toBe(true);
  });

  it('rejects non-pairs and multi-card hands', () => {
    expect(isPair([card('9'), card('8')])).toBe(false);
    expect(isPair([card('8'), card('8'), card('8')])).toBe(false);
  });
});

describe('dealerShouldHit / playDealer', () => {
  it('hits soft 17 and stands hard 17', () => {
    expect(dealerShouldHit([card('A'), card('6')])).toBe(true);
    expect(dealerShouldHit([card('10'), card('7')])).toBe(false);
    expect(dealerShouldHit([card('10'), card('6')])).toBe(true);
  });

  it('draws until standing total', () => {
    const shoe = [card('9'), card('2')];
    const result = playDealer([card('A'), card('6')], shoe);
    expect(handValue(result.cards).total).toBeGreaterThanOrEqual(17);
    expect(result.cards.length).toBeGreaterThan(2);
  });
});

describe('settleMainHand', () => {
  it('pays blackjack 3:2', () => {
    const settled = settleMainHand({
      playerCards: [card('A'), card('K')],
      dealerCards: [card('9'), card('8')],
      bet: 10,
      doubled: false,
    });
    expect(settled.outcome).toBe('win');
    expect(settled.isBlackjack).toBe(true);
    expect(settled.payout).toBe(25);
  });

  it('pushes on both blackjacks', () => {
    const settled = settleMainHand({
      playerCards: [card('A'), card('K')],
      dealerCards: [card('A', '♥'), card('Q')],
      bet: 10,
      doubled: false,
    });
    expect(settled.outcome).toBe('push');
    expect(settled.payout).toBe(10);
  });

  it('uses doubled stake for normal wins', () => {
    const settled = settleMainHand({
      playerCards: [card('10'), card('9'), card('2')],
      dealerCards: [card('10'), card('8')],
      bet: 10,
      doubled: true,
    });
    expect(settled.outcome).toBe('win');
    expect(settled.payout).toBe(40);
  });

  it('returns stake on push and 0 on loss/bust', () => {
    expect(
      settleMainHand({
        playerCards: [card('10'), card('9')],
        dealerCards: [card('K'), card('9')],
        bet: 10,
        doubled: false,
      }),
    ).toMatchObject({ outcome: 'push', payout: 10 });

    expect(
      settleMainHand({
        playerCards: [card('K'), card('Q'), card('5')],
        dealerCards: [card('10'), card('7')],
        bet: 10,
        doubled: false,
      }),
    ).toMatchObject({ outcome: 'loss', payout: 0 });
  });
});

describe('settleInsurance', () => {
  it('pays 2:1 when dealer has blackjack', () => {
    expect(settleInsurance([card('A'), card('K')], 5)).toBe(15);
    expect(settleInsurance([card('A'), card('9')], 5)).toBe(0);
    expect(insuranceCost(10)).toBe(5);
  });
});

describe('shoe', () => {
  it('creates 52 cards and shuffles deterministically with seeded rng', () => {
    const shoe = createShoe(1);
    expect(shoe).toHaveLength(52);

    let i = 0;
    const sequence = [0.9, 0.1, 0.5, 0.2, 0.8, 0.3, 0.7, 0.4, 0.6];
    const rng = () => sequence[i++ % sequence.length];
    const a = shuffleShoe(shoe, rng);
    i = 0;
    const b = shuffleShoe(shoe, rng);
    expect(a).toEqual(b);
    expect(a.map((c) => c.rank + c.suit).join()).not.toBe(
      shoe.map((c) => c.rank + c.suit).join(),
    );
  });
});
