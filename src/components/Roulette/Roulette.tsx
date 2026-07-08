import {
  forwardRef,
  useId,
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
  RouletteColor,
  RouletteHandle,
  RouletteProps,
  RouletteSpinResult,
} from './types';

// Standard roulette red numbers (0 resolves to green).
const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const ROULETTE_COLORS: RouletteColor[] = ['red', 'black', 'green'];

function resolveRouletteColor(value: number): RouletteColor {
  if (value === 0) return 'green';
  return RED_NUMBERS.has(value) ? 'red' : 'black';
}

export const Roulette = forwardRef<RouletteHandle, RouletteProps>(function Roulette(
  {
    onSpinStart,
    onSpinComplete,
    onIsSpinningChange,
    spinRequest,
    initialPrediction = 'red',
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
  const landedNumberLabelId = useId();
  const trackSession = showHeader || showHistory;
  const [prediction, setPrediction] = useState<RouletteColor>(initialPrediction);
  const [spinStatus, setSpinStatus] = useState<'idle' | 'win' | 'loss'>('idle');
  const [displayNumber, setDisplayNumber] = useState<string>('—');
  const [result, setResult] = useState<RouletteSpinResult | null>(null);
  const { stats, history, recordOutcome } = useGameSession<RouletteSpinResult>({
    initialHistory: trackSession ? initialHistory : [],
  });

  const spinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const executeRef = useRef<() => void>(() => {});

  const clearSpinTimer = useCallback(() => {
    if (spinTimerRef.current !== null) {
      clearTimeout(spinTimerRef.current);
      spinTimerRef.current = null;
    }
    if (cycleIntervalRef.current !== null) {
      clearInterval(cycleIntervalRef.current);
      cycleIntervalRef.current = null;
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

    cycleIntervalRef.current = setInterval(() => {
      setDisplayNumber(String(Math.floor(rng() * 37)));
    }, 45);

    const landedNumber = Math.floor(rng() * 37);
    const landedColor = resolveRouletteColor(landedNumber);
    const isWin = landedColor === prediction;

    spinTimerRef.current = setTimeout(() => {
      spinTimerRef.current = null;
      if (cycleIntervalRef.current !== null) {
        clearInterval(cycleIntervalRef.current);
        cycleIntervalRef.current = null;
      }

      const spinResult: RouletteSpinResult = {
        id: createOutcomeId(),
        number: landedNumber,
        color: landedColor,
        prediction,
        isWin,
        timestamp: new Date(),
      };

      setDisplayNumber(String(landedNumber));
      setResult(spinResult);
      setSpinStatus(isWin ? 'win' : 'loss');
      setBusy(false);

      if (trackSession) {
        recordOutcome(spinResult);
      }

      onSpinComplete?.(spinResult, isWin);
    }, spinDuration);
  }, [
    clearSpinTimer,
    guardExecute,
    onSpinComplete,
    onSpinStart,
    prediction,
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

      <div className="w-full relative px-6 py-10 bg-zinc-950/40 border border-zinc-900/80 rounded-2xl mb-8 flex flex-col items-center justify-center min-h-[220px]">
        <div className="text-xs text-zinc-500 tracking-widest uppercase font-black" id={landedNumberLabelId}>
          Landed Number
        </div>
        <div
          className="text-7xl font-black font-mono leading-none mt-2 text-white"
          role="status"
          aria-live="polite"
          aria-labelledby={landedNumberLabelId}
        >
          {displayNumber}
        </div>
        {result && (
          <div
            className={`mt-4 px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider
              ${result.color === 'red' ? 'bg-red-500/20 border-red-500/50 text-red-400' : ''}
              ${result.color === 'black' ? 'bg-zinc-700/30 border-zinc-500/50 text-zinc-100' : ''}
              ${result.color === 'green' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : ''}
            `}
          >
            {result.color}
          </div>
        )}
      </div>

      <div className="w-full flex flex-col gap-6">
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3">
          {ROULETTE_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setPrediction(color)}
              disabled={isSpinning || disabled}
              aria-label={`Bet ${color}`}
              aria-disabled={isSpinning || disabled}
              className={`py-3 rounded-xl text-xs font-black tracking-wider uppercase border transition-all
                ${prediction === color ? 'border-indigo-400 text-white bg-indigo-500/20' : 'border-zinc-700 text-zinc-400 bg-zinc-900/60 hover:text-zinc-200'}
                ${isSpinning || disabled ? 'opacity-60 cursor-not-allowed' : ''}
              `}
            >
              Bet {color}
            </button>
          ))}
        </div>

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
          {isSpinning ? 'SPINNING...' : `SPIN (${prediction.toUpperCase()})`}
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
          Pick a color and spin. 0 is green; all other numbers are red or black. You win when your color matches.
        </div>
      )}
    </div>
  );
});
