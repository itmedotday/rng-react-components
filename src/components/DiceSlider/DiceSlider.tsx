import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useSpring } from '@react-spring/web';
import { createOutcomeId } from '../../lib/session';
import { resolveRng } from '../../lib/rng';
import { useGameSession } from '../../lib/useGameSession';
import { useGameTrigger } from '../../lib/useGameTrigger';
import { StatsHeader } from '../../lib/components/StatsHeader';
import type { DiceSliderHandle, DiceSliderProps, RollResult } from './types';
import { HistoryLedger } from './components/HistoryLedger';
import { InteractiveTrack } from './components/InteractiveTrack';
import { OutcomeBadge } from './components/OutcomeBadge';
import { ControlInputs } from './components/ControlInputs';

export const DiceSlider = forwardRef<DiceSliderHandle, DiceSliderProps>(function DiceSlider(
  {
    onRollStart,
    onRollComplete,
    onIsRollingChange,
    rollRequest,
    initialHistory = [],
    initialTarget = 50.00,
    initialIsRollOver = true,
    disabled = false,
    className = '',
    minTarget = 0.01,
    maxTarget = 99.99,
    animationDuration = 400,
    rng: rngProp,
    showHeader = false,
    showHistory = false,
  },
  ref,
) {
  const rng = resolveRng(rngProp);
  const trackSession = showHeader || showHistory;
  // --- Core State ---
  const [rollTarget, setRollTarget] = useState<number>(initialTarget);
  const [isRollOver, setIsRollOver] = useState<boolean>(initialIsRollOver);

  // Rolling & Outcome
  const [rollOutcome, setRollOutcome] = useState<number | null>(null);
  const [previousRoll, setPreviousRoll] = useState<number | null>(null);
  const [cyclingNumber, setCyclingNumber] = useState<string>("50.00");
  const [rollStatus, setRollStatus] = useState<'idle' | 'win' | 'loss'>('idle');
  const { stats, history: rollHistory, recordOutcome } = useGameSession<RollResult>({
    initialHistory: trackSession ? initialHistory : [],
  });

  // Raw Input Strings (Allows natural typing and formats on blur)
  const [rawTarget, setRawTarget] = useState<string>(initialTarget.toFixed(2));
  const [rawChance, setRawChance] = useState<string>(
    (initialIsRollOver ? 100 - initialTarget : initialTarget).toFixed(4)
  );

  // Custom Slider Interaction
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const rollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const executeRef = useRef<() => void>(() => {});

  const clearRollTimer = useCallback(() => {
    if (rollTimerRef.current !== null) {
      clearTimeout(rollTimerRef.current);
      rollTimerRef.current = null;
    }
    if (cycleIntervalRef.current !== null) {
      clearInterval(cycleIntervalRef.current);
      cycleIntervalRef.current = null;
    }
  }, []);

  const { isBusy: isRolling, isBusyRef: isRollingRef, setBusy, guardExecute } = useGameTrigger(ref, {
    disabled,
    request: rollRequest,
    onBusyChange: onIsRollingChange,
    execute: () => executeRef.current(),
    handle: { roll: () => executeRef.current() },
    clearTimers: clearRollTimer,
  });

  // Sync Input Fields when target/mode changes from slider
  useEffect(() => {
    if (!isDragging) {
      setRawTarget(rollTarget.toFixed(2));
      if (isRollOver) {
        setRawChance((100 - rollTarget).toFixed(4));
      } else {
        setRawChance(rollTarget.toFixed(4));
      }
    }
  }, [rollTarget, isRollOver, isDragging]);

  // --- React Spring Animations ---

  // 1. Outcome Badge spring (x positioning, scale, opacity)
  const [badgeStyles, badgeApi] = useSpring(() => ({
    leftPercent: 50,
    scale: 0,
    opacity: 0,
    y: -44,
    config: { mass: 1.2, tension: 140, friction: 22 },
  }));

  // 2. Slider Thumb dynamic grow/glow spring
  const thumbStyles = useSpring({
    scale: isDragging ? 1.25 : 1.0,
    boxShadow: isDragging
      ? '0 0 20px rgba(99, 102, 241, 0.8), inset 0 0 8px rgba(255, 255, 255, 0.4)'
      : '0 0 10px rgba(99, 102, 241, 0.3), inset 0 0 4px rgba(255, 255, 255, 0.2)',
    config: { tension: 300, friction: 15 }
  });

  // --- Synchronization formulas & Input handlers ---

  // Handle Roll Over/Under Toggle change
  const handleToggleMode = () => {
    if (isRolling || disabled) return;

    const nextIsRollOver = !isRollOver;
    setIsRollOver(nextIsRollOver);

    // Re-calculate win chance immediately based on target
    const nextWinChance = nextIsRollOver ? 100.00 - rollTarget : rollTarget;
    setRawChance(nextWinChance.toFixed(4));

    // Clear outcome to avoid confusion
    setRollStatus('idle');
    setRollOutcome(null);
    badgeApi.start({ scale: 0, opacity: 0 });
  };

  // Sync from typing Roll Target input
  const handleTargetChange = (val: string) => {
    setRawTarget(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
      setRollTarget(parsed);
      const computedChance = isRollOver ? 100 - parsed : parsed;
      setRawChance(computedChance.toFixed(4));
    }
  };

  const handleTargetBlur = () => {
    let parsed = parseFloat(rawTarget);
    if (isNaN(parsed) || parsed < 0) parsed = 0.00;
    if (parsed > 100) parsed = 100.00;

    // Clamp to 2 decimal places
    const clampedTarget = parseFloat(parsed.toFixed(2));
    setRollTarget(clampedTarget);
    setRawTarget(clampedTarget.toFixed(2));

    // Finalize win chance sync
    const computedChance = isRollOver ? 100.00 - clampedTarget : clampedTarget;
    setRawChance(computedChance.toFixed(4));
  };

  // Sync from typing Win Chance input
  const handleChanceChange = (val: string) => {
    setRawChance(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
      // Backwards calculation:
      // Roll Over: Target = 100 - WinChance
      // Roll Under: Target = WinChance
      const computedTarget = isRollOver ? 100.00 - parsed : parsed;
      setRollTarget(parseFloat(computedTarget.toFixed(2)));
      setRawTarget(computedTarget.toFixed(2));
    }
  };

  const handleChanceBlur = () => {
    let parsed = parseFloat(rawChance);
    if (isNaN(parsed) || parsed < 0) parsed = 0.0000;
    if (parsed > 100) parsed = 100.0000;

    // Clamp to 4 decimal places
    const clampedChance = parseFloat(parsed.toFixed(4));
    setRawChance(clampedChance.toFixed(4));

    // Finalize target sync
    const computedTarget = isRollOver ? 100.00 - clampedChance : clampedChance;
    const clampedTarget = Math.max(minTarget, Math.min(maxTarget, parseFloat(computedTarget.toFixed(2))));
    setRollTarget(clampedTarget);
    setRawTarget(clampedTarget.toFixed(2));
  };

  // --- Drag mechanics for custom slider ---

  const updateFromCoordinates = (clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const rawPct = (relativeX / rect.width) * 100;
    // Enforce strict bounds based on min/max targets
    const clampedPct = Math.max(minTarget, Math.min(maxTarget, rawPct));

    // Precision format to 2 decimal places
    const roundedTarget = parseFloat(clampedPct.toFixed(2));
    setRollTarget(roundedTarget);
    setRawTarget(roundedTarget.toFixed(2));

    // Update Win Chance accordingly
    const computedChance = isRollOver ? 100 - roundedTarget : roundedTarget;
    setRawChance(computedChance.toFixed(4));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isRollingRef.current || disabled) return;
    setIsDragging(true);
    updateFromCoordinates(e.clientX);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      updateFromCoordinates(moveEvent.clientX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isRollingRef.current || disabled) return;
    setIsDragging(true);
    updateFromCoordinates(e.touches[0].clientX);

    const handleTouchMove = (moveEvent: TouchEvent) => {
      updateFromCoordinates(moveEvent.touches[0].clientX);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
  };

  // --- Rolling Simulation Logic ---

  const triggerRoll = useCallback(() => {
    if (!guardExecute()) return;

    clearRollTimer();
    setBusy(true);
    setRollStatus('idle');
    setRollOutcome(null);

    onRollStart?.();

    const outcomeValue = parseFloat((rng() * 100).toFixed(2));
    const isWin = isRollOver ? outcomeValue >= rollTarget : outcomeValue <= rollTarget;

    cycleIntervalRef.current = setInterval(() => {
      setCyclingNumber((Math.random() * 100).toFixed(2));
    }, 30);

    const startPos = previousRoll !== null ? previousRoll : 50.00;

    badgeApi.start({
      from: { leftPercent: startPos, scale: 0.8, opacity: previousRoll !== null ? 1 : 0 },
      to: { leftPercent: outcomeValue, scale: 1.0, opacity: 1 },
      config: { mass: 0.8, tension: 220, friction: 22 },
    });

    rollTimerRef.current = setTimeout(() => {
      rollTimerRef.current = null;
      if (cycleIntervalRef.current !== null) {
        clearInterval(cycleIntervalRef.current);
        cycleIntervalRef.current = null;
      }

      setCyclingNumber(outcomeValue.toFixed(2));
      setRollOutcome(outcomeValue);
      const outcomeStatus = isWin ? 'win' : 'loss';
      setRollStatus(outcomeStatus);
      setBusy(false);
      setPreviousRoll(outcomeValue);

      if (trackSession) {
        recordOutcome({
          id: createOutcomeId(),
          outcome: outcomeValue,
          isWin,
          target: rollTarget,
          isRollOver,
          timestamp: new Date(),
        });
      }

      onRollComplete?.(outcomeValue, isWin);
    }, animationDuration);
  }, [
    animationDuration,
    badgeApi,
    clearRollTimer,
    guardExecute,
    isRollOver,
    onRollComplete,
    onRollStart,
    previousRoll,
    recordOutcome,
    rng,
    rollTarget,
    setBusy,
    trackSession,
  ]);

  executeRef.current = triggerRoll;

  return (
    <div className={`w-full max-w-2xl glass-panel rounded-3xl p-8 relative flex flex-col items-center select-none transition-all duration-300
      ${rollStatus === 'win' ? 'animate-pulse-glow-green border-emerald-500/40 shadow-emerald-950/20' : ''}
      ${rollStatus === 'loss' ? 'animate-pulse-glow-red border-rose-500/40 shadow-rose-950/20' : ''}
      ${className}
    `}>

      {showHeader && (
        <StatsHeader
          title="PROBABILITY SLIDER"
          icon={
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
          }
          stats={stats}
        />
      )}

      {/* --- Middle Section: Slider Console Container --- */}
      <InteractiveTrack
        rollTarget={rollTarget}
        isRollOver={isRollOver}
        isRolling={isRolling}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        trackRef={trackRef}
        thumbStyles={thumbStyles}
      >
        {/* Decoupled Roll Outcome Badge */}
        <OutcomeBadge
          style={{
            left: badgeStyles.leftPercent.to(p => `${p}%`),
            transform: 'translateX(-50%)',
            opacity: badgeStyles.opacity,
            scale: badgeStyles.scale,
            top: badgeStyles.y,
          }}
          isRolling={isRolling}
          cyclingNumber={cyclingNumber}
          rollOutcome={rollOutcome}
          rollStatus={rollStatus}
        />
      </InteractiveTrack>

      {/* --- Lower Panel: Controls & history (coin-flip layout) --- */}
      <div className="w-full flex flex-col gap-6">
        <ControlInputs
          isRollOver={isRollOver}
          isRolling={isRolling}
          rawTarget={rawTarget}
          rawChance={rawChance}
          onTargetChange={handleTargetChange}
          onTargetBlur={handleTargetBlur}
          onChanceChange={handleChanceChange}
          onChanceBlur={handleChanceBlur}
          onToggleMode={handleToggleMode}
          onRollTrigger={triggerRoll}
          disabled={disabled}
        />

        {showHistory && <HistoryLedger history={rollHistory} />}
      </div>
    </div>
  );
});
