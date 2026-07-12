import {
  forwardRef,
  useCallback,
  useMemo,
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
  ChipPlacement,
  RouletteBet,
  RouletteHandle,
  RouletteProps,
  RouletteSpot,
  RouletteSpinResult,
  SpotStack,
} from './types';
import {
  DEFAULT_CHIP_VALUES,
  betToSpot,
  resolveRouletteColor,
  settleStacks,
  spotKey,
  spotLabel,
  spotToLegacyBet,
  stacksFromPlacements,
  totalWager,
} from './rouletteMath';
import { RouletteWheelVisual } from './components/RouletteWheelVisual';
import { RouletteBettingBoard } from './components/RouletteBettingBoard';
import { RouletteControls } from './components/RouletteControls';

function createPlacementId(): string {
  return `chip-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function seedStacks(
  initialBet?: RouletteBet,
  initialPrediction?: RouletteProps['initialPrediction'],
): Map<string, SpotStack> {
  const map = new Map<string, SpotStack>();
  if (initialBet) {
    const spot = betToSpot(initialBet);
    map.set(spotKey(spot), { spot, amount: 1 });
    return map;
  }
  if (initialPrediction !== undefined) {
    const spot = betToSpot({ type: 'color', color: initialPrediction });
    map.set(spotKey(spot), { spot, amount: 1 });
  }
  return map;
}

export const Roulette = forwardRef<RouletteHandle, RouletteProps>(function Roulette(
  {
    onSpinStart,
    onSpinComplete,
    onIsSpinningChange,
    spinRequest,
    initialPrediction,
    initialBet,
    initialChipValue,
    chipValues = DEFAULT_CHIP_VALUES,
    initialHistory = [],
    disabled = false,
    className = '',
    spinDuration = 2400,
    rng: rngProp,
    showHeader = false,
    showHistory = false,
    showRules = false,
  },
  ref,
) {
  const rng = resolveRng(rngProp);
  const trackSession = showHeader || showHistory;

  const [stacks, setStacks] = useState<Map<string, SpotStack>>(() =>
    seedStacks(initialBet, initialPrediction),
  );
  const [historyActions, setHistoryActions] = useState<ChipPlacement[]>([]);
  const [chipValue, setChipValue] = useState(
    () => initialChipValue ?? chipValues[0] ?? 1,
  );
  const [spinStatus, setSpinStatus] = useState<'idle' | 'win' | 'loss'>('idle');
  const [result, setResult] = useState<RouletteSpinResult | null>(null);
  const [targetNumber, setTargetNumber] = useState<number | null>(null);
  const { stats, history, recordOutcome } = useGameSession<RouletteSpinResult>({
    initialHistory: trackSession ? initialHistory : [],
  });

  const spinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const executeRef = useRef<() => void>(() => {});
  const stacksRef = useRef(stacks);
  stacksRef.current = stacks;

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

  const stackList = useMemo(() => stacksFromPlacements(stacks), [stacks]);
  const wagered = useMemo(() => totalWager(stackList), [stackList]);
  const canPlay = wagered > 0;

  const placeChip = useCallback(
    (spot: RouletteSpot) => {
      if (isSpinning || disabled) return;
      const amount = chipValue;
      if (amount <= 0) return;

      setStacks((prev) => {
        const next = new Map(prev);
        const key = spotKey(spot);
        const existing = next.get(key);
        next.set(key, {
          spot,
          amount: (existing?.amount ?? 0) + amount,
        });
        return next;
      });
      setHistoryActions((prev) => [
        ...prev,
        { id: createPlacementId(), spot, amount },
      ]);
      setSpinStatus('idle');
    },
    [chipValue, disabled, isSpinning],
  );

  const undoChip = useCallback(() => {
    if (isSpinning || disabled) return;
    setHistoryActions((prev) => {
      if (prev.length === 0) return prev;
      const nextActions = prev.slice(0, -1);
      const last = prev[prev.length - 1];
      setStacks((stacksPrev) => {
        const next = new Map(stacksPrev);
        const key = spotKey(last.spot);
        const existing = next.get(key);
        if (!existing) return next;
        const remaining = existing.amount - last.amount;
        if (remaining <= 0) next.delete(key);
        else next.set(key, { spot: last.spot, amount: remaining });
        return next;
      });
      return nextActions;
    });
  }, [disabled, isSpinning]);

  const clearChips = useCallback(() => {
    if (isSpinning || disabled) return;
    setStacks(new Map());
    setHistoryActions([]);
  }, [disabled, isSpinning]);

  const scaleStacks = useCallback(
    (factor: number) => {
      if (isSpinning || disabled) return;
      setStacks((prev) => {
        const next = new Map<string, SpotStack>();
        for (const [key, stack] of prev) {
          const amount =
            factor < 1
              ? Math.max(0, Math.floor(stack.amount * factor))
              : Math.floor(stack.amount * factor);
          if (amount > 0) next.set(key, { spot: stack.spot, amount });
        }
        return next;
      });
      setHistoryActions([]);
    },
    [disabled, isSpinning],
  );

  const triggerSpin = useCallback(() => {
    const currentStacks = stacksFromPlacements(stacksRef.current);
    if (totalWager(currentStacks) <= 0) return;
    if (!guardExecute()) return;

    clearSpinTimer();
    setBusy(true);
    setSpinStatus('idle');
    setResult(null);
    onSpinStart?.();

    const landedNumber = Math.floor(rng() * 37);
    setTargetNumber(landedNumber);
    const landedColor = resolveRouletteColor(landedNumber);
    const settlements = settleStacks(currentStacks, landedNumber);
    const totalWagered = totalWager(currentStacks);
    const totalReturned = settlements.reduce((sum, s) => sum + s.returned, 0);
    const profit = totalReturned - totalWagered;
    const isWin = profit > 0;
    const primarySpot = currentStacks[0]?.spot;
    const legacyBet = primarySpot
      ? spotToLegacyBet(primarySpot)
      : ({ type: 'color', color: 'red' } as RouletteBet);

    spinTimerRef.current = setTimeout(() => {
      spinTimerRef.current = null;

      const spinResult: RouletteSpinResult = {
        id: createOutcomeId(),
        number: landedNumber,
        color: landedColor,
        prediction: landedColor,
        bet: legacyBet,
        totalWagered,
        totalReturned,
        profit,
        settlements,
        isWin,
        timestamp: new Date(),
      };

      setResult(spinResult);
      setSpinStatus(isWin ? 'win' : 'loss');
      setBusy(false);
      setTargetNumber(null);
      setStacks(new Map());
      setHistoryActions([]);

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
    recordOutcome,
    rng,
    setBusy,
    spinDuration,
    trackSession,
  ]);

  executeRef.current = triggerSpin;

  return (
    <div
      className={`w-full max-w-5xl rounded-2xl border border-[#2f4553] bg-[#0f212e] p-3 sm:p-5 relative flex flex-col select-none transition-[box-shadow,border-color] duration-500
        ${spinStatus === 'win' ? 'border-emerald-500/30 shadow-[0_0_36px_rgba(0,231,1,0.14)]' : ''}
        ${spinStatus === 'loss' ? 'border-rose-500/25 shadow-[0_0_28px_rgba(225,29,72,0.12)]' : ''}
        ${className}
      `}
    >
      {showHeader && (
        <div className="mb-3">
          <StatsHeader
            title="ROULETTE"
            icon={<CircleDot className="w-5 h-5 text-red-400 animate-pulse" />}
            stats={stats}
          />
        </div>
      )}

      <div className="flex flex-col-reverse lg:flex-row gap-3 sm:gap-4">
        <RouletteControls
          chipValues={chipValues}
          chipValue={chipValue}
          onChipValueChange={setChipValue}
          totalAmount={wagered}
          onHalve={() => scaleStacks(0.5)}
          onDouble={() => scaleStacks(2)}
          onPlay={triggerSpin}
          disabled={disabled}
          isSpinning={isSpinning}
          canPlay={canPlay}
        />

        <div className="flex-1 min-w-0 flex flex-col gap-3 rounded-xl bg-[#071824] border border-[#2f4553] p-3 sm:p-4">
          <RouletteWheelVisual
            isSpinning={isSpinning}
            targetNumber={targetNumber}
            result={result}
            spinStatus={spinStatus}
            spinDuration={spinDuration}
          />

          <div role="status" aria-live="polite" className="sr-only">
            {!isSpinning && result
              ? `Landed ${result.number} (${result.color}). ${
                  result.isWin
                    ? `Win ${result.profit}.`
                    : `Loss ${Math.abs(result.profit)}.`
                }`
              : isSpinning
                ? 'Wheel spinning…'
                : ''}
          </div>

          <RouletteBettingBoard
            stacks={stacks}
            onPlace={placeChip}
            onUndo={undoChip}
            onClear={clearChips}
            disabled={isSpinning || disabled}
            lastNumber={result?.number ?? null}
            canUndo={historyActions.length > 0}
          />
        </div>
      </div>

      {showHistory && (
        <div className="w-full mt-3 rounded-xl border border-[#2f4553] bg-[#071824] p-3 sm:p-4">
          <div className="text-zinc-400 text-xs font-black uppercase tracking-wider mb-3">
            Last {history.length} spins
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-zinc-500">No spins yet. Place chips and press Play.</p>
          ) : (
            <ul className="space-y-2">
              {history
                .slice(-8)
                .reverse()
                .map((entry) => (
                  <li
                    key={entry.id}
                    className="text-sm text-zinc-300 font-mono flex flex-wrap justify-between gap-2"
                  >
                    <span>
                      #{entry.number} ({entry.color}) · {entry.settlements.length} bet
                      {entry.settlements.length === 1 ? '' : 's'}
                    </span>
                    <span className={entry.isWin ? 'text-emerald-400' : 'text-rose-400'}>
                      {entry.isWin ? `+${entry.profit}` : entry.profit}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}

      {showRules && (
        <div className="w-full mt-3 rounded-xl border border-[#2f4553] bg-[#071824] p-3 sm:p-4 text-sm text-zinc-400">
          Select a chip, then tap any number of spots on the cloth — stacks add up. Straight
          numbers pay 35:1; dozens/columns 2:1; even-money outside bets 1:1. Undo removes the
          last chip; Clear wipes the table. European wheel (single zero).
          {stackList.length > 0 && (
            <span className="block mt-2 text-zinc-500">
              Active:{' '}
              {stackList.map((s) => `${spotLabel(s.spot)}×${s.amount}`).join(', ')}
            </span>
          )}
        </div>
      )}
    </div>
  );
});
