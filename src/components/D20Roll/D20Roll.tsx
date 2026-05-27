import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { to, useSpring } from '@react-spring/web';
import type { D20RollHandle, D20RollProps, D20RollResult } from './types';
import { clampTarget, computeWinChancePct } from './types';
import { D20RollHeader } from './components/D20RollHeader';
import { D20Visual } from './components/D20Visual';
import { DcControl } from './components/DcControl';
import { D20RollHistory } from './components/D20RollHistory';
import { D20RollRules } from './components/D20RollRules';

function buildStatsFromHistory(initialHistory: D20RollResult[]) {
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
}

export const D20Roll = forwardRef<D20RollHandle, D20RollProps>(function D20Roll(
  {
    onRollStart,
    onRollComplete,
    onIsRollingChange,
    rollRequest,
    initialTarget = 11,
    initialHistory = [],
    disabled = false,
    className = '',
    animationDuration = 950,
    diceSrc,
  },
  ref,
) {
  const [target, setTarget] = useState<number>(clampTarget(initialTarget));
  const [rawTarget, setRawTarget] = useState<string>(String(clampTarget(initialTarget)));
  const [rawWinChance, setRawWinChance] = useState<string>(
    computeWinChancePct(clampTarget(initialTarget)),
  );

  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [rollOutcome, setRollOutcome] = useState<number | null>(null);
  const [displayValue, setDisplayValue] = useState<string>('—');
  const [rollStatus, setRollStatus] = useState<'idle' | 'win' | 'loss'>('idle');
  const [isCritical, setIsCritical] = useState(false);
  const [isFumble, setIsFumble] = useState(false);
  const [history, setHistory] = useState<D20RollResult[]>(initialHistory);
  const [stats, setStats] = useState(() => buildStatsFromHistory(initialHistory));

  const isRollingRef = useRef(false);
  const rollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevRollRequestRef = useRef(rollRequest);

  const cumulativeRotation = useRef({ rotateY: 0 });

  const [dieStyles, dieApi] = useSpring(() => ({
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    scale: 1,
    config: { mass: 1.4, tension: 140, friction: 16 },
  }));

  const setRolling = useCallback(
    (value: boolean) => {
      isRollingRef.current = value;
      setIsRolling(value);
      onIsRollingChange?.(value);
    },
    [onIsRollingChange],
  );

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

  useEffect(() => clearRollTimer, [clearRollTimer]);

  const handleTargetChange = (value: string) => {
    setRawTarget(value);
  };

  const handleTargetBlur = () => {
    const parsed = parseInt(rawTarget, 10);
    const next = Number.isFinite(parsed) ? clampTarget(parsed) : target;
    setTarget(next);
    setRawTarget(String(next));
    setRawWinChance(computeWinChancePct(next));
  };

  const triggerRoll = useCallback(() => {
    if (isRollingRef.current || disabled) return;

    clearRollTimer();
    setRolling(true);
    setRollStatus('idle');
    setRollOutcome(null);
    setIsCritical(false);
    setIsFumble(false);

    onRollStart?.();

    const roll = Math.floor(Math.random() * 20) + 1;
    const isWin = roll >= target;
    const critical = roll === 20;
    const fumble = roll === 1;

    cycleIntervalRef.current = setInterval(() => {
      setDisplayValue(String(Math.floor(Math.random() * 20) + 1));
    }, 50);

    const wobbleX = 25 + Math.random() * 10;
    const wobbleZ = (Math.random() - 0.5) * 50;

    // CoinFlip-style: always land face-on (0deg mod 360).
    // Extra Y spin MUST be multiples of 360 only; CoinFlip uses 1440 (4×360).
    // A random remainder like 1080+k (k in [0,359]) would leave the wrong mod —
    // the die settles edge-on or showing the rim instead of the result face.
    const fullSpinY = (3 + Math.floor(Math.random() * 4)) * 360;
    const baseSpinsY = fullSpinY;
    const targetAngle = 0;
    const currentAngle = cumulativeRotation.current.rotateY % 360;
    let angleDiff = targetAngle - currentAngle;
    if (angleDiff <= 0) {
      angleDiff += 360;
    }
    const nextRotationY = cumulativeRotation.current.rotateY + baseSpinsY + angleDiff;
    cumulativeRotation.current.rotateY = nextRotationY;

    dieApi.start({
      from: { rotateX: 0, scale: 1 },
      to: async (animate) => {
        await animate({
          rotateY: nextRotationY,
          rotateX: wobbleX,
          rotateZ: wobbleZ,
          scale: 1.2,
          config: { mass: 1.0, tension: 200, friction: 14 },
        });
        await animate({
          rotateY: nextRotationY,
          rotateX: 0,
          rotateZ: 0,
          scale: 1.05,
          config: { mass: 1.2, tension: 160, friction: 18 },
        });
      },
    });

    rollTimerRef.current = setTimeout(() => {
      rollTimerRef.current = null;
      if (cycleIntervalRef.current !== null) {
        clearInterval(cycleIntervalRef.current);
        cycleIntervalRef.current = null;
      }

      // Ensure the final pose is perfectly face-on even if the timer fires
      // before the spring fully settles.
      dieApi.start({
        rotateY: cumulativeRotation.current.rotateY,
        rotateX: 0,
        rotateZ: 0,
        scale: 1,
        config: { mass: 1.3, tension: 120, friction: 20 },
      });

      setDisplayValue(String(roll));
      setRollOutcome(roll);
      setIsCritical(critical);
      setIsFumble(fumble);
      setRollStatus(isWin ? 'win' : 'loss');
      setRolling(false);

      const newHistoryItem: D20RollResult = {
        id: Math.random().toString(36).substring(2, 9),
        roll,
        target,
        isWin,
        isCritical: critical,
        isFumble: fumble,
        timestamp: new Date(),
      };
      setHistory((prev) => [newHistoryItem, ...prev].slice(0, 15));
      setStats((prev) => {
        const currentStreak = isWin ? prev.currentStreak + 1 : 0;
        return {
          totalPlays: prev.totalPlays + 1,
          wins: isWin ? prev.wins + 1 : prev.wins,
          losses: isWin ? prev.losses : prev.losses + 1,
          currentStreak,
          maxStreak: Math.max(prev.maxStreak, currentStreak),
        };
      });

      onRollComplete?.(roll, isWin);

    }, animationDuration);
  }, [
    animationDuration,
    clearRollTimer,
    dieApi,
    disabled,
    onRollComplete,
    onRollStart,
    setRolling,
    target,
  ]);

  useImperativeHandle(ref, () => ({ roll: triggerRoll }), [triggerRoll]);

  useEffect(() => {
    if (rollRequest === undefined) return;
    if (prevRollRequestRef.current === rollRequest) return;
    prevRollRequestRef.current = rollRequest;
    triggerRoll();
  }, [rollRequest, triggerRoll]);

  return (
    <div
      className={`w-full max-w-2xl glass-panel rounded-3xl p-8 relative flex flex-col items-center select-none transition-all duration-300
        ${rollStatus === 'win' ? 'animate-pulse-glow-green border-emerald-500/40 shadow-emerald-950/20' : ''}
        ${rollStatus === 'loss' ? 'animate-pulse-glow-red border-rose-500/40 shadow-rose-950/20' : ''}
        ${className}
      `}
    >
      <D20RollHeader stats={stats} />

      <div className="w-full relative px-6 py-10 bg-zinc-950/40 border border-zinc-900/80 rounded-2xl mb-8 flex flex-col items-center justify-center min-h-[280px]">
        <div
          className={`absolute w-48 h-48 rounded-full blur-[40px] opacity-25 transition-all duration-500 pointer-events-none -z-10
            ${isRolling ? 'bg-violet-500 animate-pulse' : ''}
            ${!isRolling && rollOutcome !== null && rollStatus === 'win' ? 'bg-emerald-500' : ''}
            ${!isRolling && rollOutcome !== null && rollStatus === 'loss' ? 'bg-rose-500' : ''}
          `}
        />

        <D20Visual
          diceSrc={diceSrc}
          style={{
            transform: to(
              [dieStyles.rotateY, dieStyles.rotateX, dieStyles.rotateZ],
              (ry, rx, rz) =>
                `rotateY(${ry}deg) rotateX(${rx}deg) rotateZ(${rz}deg)`,
            ),
            scale: dieStyles.scale,
          }}
          isRolling={isRolling}
          displayValue={displayValue}
          isCritical={isCritical}
          isFumble={isFumble}
        />

        <div className="mt-3 h-9 flex items-center justify-center shrink-0" aria-live="polite">
          <div
            className={`px-4 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-wider shadow-md transition-opacity duration-150
              ${!isRolling && rollStatus !== 'idle' ? 'opacity-100 animate-bounce' : 'opacity-0 pointer-events-none'}
              ${
                rollStatus === 'win'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                  : rollStatus === 'loss'
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                    : 'border-transparent bg-transparent text-transparent'
              }
            `}
            aria-hidden={isRolling || rollStatus === 'idle'}
          >
            {rollStatus === 'win' ? 'Hit!' : 'Miss'}
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-6">
        <DcControl
          rawTarget={rawTarget}
          rawWinChance={rawWinChance}
          isRolling={isRolling}
          disabled={disabled}
          onTargetChange={handleTargetChange}
          onTargetBlur={handleTargetBlur}
        />

        <button
          type="button"
          disabled={isRolling || disabled}
          onClick={triggerRoll}
          className={`w-full py-4.5 rounded-2xl font-black text-base tracking-widest uppercase transition-all duration-300 shadow-lg text-white select-none
            ${
              isRolling || disabled
                ? 'bg-zinc-800 border border-zinc-700 text-zinc-500 cursor-not-allowed shadow-none'
                : 'bg-violet-600 border border-violet-500 hover:bg-violet-500 shadow-violet-950/20 active:translate-y-0.5 cursor-pointer'
            }
          `}
        >
          {isRolling ? 'ROLLING...' : 'ROLL D20'}
        </button>

        <D20RollHistory history={history} />
      </div>

      <D20RollRules />
    </div>
  );
});
