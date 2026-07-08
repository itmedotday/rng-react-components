import {
  forwardRef,
  useCallback,
  useRef,
  useState,
} from 'react';
import { CircleDot } from 'lucide-react';
import { createOutcomeId } from '../../lib/session';
import { resolveRng } from '../../lib/rng';
import { useGameSession } from '../../lib/useGameSession';
import { useGameTrigger } from '../../lib/useGameTrigger';
import { StatsHeader } from '../../lib/components/StatsHeader';
import type {
  RouletteBet,
  RouletteColor,
  RouletteHandle,
  RouletteProps,
  RouletteSpinResult,
} from './types';
import { RouletteWheelVisual } from './components/RouletteWheelVisual';
import { RouletteBettingBoard } from './components/RouletteBettingBoard';

// Standard single-zero roulette red numbers.
const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

function resolveRouletteColor(value: number): RouletteColor {
  if (value === 0) return 'green';
  return RED_NUMBERS.has(value) ? 'red' : 'black';
}

function isWinForBet(landedNumber: number, landedColor: RouletteColor, bet: RouletteBet): boolean {
  if (bet.type === 'color') return bet.color === landedColor;
  return bet.number === landedNumber;
}

function betLabel(bet: RouletteBet): string {
  if (bet.type === 'number') return `#${bet.number}`;
  return bet.color.toUpperCase();
}

export const Roulette = forwardRef<RouletteHandle, RouletteProps>(function Roulette(
  {
    onSpinStart,
    onSpinComplete,
    onIsSpinningChange,
    spinRequest,
    initialPrediction = 'red',
    initialBet,
    initialHistory = [],
    disabled = false,
    className = '',
    spinDuration = 1300,
    rng: rngProp,
    showHeader = false,
    showHistory = false,
    showRules = false,
  },
  ref,
) {
  const rng = resolveRng(rngProp);
  const trackSession = showHeader || showHistory;

  // Resolve initial bet from either initialBet or the legacy initialPrediction
  const resolvedInitialBet: RouletteBet = initialBet ?? {
    type: 'color',
    color: initialPrediction,
  };

  const [activeBet, setActiveBet] = useState<RouletteBet>(resolvedInitialBet);
  const [spinStatus, setSpinStatus] = useState<'idle' | 'win' | 'loss'>('idle');
  const [result, setResult] = useState<RouletteSpinResult | null>(null);
  const { stats, history, recordOutcome } = useGameSession<RouletteSpinResult>({
    initialHistory: trackSession ? initialHistory : [],
  });

  const spinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const executeRef = useRef<() => void>(() => {});

  const clearSpinTimer = useCallback(() => {
    if (spinTimerRef.current !== null) {
      clearTimeout(spinTimerRef.current);
      spinTimerRef.current = null;
    }
  }, []);

  const { isBusy: isSpinning, setBusy, guardExecute } = useGameTrigger(ref, {
    disabled,
    request: spinRequest,
    onBusyChange: onIsSpinningChange,
    execute: () => executeRef.current(),
    handle: { spin: () => executeRef.current() },
    clearTimers: clearSpinTimer,
  });

  const triggerSpin = useCallback(() => {
    if (!guardExecute()) return;

    clearSpinTimer();
    setBusy(true);
    setSpinStatus('idle');
    setResult(null);
    onSpinStart?.();

    const landedNumber = Math.floor(rng() * 37);
    const landedColor = resolveRouletteColor(landedNumber);
    const isWin = isWinForBet(landedNumber, landedColor, activeBet);

    // prediction field kept for backward compat (colour of landed pocket)
    const prediction: RouletteColor =
      activeBet.type === 'color' ? activeBet.color : landedColor;

    spinTimerRef.current = setTimeout(() => {
      spinTimerRef.current = null;

      const spinResult: RouletteSpinResult = {
        id: createOutcomeId(),
        number: landedNumber,
        color: landedColor,
        prediction,
        bet: activeBet,
        isWin,
        timestamp: new Date(),
      };

      setResult(spinResult);
      setSpinStatus(isWin ? 'win' : 'loss');
      setBusy(false);

      if (trackSession) {
        recordOutcome(spinResult);
      }

      onSpinComplete?.(spinResult, isWin);
    }, spinDuration);
  }, [
    activeBet,
    clearSpinTimer,
    guardExecute,
    onSpinComplete,
    onSpinStart,
    recordOutcome,
    rng,
    setBusy,
    spinDuration,
    trackSession,
  ]);

  executeRef.current = triggerSpin;

  return (
    <div
      className={`w-full max-w-2xl glass-panel rounded-3xl p-8 relative flex flex-col items-center select-none transition-all duration-300
        ${spinStatus === 'win' ? 'animate-pulse-glow-green border-emerald-500/40 shadow-emerald-950/20' : ''}
        ${spinStatus === 'loss' ? 'animate-pulse-glow-red border-rose-500/40 shadow-rose-950/20' : ''}
        ${className}
      `}
    >
      {showHeader && (
        <StatsHeader
          title="ROULETTE CONSOLE"
          icon={<CircleDot className="w-5 h-5 text-red-400 animate-pulse" />}
          stats={stats}
        />
      )}

      {/* Animated roulette wheel with spinning ball */}
      <RouletteWheelVisual
        isSpinning={isSpinning}
        result={result}
        spinStatus={spinStatus}
      />

      <div className="w-full flex flex-col gap-4">
        {/* Betting board (number grid + colour bets) */}
        <RouletteBettingBoard
          bet={activeBet}
          onBetChange={setActiveBet}
          disabled={isSpinning || disabled}
          lastNumber={result?.number ?? null}
        />

        {/* Spin button */}
        <button
          type="button"
          disabled={isSpinning || disabled}
          onClick={triggerSpin}
          className={`w-full py-4.5 rounded-2xl font-black text-base tracking-widest uppercase transition-all duration-300 shadow-lg text-white select-none
            ${
              isSpinning || disabled
                ? 'bg-zinc-800 border border-zinc-700 text-zinc-500 cursor-not-allowed shadow-none'
                : 'bg-red-600 border border-red-500 hover:bg-red-500 shadow-red-950/20 active:translate-y-0.5 cursor-pointer'
            }
          `}
        >
          {isSpinning ? 'SPINNING...' : `SPIN (${betLabel(activeBet)})`}
        </button>

        {showHistory && (
          <div className="w-full rounded-2xl border border-zinc-800/80 bg-zinc-950/30 p-4">
            <div className="text-zinc-400 text-xs font-black uppercase tracking-wider mb-3">
              Last {history.length} spins
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-zinc-500">No spins yet.</p>
            ) : (
              <ul className="space-y-2">
                {history.slice(-8).reverse().map((entry) => (
                  <li key={entry.id} className="text-sm text-zinc-300 font-mono flex justify-between gap-2">
                    <span>#{entry.number} ({entry.color})</span>
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
          Pick a colour or a specific number on the betting board and spin. 0 is green; all
          other numbers are red or black. You win when your selection matches.
        </div>
      )}
    </div>
  );
});
