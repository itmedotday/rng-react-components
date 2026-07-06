import {
  forwardRef,
  useCallback,
  useRef,
  useState,
} from 'react';
import { to, useSpring } from '@react-spring/web';
import { resolveRng } from '../../lib/rng';
import { useGameTrigger } from '../../lib/useGameTrigger';
import type { D20RollHandle, D20RollProps } from './types';
import { D20Die3D } from './components/D20Die3D';

export const D20Roll = forwardRef<D20RollHandle, D20RollProps>(function D20Roll(
  {
    onRollStart,
    onRollComplete,
    onIsRollingChange,
    rollRequest,
    disabled = false,
    className = '',
    animationDuration = 950,
    diceSrc,
    rng: rngProp,
  },
  ref,
) {
  const rng = resolveRng(rngProp);
  const [displayValue, setDisplayValue] = useState('—');
  const [isCritical, setIsCritical] = useState(false);
  const [isFumble, setIsFumble] = useState(false);

  const rollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cumulativeRotation = useRef({ rotateY: 0 });
  const executeRef = useRef<() => void>(() => {});

  const [dieStyles, dieApi] = useSpring(() => ({
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    scale: 1,
    config: { mass: 1.4, tension: 140, friction: 16 },
  }));

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

  const { isBusy: isRolling, setBusy, guardExecute } = useGameTrigger(ref, {
    disabled,
    request: rollRequest,
    onBusyChange: onIsRollingChange,
    execute: () => executeRef.current(),
    handle: { roll: () => executeRef.current() },
    clearTimers: clearRollTimer,
  });

  const roll = useCallback(() => {
    if (!guardExecute()) return;

    clearRollTimer();
    setBusy(true);
    setIsCritical(false);
    setIsFumble(false);
    onRollStart?.();

    const rollValue = Math.floor(rng() * 20) + 1;
    const critical = rollValue === 20;
    const fumble = rollValue === 1;

    cycleIntervalRef.current = setInterval(() => {
      setDisplayValue(String(Math.floor(Math.random() * 20) + 1));
    }, 50);

    const wobbleX = 25 + Math.random() * 10;
    const wobbleZ = (Math.random() - 0.5) * 50;
    const fullSpinY = (3 + Math.floor(Math.random() * 4)) * 360;
    const currentAngle = cumulativeRotation.current.rotateY % 360;
    let angleDiff = 0 - currentAngle;
    if (angleDiff <= 0) {
      angleDiff += 360;
    }
    const nextRotationY = cumulativeRotation.current.rotateY + fullSpinY + angleDiff;
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

      dieApi.start({
        rotateY: cumulativeRotation.current.rotateY,
        rotateX: 0,
        rotateZ: 0,
        scale: 1,
        config: { mass: 1.3, tension: 120, friction: 20 },
      });

      setDisplayValue(String(rollValue));
      setIsCritical(critical);
      setIsFumble(fumble);
      setBusy(false);
      onRollComplete?.({ roll: rollValue, isCritical: critical, isFumble: fumble });
    }, animationDuration);
  }, [
    animationDuration,
    clearRollTimer,
    dieApi,
    guardExecute,
    onRollComplete,
    onRollStart,
    rng,
    setBusy,
  ]);

  executeRef.current = roll;

  return (
    <button
      type="button"
      onClick={roll}
      disabled={isRolling || disabled}
      className={`bg-transparent border-none p-0 cursor-pointer disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 rounded-lg ${className}`}
      aria-label="Roll d20"
    >
      <D20Die3D
        diceSrc={diceSrc}
        style={{
          transform: to(
            [dieStyles.rotateY, dieStyles.rotateX, dieStyles.rotateZ],
            (ry, rx, rz) => `rotateY(${ry}deg) rotateX(${rx}deg) rotateZ(${rz}deg)`,
          ),
          scale: dieStyles.scale,
        }}
        isRolling={isRolling}
        displayValue={displayValue}
        isCritical={isCritical}
        isFumble={isFumble}
      />
    </button>
  );
});
