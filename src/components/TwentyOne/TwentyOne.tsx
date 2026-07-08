import {
  forwardRef,
  useId,
  useCallback,
  useRef,
  useState,
} from 'react';
import { BadgeCent } from 'lucide-react';
import { createOutcomeId } from '../../lib/session';
import { resolveRng } from '../../lib/rng';
import { useGameSession } from '../../lib/useGameSession';
import { useGameTrigger } from '../../lib/useGameTrigger';
import { StatsHeader } from '../../lib/components/StatsHeader';
import type {
  Card,
  CardRank,
  CardSuit,
  TwentyOneHandle,
  TwentyOneProps,
  TwentyOneResult,
} from './types';
import { CardHand } from './components/CardHand';

// Arcade tuning: totals begin at 4 and intentionally extend beyond 21 to create frequent bust rounds.
const MIN_TOTAL = 4;
const MAX_TOTAL = 27;

const SUITS: CardSuit[] = ['♠', '♥', '♦', '♣'];
// Face cards (J, Q, K) that all have value 10
const FACE_RANKS: CardRank[] = ['J', 'Q', 'K'];

function drawTotal(rng: () => number): number {
  return Math.floor(rng() * (MAX_TOTAL - MIN_TOTAL + 1)) + MIN_TOTAL;
}

function breakDealerTie(playerTotal: number, dealerTotal: number): number {
  if (dealerTotal !== playerTotal) return dealerTotal;
  return Math.min(MAX_TOTAL, dealerTotal + 1);
}

function randomSuit(rng: () => number): CardSuit {
  return SUITS[Math.floor(rng() * 4)];
}

/** Create a card object from a numeric value (2–11). */
function makeCard(value: number, rng: () => number): Card {
  let rank: CardRank;
  if (value === 11) {
    rank = 'A';
  } else if (value === 10) {
    // 1-in-4 chance to be a face card instead of '10'
    const roll = rng();
    rank = roll < 0.25 ? FACE_RANKS[0] : roll < 0.5 ? FACE_RANKS[1] : roll < 0.75 ? FACE_RANKS[2] : '10';
  } else {
    rank = String(value) as CardRank;
  }
  return { rank, suit: randomSuit(rng), value };
}

/**
 * Generate a list of cards whose values sum to `total` (arcade range: 4–27).
 *
 * - totals ≤ 20 → two cards (each 2–10)
 * - totals 21–27 → three cards (10 + 10 + remainder)
 */
function dealCards(total: number, rng: () => number): Card[] {
  if (total > 20) {
    // Bust hand: two 10s + remainder
    const rem = total - 20; // 1–7
    return [makeCard(10, rng), makeCard(10, rng), makeCard(rem, rng)];
  }

  // Two cards summing to total, each in [2..10]
  const minFirst = Math.max(2, total - 10);
  const maxFirst = Math.min(10, total - 2);

  if (minFirst > maxFirst) {
    // Degenerate edge case: return one card equal to total (should not occur given MIN_TOTAL=4)
    return [makeCard(Math.min(total, 10), rng)];
  }

  const v1 = Math.floor(rng() * (maxFirst - minFirst + 1)) + minFirst;
  const v2 = total - v1;
  return [makeCard(v1, rng), makeCard(v2, rng)];
}

/** Generates a random partial hand (for cycling animation). */
function randomHand(rng: () => number): Card[] {
  const n = Math.floor(rng() * 2) + 2; // 2 or 3 cards
  return Array.from({ length: n }, () => makeCard(Math.floor(rng() * 9) + 2, rng));
}

export const TwentyOne = forwardRef<TwentyOneHandle, TwentyOneProps>(function TwentyOne(
  {
    onDealStart,
    onDealComplete,
    onIsDealingChange,
    dealRequest,
    initialHistory = [],
    disabled = false,
    className = '',
    dealDuration = 900,
    rng: rngProp,
    showHeader = false,
    showHistory = false,
    showRules = false,
  },
  ref,
) {
  const rng = resolveRng(rngProp);
  const playerLabelId = useId();
  const dealerLabelId = useId();
  const trackSession = showHeader || showHistory;
  const [dealStatus, setDealStatus] = useState<'idle' | 'win' | 'loss'>('idle');
  const [playerTotal, setPlayerTotal] = useState<number | null>(null);
  const [dealerTotal, setDealerTotal] = useState<number | null>(null);
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const { stats, history, recordOutcome } = useGameSession<TwentyOneResult>({
    initialHistory: trackSession ? initialHistory : [],
  });

  const dealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const executeRef = useRef<() => void>(() => {});

  const clearDealTimer = useCallback(() => {
    if (dealTimerRef.current !== null) {
      clearTimeout(dealTimerRef.current);
      dealTimerRef.current = null;
    }
    if (cycleIntervalRef.current !== null) {
      clearInterval(cycleIntervalRef.current);
      cycleIntervalRef.current = null;
    }
  }, []);

  const { isBusy: isDealing, setBusy, guardExecute } = useGameTrigger(ref, {
    disabled,
    request: dealRequest,
    onBusyChange: onIsDealingChange,
    execute: () => executeRef.current(),
    handle: { deal: () => executeRef.current() },
    clearTimers: clearDealTimer,
  });

  const triggerDeal = useCallback(() => {
    if (!guardExecute()) return;

    clearDealTimer();
    setBusy(true);
    setDealStatus('idle');
    setIsRevealed(false);
    onDealStart?.();

    const nextPlayerTotal = drawTotal(rng);
    const nextDealerTotal = breakDealerTie(nextPlayerTotal, drawTotal(rng));

    const isWin = nextPlayerTotal <= 21 && (nextDealerTotal > 21 || nextPlayerTotal > nextDealerTotal);

    // Animate cycling hands during the deal
    cycleIntervalRef.current = setInterval(() => {
      setPlayerTotal(drawTotal(rng));
      setDealerTotal(drawTotal(rng));
      setPlayerCards(randomHand(rng));
      setDealerCards(randomHand(rng));
    }, 80);

    dealTimerRef.current = setTimeout(() => {
      dealTimerRef.current = null;
      if (cycleIntervalRef.current !== null) {
        clearInterval(cycleIntervalRef.current);
        cycleIntervalRef.current = null;
      }

      const finalPlayerCards = dealCards(nextPlayerTotal, rng);
      const finalDealerCards = dealCards(nextDealerTotal, rng);

      const result: TwentyOneResult = {
        id: createOutcomeId(),
        playerTotal: nextPlayerTotal,
        dealerTotal: nextDealerTotal,
        playerCards: finalPlayerCards,
        dealerCards: finalDealerCards,
        isWin,
        timestamp: new Date(),
      };

      setPlayerTotal(nextPlayerTotal);
      setDealerTotal(nextDealerTotal);
      setPlayerCards(finalPlayerCards);
      setDealerCards(finalDealerCards);
      setDealStatus(isWin ? 'win' : 'loss');
      setBusy(false);

      if (trackSession) {
        recordOutcome(result);
      }

      onDealComplete?.(result, isWin);
    }, dealDuration);
  }, [
    clearDealTimer,
    dealDuration,
    guardExecute,
    onDealComplete,
    onDealStart,
    recordOutcome,
    rng,
    setBusy,
    trackSession,
  ]);

  executeRef.current = triggerDeal;

  const playerHighlight = !isDealing && dealStatus !== 'idle'
    ? dealStatus === 'win' ? 'win' : 'loss'
    : null;
  const dealerHighlight = !isDealing && dealStatus !== 'idle'
    ? dealStatus === 'win' ? 'loss' : 'win'
    : null;

  return (
    <div
      className={`w-full max-w-2xl glass-panel rounded-3xl p-8 relative flex flex-col items-center select-none transition-all duration-300
        ${dealStatus === 'win' ? 'animate-pulse-glow-green border-emerald-500/40 shadow-emerald-950/20' : ''}
        ${dealStatus === 'loss' ? 'animate-pulse-glow-red border-rose-500/40 shadow-rose-950/20' : ''}
        ${className}
      `}
    >
      {showHeader && (
        <StatsHeader
          title="21 CONSOLE"
          icon={<BadgeCent className="w-5 h-5 text-emerald-400 animate-pulse" />}
          stats={stats}
        />
      )}

      <div className="w-full relative px-4 py-8 bg-zinc-950/40 border border-zinc-900/80 rounded-2xl mb-8 min-h-[220px]">
        <div className="grid grid-cols-2 gap-6">
          <CardHand
            cards={playerCards}
            total={playerTotal}
            label="Player"
            labelId={playerLabelId}
            hideAll={isDealing}
            highlight={playerHighlight as 'win' | 'loss' | null}
            size="md"
          />
          <CardHand
            cards={dealerCards}
            total={dealerTotal}
            label="Dealer"
            labelId={dealerLabelId}
            hideAll={isDealing}
            highlight={dealerHighlight as 'win' | 'loss' | null}
            size="md"
          />
        </div>

        <div className="mt-4 h-8 flex items-center justify-center">
          {!isDealing && dealStatus !== 'idle' && (
            <div
              className={`px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider
                ${dealStatus === 'win' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-rose-500/20 border-rose-500/50 text-rose-400'}
              `}
            >
              {dealStatus === 'win' ? 'Player Wins' : 'Dealer Wins'}
            </div>
          )}
        </div>
      </div>

      <div className="w-full flex flex-col gap-6">
        <button
          type="button"
          disabled={isDealing || disabled}
          onClick={triggerDeal}
          className={`w-full py-4.5 rounded-2xl font-black text-base tracking-widest uppercase transition-all duration-300 shadow-lg text-white select-none
            ${
              isDealing || disabled
                ? 'bg-zinc-800 border border-zinc-700 text-zinc-500 cursor-not-allowed shadow-none'
                : 'bg-emerald-600 border border-emerald-500 hover:bg-emerald-500 shadow-emerald-950/20 active:translate-y-0.5 cursor-pointer'
            }
          `}
        >
          {isDealing ? 'DEALING...' : 'DEAL 21'}
        </button>

        {showHistory && (
          <div className="w-full rounded-2xl border border-zinc-800/80 bg-zinc-950/30 p-4">
            <div className="text-zinc-400 text-xs font-black uppercase tracking-wider mb-3">
              Last {history.length} hands
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-zinc-500">No hands yet.</p>
            ) : (
              <ul className="space-y-2">
                {history.slice(-8).reverse().map((entry) => (
                  <li key={entry.id} className="text-sm text-zinc-300 font-mono flex justify-between gap-2">
                    <span>P {entry.playerTotal} vs D {entry.dealerTotal}</span>
                    <span className={entry.isWin ? 'text-emerald-400' : 'text-rose-400'}>
                      {entry.isWin ? 'Win' : 'Loss'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {showRules && (
        <div className="w-full mt-6 rounded-2xl border border-zinc-800/80 bg-zinc-950/30 p-4 text-sm text-zinc-400">
          Deal one hand for player and dealer. Closest to 21 without busting wins.
          Totals above 21 are a bust.
        </div>
      )}
    </div>
  );
});
