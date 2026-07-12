import { useCallback, useEffect, useRef, useState } from 'react';
import { createOutcomeId } from '../../lib/session';
import type { Rng } from '../../lib/rng';
import {
  createShoe,
  drawCard,
  ensureShoe,
  handValue,
  insuranceCost,
  isBlackjack,
  isPair,
  dealerShouldHit,
  settleInsurance,
  settleMainHand,
  shuffleShoe,
} from './blackjack';
import type {
  Card,
  HandOutcome,
  TwentyOnePhase,
  TwentyOneResult,
} from './types';
import {
  DEAL_STEP_MS,
  DEALER_HIT_MS,
  HOLE_REVEAL_MS,
  SETTLE_PAUSE_MS,
  wait,
} from './motion';

export interface LiveHand {
  cards: Card[];
  doubled: boolean;
  fromSplit: boolean;
  done: boolean;
}

function statusFor(outcome: HandOutcome, playerCards: Card[], isBj: boolean): string {
  if (outcome === 'win') return isBj ? 'Blackjack!' : 'You win';
  if (outcome === 'push') return 'Push';
  return handValue(playerCards).isBust ? 'Bust' : 'Dealer wins';
}

export interface UseTwentyOneRoundOptions {
  rng: Rng;
  disabled: boolean;
  initialBalance: number;
  initialBet: number;
  trackSession: boolean;
  recordOutcome: (result: TwentyOneResult) => void;
  onDealStart?: () => void;
  onDealComplete?: (result: TwentyOneResult, isWin: boolean) => void;
  onBalanceChange?: (balance: number) => void;
  setBusy: (busy: boolean) => void;
  guardExecute: () => boolean;
}

export function useTwentyOneRound({
  rng,
  disabled,
  initialBalance,
  initialBet,
  trackSession,
  recordOutcome,
  onDealStart,
  onDealComplete,
  onBalanceChange,
  setBusy,
  guardExecute,
}: UseTwentyOneRoundOptions) {
  const [phase, setPhase] = useState<TwentyOnePhase>('betting');
  const [balance, setBalance] = useState(initialBalance);
  const [bet, setBet] = useState(initialBet);
  const [rawBet, setRawBet] = useState(String(initialBet));
  const [shoe, setShoe] = useState(() => shuffleShoe(createShoe(1), rng));
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [hands, setHands] = useState<LiveHand[]>([]);
  const [activeHand, setActiveHand] = useState(0);
  const [insuranceBet, setInsuranceBet] = useState(0);
  const [lastResult, setLastResult] = useState<TwentyOneResult | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const betRef = useRef(bet);
  const balanceRef = useRef(balance);
  const insuranceRef = useRef(insuranceBet);
  const runIdRef = useRef(0);

  useEffect(() => {
    betRef.current = bet;
  }, [bet]);

  useEffect(() => {
    balanceRef.current = balance;
  }, [balance]);

  useEffect(() => {
    insuranceRef.current = insuranceBet;
  }, [insuranceBet]);

  useEffect(() => {
    return () => {
      runIdRef.current += 1;
    };
  }, []);

  const applyBalance = useCallback(
    (next: number) => {
      balanceRef.current = next;
      setBalance(next);
      onBalanceChange?.(next);
    },
    [onBalanceChange],
  );

  const commitBetInput = useCallback(() => {
    let parsed = parseFloat(rawBet);
    if (Number.isNaN(parsed) || parsed < 0) parsed = 0;
    parsed = Math.min(parsed, balanceRef.current);
    parsed = Math.round(parsed * 100) / 100;
    betRef.current = parsed;
    setBet(parsed);
    setRawBet(String(parsed));
  }, [rawBet]);

  const setBetAmount = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(Math.round(next * 100) / 100, balanceRef.current));
    betRef.current = clamped;
    setBet(clamped);
    setRawBet(String(clamped));
  }, []);

  const publishResult = useCallback(
    (
      playerCards: Card[],
      finalDealer: Card[],
      stakeBet: number,
      doubled: boolean,
      insBet: number,
      nextShoe: Card[],
      balanceBeforePayout: number,
    ) => {
      const main = settleMainHand({
        playerCards,
        dealerCards: finalDealer,
        bet: stakeBet,
        doubled,
      });
      const insPayout = settleInsurance(finalDealer, insBet);
      const netReturn = main.payout + insPayout;
      applyBalance(balanceBeforePayout + netReturn);

      const result: TwentyOneResult = {
        id: createOutcomeId(),
        playerTotal: handValue(playerCards).total,
        dealerTotal: handValue(finalDealer).total,
        playerCards,
        dealerCards: finalDealer,
        outcome: main.outcome,
        bet: doubled ? stakeBet * 2 : stakeBet,
        payout: netReturn,
        doubled,
        insuranceBet: insBet,
        insurancePayout: insPayout,
        isBlackjack: main.isBlackjack,
        isWin: main.outcome === 'win',
        timestamp: new Date(),
      };

      setShoe(nextShoe);
      setDealerCards(finalDealer);
      setHands([{ cards: playerCards, doubled, fromSplit: false, done: true }]);
      setLastResult(result);
      setPhase('settled');
      setStatusMessage(statusFor(main.outcome, playerCards, main.isBlackjack));
      setBusy(false);

      if (trackSession) recordOutcome(result);
      onDealComplete?.(result, result.isWin);
    },
    [applyBalance, onDealComplete, recordOutcome, setBusy, trackSession],
  );

  const publishSplitResults = useCallback(
    (
      finishedHands: LiveHand[],
      finalDealer: Card[],
      stakeBet: number,
      insBet: number,
      nextShoe: Card[],
      balanceBeforePayout: number,
    ) => {
      let credit = settleInsurance(finalDealer, insBet);
      let wins = 0;
      let losses = 0;
      let pushes = 0;
      let anyDouble = false;
      let totalBet = 0;

      for (const hand of finishedHands) {
        const main = settleMainHand({
          playerCards: hand.cards,
          dealerCards: finalDealer,
          bet: stakeBet,
          doubled: hand.doubled,
        });
        credit += main.payout;
        totalBet += hand.doubled ? stakeBet * 2 : stakeBet;
        anyDouble = anyDouble || hand.doubled;
        if (main.outcome === 'win') wins += 1;
        else if (main.outcome === 'loss') losses += 1;
        else pushes += 1;
      }

      applyBalance(balanceBeforePayout + credit);

      const outcome: HandOutcome =
        wins > losses
          ? 'win'
          : losses > wins
            ? 'loss'
            : pushes === finishedHands.length
              ? 'push'
              : wins > 0
                ? 'win'
                : 'loss';

      const primary = finishedHands[0];
      const result: TwentyOneResult = {
        id: createOutcomeId(),
        playerTotal: handValue(primary.cards).total,
        dealerTotal: handValue(finalDealer).total,
        playerCards: primary.cards,
        dealerCards: finalDealer,
        outcome,
        bet: totalBet,
        payout: credit,
        doubled: anyDouble,
        insuranceBet: insBet,
        insurancePayout: settleInsurance(finalDealer, insBet),
        isBlackjack: false,
        isWin: outcome === 'win',
        timestamp: new Date(),
      };

      setShoe(nextShoe);
      setDealerCards(finalDealer);
      setHands(finishedHands.map((h) => ({ ...h, done: true })));
      setLastResult(result);
      setPhase('settled');
      setStatusMessage(
        outcome === 'win' ? 'You win' : outcome === 'push' ? 'Push' : 'Dealer wins',
      );
      setBusy(false);

      if (trackSession) recordOutcome(result);
      onDealComplete?.(result, result.isWin);
    },
    [applyBalance, onDealComplete, recordOutcome, setBusy, trackSession],
  );

  const completePlayerSide = useCallback(
    (
      finishedHands: LiveHand[],
      currentDealer: Card[],
      currentShoe: Card[],
      balanceBeforePayout: number,
      insBet: number,
    ) => {
      const stake = betRef.current;
      const allBust = finishedHands.every((h) => handValue(h.cards).isBust);
      const runId = ++runIdRef.current;

      const finish = (finalDealer: Card[], finalShoe: Card[]) => {
        if (runId !== runIdRef.current) return;
        if (finishedHands.length === 1) {
          publishResult(
            finishedHands[0].cards,
            finalDealer,
            stake,
            finishedHands[0].doubled,
            insBet,
            finalShoe,
            balanceBeforePayout,
          );
        } else {
          publishSplitResults(
            finishedHands,
            finalDealer,
            stake,
            insBet,
            finalShoe,
            balanceBeforePayout,
          );
        }
      };

      void (async () => {
        if (allBust) {
          await wait(SETTLE_PAUSE_MS);
          finish(currentDealer, currentShoe);
          return;
        }

        setPhase('dealer');
        // Reveal hole card, then hit one-by-one.
        await wait(HOLE_REVEAL_MS);
        if (runId !== runIdRef.current) return;

        let cards = [...currentDealer];
        let remaining = currentShoe;
        setDealerCards(cards);

        while (dealerShouldHit(cards)) {
          await wait(DEALER_HIT_MS);
          if (runId !== runIdRef.current) return;
          const drawn = drawCard(ensureShoe(remaining, rng));
          cards = [...cards, drawn.card];
          remaining = drawn.shoe;
          setDealerCards(cards);
          setShoe(remaining);
        }

        await wait(SETTLE_PAUSE_MS);
        if (runId !== runIdRef.current) return;
        finish(cards, remaining);
      })();
    },
    [publishResult, publishSplitResults, rng],
  );

  const advanceAfterPlayerDone = useCallback(
    (updatedHands: LiveHand[], handIndex: number, nextShoe: Card[]) => {
      const nextIndex = updatedHands.findIndex((h, i) => i > handIndex && !h.done);
      if (nextIndex >= 0) {
        setHands(updatedHands);
        setActiveHand(nextIndex);
        setShoe(nextShoe);
        setPhase('player');
        return;
      }
      setHands(updatedHands);
      completePlayerSide(
        updatedHands,
        dealerCards,
        nextShoe,
        balanceRef.current,
        insuranceRef.current,
      );
    },
    [completePlayerSide, dealerCards],
  );

  const startDeal = useCallback(() => {
    if (!guardExecute()) return;
    commitBetInput();
    const stake = betRef.current;
    const bal = balanceRef.current;
    if (stake <= 0 || stake > bal) return;

    const runId = ++runIdRef.current;
    onDealStart?.();
    setBusy(true);
    setLastResult(null);
    setStatusMessage(null);
    insuranceRef.current = 0;
    setInsuranceBet(0);
    setPhase('dealing');
    setDealerCards([]);
    setHands([]);
    setActiveHand(0);

    const balanceAfterBet = bal - stake;
    applyBalance(balanceAfterBet);

    void (async () => {
      let nextShoe = ensureShoe(shoe, rng);

      const p1 = drawCard(nextShoe);
      nextShoe = p1.shoe;
      setHands([{ cards: [p1.card], doubled: false, fromSplit: false, done: false }]);
      await wait(DEAL_STEP_MS);
      if (runId !== runIdRef.current) return;

      const d1 = drawCard(nextShoe);
      nextShoe = d1.shoe;
      setDealerCards([d1.card]);
      await wait(DEAL_STEP_MS);
      if (runId !== runIdRef.current) return;

      const p2 = drawCard(nextShoe);
      nextShoe = p2.shoe;
      setHands([{ cards: [p1.card, p2.card], doubled: false, fromSplit: false, done: false }]);
      await wait(DEAL_STEP_MS);
      if (runId !== runIdRef.current) return;

      const d2 = drawCard(nextShoe);
      nextShoe = d2.shoe;
      const dealer = [d1.card, d2.card];
      const player = [p1.card, p2.card];
      setDealerCards(dealer);
      setShoe(nextShoe);
      await wait(SETTLE_PAUSE_MS);
      if (runId !== runIdRef.current) return;

      const playerBj = isBlackjack(player);
      const dealerBj = isBlackjack(dealer);

      if (dealer[0].rank === 'A' && !playerBj) {
        setPhase('insurance');
        return;
      }

      if (playerBj || dealerBj) {
        // Reveal hole before settling naturals so the flip is visible.
        setPhase('dealer');
        await wait(HOLE_REVEAL_MS);
        if (runId !== runIdRef.current) return;
        publishResult(player, dealer, stake, false, 0, nextShoe, balanceAfterBet);
        return;
      }

      setPhase('player');
    })();
  }, [
    applyBalance,
    commitBetInput,
    guardExecute,
    onDealStart,
    publishResult,
    rng,
    setBusy,
    shoe,
  ]);

  const currentHand = hands[activeHand] ?? null;
  const playerCards = currentHand?.cards ?? [];

  const resolveInsurance = useCallback(
    (take: boolean) => {
      if (phase !== 'insurance' || hands.length === 0) return;
      const stake = betRef.current;
      let bal = balanceRef.current;
      let ins = 0;
      if (take) {
        const cost = insuranceCost(stake);
        if (cost > bal) return;
        bal -= cost;
        ins = cost;
        applyBalance(bal);
        insuranceRef.current = ins;
        setInsuranceBet(ins);
      }

      const dealer = dealerCards;
      const player = hands[0].cards;
      const runId = ++runIdRef.current;

      if (isBlackjack(dealer) || isBlackjack(player)) {
        void (async () => {
          setPhase('dealer');
          await wait(HOLE_REVEAL_MS);
          if (runId !== runIdRef.current) return;
          publishResult(player, dealer, stake, false, ins, shoe, bal);
        })();
        return;
      }

      setPhase('player');
    },
    [applyBalance, dealerCards, hands, phase, publishResult, shoe],
  );

  const onHit = useCallback(() => {
    if (phase !== 'player' || !currentHand) return;
    const drawn = drawCard(ensureShoe(shoe, rng));
    const cards = [...currentHand.cards, drawn.card];
    const updated = hands.map((h, i) =>
      i === activeHand ? { ...h, cards, done: handValue(cards).isBust } : h,
    );
    setHands(updated);
    setShoe(drawn.shoe);

    if (handValue(cards).isBust || handValue(cards).total === 21) {
      const marked = updated.map((h, i) =>
        i === activeHand ? { ...h, done: true } : h,
      );
      advanceAfterPlayerDone(marked, activeHand, drawn.shoe);
    }
  }, [activeHand, advanceAfterPlayerDone, currentHand, hands, phase, rng, shoe]);

  const onStand = useCallback(() => {
    if (phase !== 'player' || !currentHand) return;
    const marked = hands.map((h, i) =>
      i === activeHand ? { ...h, done: true } : h,
    );
    advanceAfterPlayerDone(marked, activeHand, shoe);
  }, [activeHand, advanceAfterPlayerDone, currentHand, hands, phase, shoe]);

  const onDouble = useCallback(() => {
    if (phase !== 'player' || !currentHand) return;
    if (currentHand.cards.length !== 2 || currentHand.doubled) return;
    if (balanceRef.current < betRef.current) return;

    applyBalance(balanceRef.current - betRef.current);
    const drawn = drawCard(ensureShoe(shoe, rng));
    const cards = [...currentHand.cards, drawn.card];
    const marked = hands.map((h, i) =>
      i === activeHand ? { ...h, cards, doubled: true, done: true } : h,
    );
    advanceAfterPlayerDone(marked, activeHand, drawn.shoe);
  }, [activeHand, advanceAfterPlayerDone, applyBalance, currentHand, hands, phase, rng, shoe]);

  const onSplit = useCallback(() => {
    if (phase !== 'player' || !currentHand) return;
    if (!isPair(currentHand.cards) || currentHand.fromSplit || hands.length > 1) return;
    if (balanceRef.current < betRef.current) return;

    applyBalance(balanceRef.current - betRef.current);

    let nextShoe = ensureShoe(shoe, rng);
    const leftDraw = drawCard(nextShoe);
    nextShoe = leftDraw.shoe;
    const rightDraw = drawCard(nextShoe);
    nextShoe = rightDraw.shoe;

    setHands([
      {
        cards: [currentHand.cards[0], leftDraw.card],
        doubled: false,
        fromSplit: true,
        done: false,
      },
      {
        cards: [currentHand.cards[1], rightDraw.card],
        doubled: false,
        fromSplit: true,
        done: false,
      },
    ]);
    setActiveHand(0);
    setShoe(nextShoe);
    setPhase('player');
  }, [applyBalance, currentHand, hands.length, phase, rng, shoe]);

  const playerBust = playerCards.length > 0 && handValue(playerCards).isBust;
  const canDouble =
    phase === 'player' &&
    !!currentHand &&
    currentHand.cards.length === 2 &&
    !currentHand.doubled &&
    balance >= bet;
  const canSplit =
    phase === 'player' &&
    !!currentHand &&
    hands.length === 1 &&
    !currentHand.fromSplit &&
    isPair(currentHand.cards) &&
    balance >= bet;
  const bettingEnabled = !disabled && (phase === 'betting' || phase === 'settled');
  const holeHidden =
    (phase === 'dealing' && dealerCards.length >= 2) ||
    phase === 'insurance' ||
    phase === 'player';

  return {
    phase,
    balance,
    bet,
    rawBet,
    setRawBet,
    commitBetInput,
    setBetAmount,
    dealerCards,
    hands,
    activeHand,
    insuranceBet,
    lastResult,
    statusMessage,
    currentHand,
    playerCards,
    playerBust,
    canDouble,
    canSplit,
    bettingEnabled,
    holeHidden,
    startDeal,
    resolveInsurance,
    onHit,
    onStand,
    onDouble,
    onSplit,
  };
}
