import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useSpring } from '@react-spring/web';
import type { RngWheelHandle, RngWheelProps } from './types';
import { RngWheelHeader } from './components/RngWheelHeader';
import { WheelVisual } from './components/WheelVisual';

import { RngWheelRules } from './components/RngWheelRules';

export const RngWheel = forwardRef<RngWheelHandle, RngWheelProps>(function RngWheel(
  {
    onSpinStart,
    onSpinComplete,
    onIsSpinningChange,
    spinRequest,
    initialHistory = [],
    disabled = false,
    className = '',
    spinDuration = 1500,
    initialWinChance = 10.00,
  },
  ref,
) {
  // --- Core State ---
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinStatus, setSpinStatus] = useState<'idle' | 'win' | 'loss'>('idle');
  const [multiplierDisplay, setMultiplierDisplay] = useState<string>('');
  const [winChance, setWinChance] = useState<number>(initialWinChance);
  const [rawWinChance, setRawWinChance] = useState<string>(initialWinChance.toFixed(2));

  const [stats, setStats] = useState(() => {
    let wins = 0;
    let losses = 0;
    let currentStreak = 0;
    let maxStreak = 0;
    const reversed = [...initialHistory].reverse();
    for (const h of reversed) {
      if (h.isWin) {
        wins++;
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        losses++;
        currentStreak = 0;
      }
    }
    return {
      totalPlays: initialHistory.length,
      wins,
      losses,
      currentStreak,
      maxStreak,
    };
  });

  // Cumulative rotation tracking to ensure the wheel always spins forward
  const cumulativeRotation = useRef<number>(0);
  const isSpinningRef = useRef(false);
  const spinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wiggleActiveRef = useRef(false);
  const prevSpinRequestRef = useRef(spinRequest);

  const setSpinning = useCallback(
    (value: boolean) => {
      isSpinningRef.current = value;
      setIsSpinning(value);
      onIsSpinningChange?.(value);
    },
    [onIsSpinningChange],
  );

  const clearSpinTimer = useCallback(() => {
    if (spinTimerRef.current !== null) {
      clearTimeout(spinTimerRef.current);
      spinTimerRef.current = null;
    }
    if (cycleIntervalRef.current !== null) {
      clearInterval(cycleIntervalRef.current);
      cycleIntervalRef.current = null;
    }
    wiggleActiveRef.current = false;
  }, []);

  useEffect(() => clearSpinTimer, [clearSpinTimer]);

  const handleChanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRawWinChance(e.target.value);
  };

  const handleChanceBlur = () => {
    let parsed = parseFloat(rawWinChance);
    if (isNaN(parsed) || parsed < 0) parsed = 0.00;
    if (parsed > 100) parsed = 100.00;
    const clamped = parseFloat(parsed.toFixed(2));
    setWinChance(clamped);
    setRawWinChance(clamped.toFixed(2));
  };

  const handleIncrement = () => {
    if (isSpinningRef.current || disabled) return;
    setWinChance(prev => {
      const next = Math.min(100, prev + 5);
      setRawWinChance(next.toFixed(2));
      return next;
    });
  };

  const handleDecrement = () => {
    if (isSpinningRef.current || disabled) return;
    setWinChance(prev => {
      const next = Math.max(0, prev - 5);
      setRawWinChance(next.toFixed(2));
      return next;
    });
  };

  // --- React Spring Animations ---

  // 1. Wheel rotation spring
  const [wheelStyles, wheelApi] = useSpring(() => ({
    rotate: 0,
    config: { mass: 1.8, tension: 100, friction: 20 },
  }));

  // 2. Pointer wiggle spring
  const [pointerStyles, pointerApi] = useSpring(() => ({
    rotate: 0,
    config: { mass: 0.5, tension: 350, friction: 12 },
  }));

  // 3. Center multiplier pop/glow spring
  const [centerStyles, centerApi] = useSpring(() => ({
    scale: 1,
    boxShadow: '0 0 15px rgba(99, 102, 241, 0.1), inset 0 0 4px rgba(255, 255, 255, 0.1)',
    config: { tension: 300, friction: 12 },
  }));

  // --- Core Game Logic ---

  const triggerSpin = useCallback(() => {
    if (isSpinningRef.current || disabled) return;

    clearSpinTimer();
    setSpinning(true);
    setSpinStatus('idle');

    onSpinStart?.();

    const outcomeAngle = Math.random() * 360;
    const halfWinRange = ((winChance / 100) * 360) / 2;
    const isWin = outcomeAngle <= halfWinRange || outcomeAngle >= (360 - halfWinRange);

    const targetAngle = (360 - outcomeAngle) % 360;
    const baseSpins = 720;
    const currentAngle = cumulativeRotation.current % 360;
    let angleDiff = targetAngle - currentAngle;
    if (angleDiff <= 0) {
      angleDiff += 360;
    }

    const nextRotation = cumulativeRotation.current + baseSpins + angleDiff;
    cumulativeRotation.current = nextRotation;

    cycleIntervalRef.current = setInterval(() => {
      setMultiplierDisplay((Math.random() * 12).toFixed(2) + 'x');
    }, 50);

    wiggleActiveRef.current = true;
    const triggerPointerWiggle = async () => {
      let delay = 60;
      while (wiggleActiveRef.current) {
        pointerApi.start({ to: { rotate: -6 }, config: { duration: delay } });
        await new Promise((resolve) => setTimeout(resolve, delay));
        if (!wiggleActiveRef.current) break;

        pointerApi.start({ to: { rotate: 6 }, config: { duration: delay } });
        await new Promise((resolve) => setTimeout(resolve, delay));

        delay = Math.min(delay * 1.08, 180);
      }
    };
    triggerPointerWiggle();

    wheelApi.start({
      to: { rotate: nextRotation },
      config: { mass: 2.0, tension: 80, friction: 22 },
    });

    spinTimerRef.current = setTimeout(() => {
      spinTimerRef.current = null;
      if (cycleIntervalRef.current !== null) {
        clearInterval(cycleIntervalRef.current);
        cycleIntervalRef.current = null;
      }
      wiggleActiveRef.current = false;

      const outcomeStatus = isWin ? 'win' : 'loss';
      setSpinStatus(outcomeStatus);
      setSpinning(false);
      setMultiplierDisplay(isWin ? 'WIN!' : 'MISS');

      pointerApi.start({
        to: [
          { rotate: isWin ? -18 : -10 },
          { rotate: isWin ? 14 : 8 },
          { rotate: isWin ? -8 : -4 },
          { rotate: 0 },
        ],
        config: { mass: 0.7, tension: 250, friction: 12 },
      });

      if (isWin) {
        centerApi.start({
          to: [
            {
              scale: 1.15,
              boxShadow:
                '0 0 25px rgba(16, 185, 129, 0.6), inset 0 0 8px rgba(255, 255, 255, 0.3)',
            },
            {
              scale: 1.0,
              boxShadow:
                '0 0 15px rgba(16, 185, 129, 0.2), inset 0 0 4px rgba(255, 255, 255, 0.1)',
            },
          ],
          config: { tension: 350, friction: 12 },
        });
      } else {
        centerApi.start({
          to: [
            {
              scale: 0.95,
              boxShadow:
                '0 0 10px rgba(225, 29, 72, 0.4), inset 0 0 4px rgba(255, 255, 255, 0.1)',
            },
            {
              scale: 1.0,
              boxShadow:
                '0 0 15px rgba(99, 102, 241, 0.1), inset 0 0 4px rgba(255, 255, 255, 0.1)',
            },
          ],
          config: { tension: 200, friction: 15 },
        });
      }

      setStats((prev) => {
        const newWins = isWin ? prev.wins + 1 : prev.wins;
        const newLosses = isWin ? prev.losses : prev.losses + 1;
        const currentStreak = isWin ? prev.currentStreak + 1 : 0;
        const maxStreak = Math.max(prev.maxStreak, currentStreak);
        return {
          totalPlays: prev.totalPlays + 1,
          wins: newWins,
          losses: newLosses,
          currentStreak,
          maxStreak,
        };
      });

      onSpinComplete?.(isWin);
    }, spinDuration);
  }, [
    centerApi,
    clearSpinTimer,
    disabled,
    onSpinComplete,
    onSpinStart,
    pointerApi,
    setSpinning,
    spinDuration,
    wheelApi,
    winChance,
  ]);

  useImperativeHandle(ref, () => ({ spin: triggerSpin }), [triggerSpin]);

  useEffect(() => {
    if (spinRequest === undefined) return;
    if (prevSpinRequestRef.current === spinRequest) return;
    prevSpinRequestRef.current = spinRequest;
    triggerSpin();
  }, [spinRequest, triggerSpin]);

  return (
    <div
      className={`w-full max-w-2xl glass-panel rounded-3xl p-8 relative flex flex-col items-center select-none transition-all duration-300
        ${spinStatus === 'win' ? 'animate-pulse-glow-green border-emerald-500/40 shadow-emerald-950/20' : ''}
        ${spinStatus === 'loss' ? 'animate-pulse-glow-red border-rose-500/40 shadow-rose-950/20' : ''}
        ${className}
      `}
    >
      {/* --- Top Panel: Title & Stats --- */}
      <RngWheelHeader stats={stats} />

      {/* --- Middle Section: Spinning Wheel Visual --- */}
      <WheelVisual
        wheelStyles={wheelStyles}
        pointerStyles={pointerStyles}
        centerStyles={centerStyles}
        isSpinning={isSpinning}
        spinStatus={spinStatus}
        multiplierDisplay={multiplierDisplay}
        winChance={winChance}
      />

      {/* --- Lower Panel: Controls --- */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-end mt-2">

        {/* Win Chance Input */}
        <div className="flex flex-col gap-2 text-left">
           <label className="text-zinc-400 text-xs font-black tracking-wider uppercase flex items-center gap-1">
             Win Chance %
           </label>
           <div className="relative flex items-center">
             <input
               type="text"
               value={rawWinChance}
               onChange={handleChanceChange}
               onBlur={handleChanceBlur}
               disabled={isSpinning || disabled}
               className="w-full glass-input rounded-xl px-12 py-3.5 text-center text-lg font-black font-mono text-white disabled:opacity-60 disabled:cursor-not-allowed border border-zinc-800/60"
             />
             <button
               type="button"
               onClick={handleDecrement}
               disabled={isSpinning || disabled || winChance <= 0}
               className="absolute left-2 w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold"
               aria-label="Decrease win chance by 5%"
             >
               -
             </button>
             <button
               type="button"
               onClick={handleIncrement}
               disabled={isSpinning || disabled || winChance >= 100}
               className="absolute right-8 w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold"
               aria-label="Increase win chance by 5%"
             >
               +
             </button>
             <span className="absolute right-3 text-zinc-500 font-bold select-none">%</span>
           </div>
        </div>

        {/* Spin Action Trigger Button */}
        <button
          type="button"
          disabled={isSpinning || disabled}
          onClick={triggerSpin}
          className={`w-full py-4 text-base font-extrabold tracking-wider uppercase rounded-xl transition-all duration-300 shadow-md select-none disabled:cursor-not-allowed disabled:opacity-60
            ${
              isSpinning
                ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 shadow-none'
                : 'bg-rose-600 border border-rose-500 text-white hover:bg-rose-500 hover:shadow-rose-500/20 active:scale-95 shadow-[0_4px_20px_rgba(225,29,72,0.3)]'
            }
          `}
        >
          {isSpinning ? 'SPINNING...' : 'SPIN WHEEL'}
        </button>
      </div>

      {/* --- Footer Guide / Explainer --- */}
      <RngWheelRules />
    </div>
  );
});
