import {
  forwardRef,
  useCallback,
  useRef,
} from 'react';
import { useSpring } from '@react-spring/web';
import { resolveRng } from '../../lib/rng';
import { useGameTrigger } from '../../lib/useGameTrigger';
import type { CoinFlipHandle, CoinFlipProps, CoinSide } from './types';
import { Coin3D } from './components/Coin3D';

export const CoinFlip = forwardRef<CoinFlipHandle, CoinFlipProps>(function CoinFlip(
  {
    onFlipStart,
    onFlipComplete,
    onIsFlippingChange,
    flipRequest,
    disabled = false,
    className = '',
    animationDuration = 950,
    rng: rngProp,
  },
  ref,
) {
  const rng = resolveRng(rngProp);
  const cumulativeRotation = useRef(0);
  const flipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const executeRef = useRef<() => void>(() => {});

  const [coinStyles, coinApi] = useSpring(() => ({
    rotateY: 0,
    rotateX: 0,
    scale: 1,
    config: { mass: 1.6, tension: 120, friction: 18 },
  }));

  const clearFlipTimer = useCallback(() => {
    if (flipTimerRef.current !== null) {
      clearTimeout(flipTimerRef.current);
      flipTimerRef.current = null;
    }
  }, []);

  const { isBusy: isFlipping, setBusy, guardExecute } = useGameTrigger(ref, {
    disabled,
    request: flipRequest,
    onBusyChange: onIsFlippingChange,
    execute: () => executeRef.current(),
    handle: { flip: () => executeRef.current() },
    clearTimers: clearFlipTimer,
  });

  const flip = useCallback(() => {
    if (!guardExecute()) return;

    clearFlipTimer();
    setBusy(true);
    onFlipStart?.();

    const landed: CoinSide = rng() < 0.5 ? 'orange' : 'blue';
    const baseSpins = 1440;
    const targetAngle = landed === 'orange' ? 0 : 180;
    const currentAngle = cumulativeRotation.current % 360;
    let angleDiff = targetAngle - currentAngle;
    if (angleDiff <= 0) {
      angleDiff += 360;
    }

    const nextRotation = cumulativeRotation.current + baseSpins + angleDiff;
    cumulativeRotation.current = nextRotation;

    coinApi.start({
      from: {
        scale: 1.0,
        rotateX: 0,
      },
      to: async (animate) => {
        await animate({
          rotateY: nextRotation,
          rotateX: 20,
          scale: 1.25,
          config: { mass: 1.0, tension: 180, friction: 14 },
        });
        await animate({
          rotateX: 0,
          scale: 1.0,
          config: { mass: 1.2, tension: 150, friction: 16 },
        });
      },
    });

    flipTimerRef.current = setTimeout(() => {
      flipTimerRef.current = null;
      setBusy(false);
      onFlipComplete?.(landed);
    }, animationDuration);
  }, [
    animationDuration,
    clearFlipTimer,
    coinApi,
    guardExecute,
    onFlipComplete,
    onFlipStart,
    rng,
    setBusy,
  ]);

  executeRef.current = flip;

  return (
    <button
      type="button"
      onClick={flip}
      disabled={isFlipping || disabled}
      className={`bg-transparent border-none p-0 cursor-pointer disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 rounded-full ${className}`}
      aria-label="Flip coin"
    >
      <Coin3D
        style={{
          transform: coinStyles.rotateY.to(
            (ry) => `rotateY(${ry}deg) rotateX(${coinStyles.rotateX.get()}deg)`,
          ),
          scale: coinStyles.scale,
        }}
        isRolling={isFlipping}
      />
    </button>
  );
});
