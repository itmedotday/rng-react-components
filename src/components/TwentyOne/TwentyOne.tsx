import {
  forwardRef,
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
  TwentyOneHandle,
  TwentyOneProps,
  TwentyOneResult,
} from './types';

function drawTotal(rng: () => number): number {
  return Math.floor(rng() * 24) + 4;
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
  const trackSession = showHeader || showHistory;
  const [dealStatus, setDealStatus] = useState<'idle' | 'win' | 'loss'>('idle');
  const [playerTotal, setPlayerTotal] = useState<number | null>(null);
  const [dealerTotal, setDealerTotal] = useState<number | null>(null);
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
    onDealStart?.();

    const nextPlayerTotal = drawTotal(rng);
    let nextDealerTotal = drawTotal(rng);
    if (nextDealerTotal === nextPlayerTotal) {
      nextDealerTotal = Math.min(27, nextDealerTotal + 1);
    }

    const isWin = nextPlayerTotal <= 21 && (nextDealerTotal > 21 || nextPlayerTotal > nextDealerTotal);

    cycleIntervalRef.current = setInterval(() => {
      setPlayerTotal(Math.floor(Math.random() * 24) + 4);
      setDealerTotal(Math.floor(Math.random() * 24) + 4);
    }, 50);

    dealTimerRef.current = setTimeout(() => {
      dealTimerRef.current = null;
      if (cycleIntervalRef.current !== null) {
        clearInterval(cycleIntervalRef.current);
        cycleIntervalRef.current = null;
      }

      const result: TwentyOneResult = {
        id: createOutcomeId(),
        playerTotal: nextPlayerTotal,
        dealerTotal: nextDealerTotal,
        isWin,
        timestamp: new Date(),
      };

      setPlayerTotal(nextPlayerTotal);
      setDealerTotal(nextDealerTotal);
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

      <div className="w-full relative px-6 py-10 bg-zinc-950/40 border border-zinc-900/80 rounded-2xl mb-8 min-h-[220px]">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 text-center">
            <div className="text-[11px] text-zinc-500 font-black uppercase tracking-wider">Player</div>
            <div className="text-5xl font-black font-mono mt-2 text-white">{playerTotal ?? '—'}</div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 text-center">
            <div className="text-[11px] text-zinc-500 font-black uppercase tracking-wider">Dealer</div>
            <div className="text-5xl font-black font-mono mt-2 text-white">{dealerTotal ?? '—'}</div>
          </div>
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
        </div>
      )}
    </div>
  );
});
