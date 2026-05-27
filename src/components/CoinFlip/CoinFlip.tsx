import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useSpring } from '@react-spring/web';
import type { CoinFlipHandle, CoinFlipProps, CoinSide, CoinFlipResult } from './types';
import { Coin3D } from './components/Coin3D';
import { CoinHistory } from './components/CoinHistory';
import { CoinFlipHeader } from './components/CoinFlipHeader';
import { PredictionSelector } from './components/PredictionSelector';
import { CoinFlipRules } from './components/CoinFlipRules';

export const CoinFlip = forwardRef<CoinFlipHandle, CoinFlipProps>(function CoinFlip(
  {
    onFlipStart,
    onFlipComplete,
    onIsFlippingChange,
    flipRequest,
    initialPrediction = 'orange',
    disabled = false,
    className = '',
    animationDuration = 950,
  },
  ref,
) {
  const [prediction, setPrediction] = useState<CoinSide>(initialPrediction);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [flipOutcome, setFlipOutcome] = useState<CoinSide | null>(null);
  const [flipStatus, setFlipStatus] = useState<'idle' | 'win' | 'loss'>('idle');
  const [history, setHistory] = useState<CoinFlipResult[]>([]);
  const [stats, setStats] = useState({
    totalPlays: 0,
    wins: 0,
    losses: 0,
    currentStreak: 0,
    maxStreak: 0,
  });

  const cumulativeRotation = useRef<number>(0);
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

  const triggerFlip = useCallback(() => {
    if (isFlippingRef.current || disabled) return;

    clearFlipTimer();
    setFlipping(true);
    setFlipStatus('idle');
    setFlipOutcome(null);

    onFlipStart?.();

    const landed: CoinSide = Math.random() < 0.5 ? 'orange' : 'blue';
    const isWin = landed === prediction;

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
      setFlipOutcome(landed);
      const outcomeStatus = isWin ? 'win' : 'loss';
      setFlipStatus(outcomeStatus);
      setFlipping(false);

      const newHistoryItem: CoinFlipResult = {
        id: Math.random().toString(36).substring(2, 9),
        landed,
        prediction,
        isWin,
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

      onFlipComplete?.(landed, isWin);
    }, animationDuration);
  }, [
    animationDuration,
    clearFlipTimer,
    coinApi,
    disabled,
    onFlipComplete,
    onFlipStart,
    prediction,
    setFlipping,
  ]);

  useImperativeHandle(ref, () => ({ flip: triggerFlip }), [triggerFlip]);

  useEffect(() => {
    if (flipRequest === undefined) return;
    if (prevFlipRequestRef.current === flipRequest) return;
    prevFlipRequestRef.current = flipRequest;
    triggerFlip();
  }, [flipRequest, triggerFlip]);

  return (
    <div
      className={`w-full max-w-2xl glass-panel rounded-3xl p-8 relative flex flex-col items-center select-none transition-all duration-300
        ${flipStatus === 'win' ? 'animate-pulse-glow-green border-emerald-500/40 shadow-emerald-950/20' : ''}
        ${flipStatus === 'loss' ? 'animate-pulse-glow-red border-rose-500/40 shadow-rose-950/20' : ''}
        ${className}
      `}
    >
      <CoinFlipHeader stats={stats} />

      <div className="w-full relative px-6 py-10 bg-zinc-950/40 border border-zinc-900/80 rounded-2xl mb-8 flex flex-col items-center justify-center min-h-[220px]">
        <div
          className={`absolute w-44 h-44 rounded-full blur-[40px] opacity-25 transition-all duration-500 pointer-events-none -z-10
            ${isFlipping ? 'bg-indigo-500 animate-pulse' : ''}
            ${!isFlipping && flipOutcome === 'orange' ? 'bg-amber-500' : ''}
            ${!isFlipping && flipOutcome === 'blue' ? 'bg-blue-500' : ''}
          `}
        />

        <Coin3D
          style={{
            transform: coinStyles.rotateY.to(
              (ry) => `rotateY(${ry}deg) rotateX(${coinStyles.rotateX.get()}deg)`,
            ),
            scale: coinStyles.scale,
          }}
          isRolling={isFlipping}
        />

        <div className="mt-3 h-9 flex items-center justify-center shrink-0" aria-live="polite">
          <div
            className={`px-4 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-wider shadow-md transition-opacity duration-150
              ${!isFlipping && flipStatus !== 'idle' ? 'opacity-100 animate-bounce' : 'opacity-0 pointer-events-none'}
              ${
                flipStatus === 'win'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                  : flipStatus === 'loss'
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                    : 'border-transparent bg-transparent text-transparent'
              }
            `}
            aria-hidden={isFlipping || flipStatus === 'idle'}
          >
            {flipStatus === 'win' ? 'Hit!' : 'Miss'}
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-6">
        <PredictionSelector
          prediction={prediction}
          onSelect={setPrediction}
          disabled={isFlipping || disabled}
        />

        <button
          type="button"
          disabled={isFlipping || disabled}
          onClick={triggerFlip}
          className={`w-full py-4.5 rounded-2xl font-black text-base tracking-widest uppercase transition-all duration-300 shadow-lg text-white select-none
            ${
              isFlipping
                ? 'bg-zinc-800 border border-zinc-700 text-zinc-500 cursor-not-allowed shadow-none'
                : prediction === 'orange'
                  ? 'bg-amber-600 border border-amber-500 hover:bg-amber-500 shadow-amber-950/20 active:translate-y-0.5 cursor-pointer'
                  : 'bg-blue-600 border border-blue-500 hover:bg-blue-500 shadow-blue-950/20 active:translate-y-0.5 cursor-pointer'
            }
          `}
        >
          {isFlipping ? 'FLIPPING...' : 'FLIP COIN'}
        </button>

        <CoinHistory history={history} />
      </div>

      <CoinFlipRules />
    </div>
  );
});
