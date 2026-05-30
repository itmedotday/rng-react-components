import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useSpring } from '@react-spring/web';
import type { ClickToFlipCoinHandle, ClickToFlipCoinProps, CoinSide } from '../types';
import { Coin3D } from './Coin3D';

export const ClickToFlipCoin = forwardRef<ClickToFlipCoinHandle, ClickToFlipCoinProps>(
  function ClickToFlipCoin(
    {
      onFlipStart,
      onFlipComplete,
      onIsFlippingChange,
      flipRequest,
      disabled = false,
      className = '',
      animationDuration = 950,
    },
    ref,
  ) {
    const [isFlipping, setIsFlipping] = useState(false);
    const cumulativeRotation = useRef(0);
    const isFlippingRef = useRef(false);
    const flipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const prevFlipRequestRef = useRef(flipRequest);

    const [coinStyles, coinApi] = useSpring(() => ({
      rotateY: 0,
      rotateX: 0,
      scale: 1,
      config: { mass: 1.6, tension: 120, friction: 18 },
    }));

    const setFlipping = useCallback(
      (value: boolean) => {
        isFlippingRef.current = value;
        setIsFlipping(value);
        onIsFlippingChange?.(value);
      },
      [onIsFlippingChange],
    );

    const clearFlipTimer = useCallback(() => {
      if (flipTimerRef.current !== null) {
        clearTimeout(flipTimerRef.current);
        flipTimerRef.current = null;
      }
    }, []);

    useEffect(() => clearFlipTimer, [clearFlipTimer]);

    const flip = useCallback(() => {
      if (isFlippingRef.current || disabled) return;

      clearFlipTimer();
      setFlipping(true);
      onFlipStart?.();

      const landed: CoinSide = Math.random() < 0.5 ? 'orange' : 'blue';
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
        setFlipping(false);
        onFlipComplete?.(landed);
      }, animationDuration);
    }, [
      animationDuration,
      clearFlipTimer,
      coinApi,
      disabled,
      onFlipComplete,
      onFlipStart,
      setFlipping,
    ]);

    useImperativeHandle(ref, () => ({ flip }), [flip]);

    useEffect(() => {
      if (flipRequest === undefined) return;
      if (prevFlipRequestRef.current === flipRequest) return;
      prevFlipRequestRef.current = flipRequest;
      flip();
    }, [flipRequest, flip]);

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
  },
);
