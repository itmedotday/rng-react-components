import {
  forwardRef,
  useCallback,
  useRef,
  useState,
} from 'react';
import { useSpring } from '@react-spring/web';
import { Coins } from 'lucide-react';
import { createOutcomeId } from '../../lib/session';
import { resolveRng } from '../../lib/rng';
import { useGameSession } from '../../lib/useGameSession';
import { useGameTrigger } from '../../lib/useGameTrigger';
import { StatsHeader } from '../../lib/components/StatsHeader';
import type {
  CoinFlipConsoleHandle,
  CoinFlipConsoleProps,
  CoinSide,
  CoinFlipResult,
} from './types';
import { Coin3D } from './components/Coin3D';
import { CoinHistory } from './components/CoinHistory';
import { PredictionSelector } from './components/PredictionSelector';
import { CoinFlipRules } from './components/CoinFlipRules';

export const CoinFlipConsole = forwardRef<CoinFlipConsoleHandle, CoinFlipConsoleProps>(
  function CoinFlipConsole(
    {
      onFlipStart,
      onFlipComplete,
      onIsFlippingChange,
      flipRequest,
      initialPrediction = 'orange',
      initialHistory = [],
      disabled = false,
      className = '',
      animationDuration = 950,
      rng: rngProp,
      showHeader = false,
      showHistory = false,
      showRules = false,
      showPrediction = true,
    },
    ref,
  ) {
    const rng = resolveRng(rngProp);
    const trackSession = showHeader || showHistory;
    const [prediction, setPrediction] = useState<CoinSide>(initialPrediction);
    const [flipOutcome, setFlipOutcome] = useState<CoinSide | null>(null);
    const [flipStatus, setFlipStatus] = useState<'idle' | 'win' | 'loss'>('idle');
    const { stats, history, recordOutcome } = useGameSession<CoinFlipResult>({
      initialHistory: trackSession ? initialHistory : [],
    });

    const cumulativeRotation = useRef<number>(0);
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

    const triggerFlip = useCallback(() => {
      if (!guardExecute()) return;

      clearFlipTimer();
      setBusy(true);
      setFlipStatus('idle');
      setFlipOutcome(null);

      onFlipStart?.();

      const landed: CoinSide = rng() < 0.5 ? 'orange' : 'blue';
      const isWin = showPrediction ? landed === prediction : false;

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
        const outcomeStatus = showPrediction ? (isWin ? 'win' : 'loss') : 'idle';
        setFlipStatus(outcomeStatus);
        setBusy(false);

        if (trackSession) {
          recordOutcome({
            id: createOutcomeId(),
            landed,
            prediction,
            isWin,
            timestamp: new Date(),
          });
        }

        onFlipComplete?.(landed, isWin);
      }, animationDuration);
    }, [
      animationDuration,
      clearFlipTimer,
      coinApi,
      guardExecute,
      onFlipComplete,
      onFlipStart,
      prediction,
      recordOutcome,
      rng,
      setBusy,
      showPrediction,
      trackSession,
    ]);

    executeRef.current = triggerFlip;

    return (
      <div
        className={`w-full max-w-2xl glass-panel rounded-3xl p-8 relative flex flex-col items-center select-none transition-all duration-300
          ${flipStatus === 'win' ? 'animate-pulse-glow-green border-emerald-500/40 shadow-emerald-950/20' : ''}
          ${flipStatus === 'loss' ? 'animate-pulse-glow-red border-rose-500/40 shadow-rose-950/20' : ''}
          ${className}
        `}
      >
        {showHeader && (
          <StatsHeader
            title="COIN FLIP CONSOLE"
            icon={<Coins className="w-5 h-5 text-indigo-400 animate-pulse" />}
            stats={stats}
          />
        )}

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

          {showPrediction && (
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
          )}
        </div>

        <div className="w-full flex flex-col gap-6">
          {showPrediction && (
            <PredictionSelector
              prediction={prediction}
              onSelect={setPrediction}
              disabled={isFlipping || disabled}
            />
          )}

          <button
            type="button"
            disabled={isFlipping || disabled}
            onClick={triggerFlip}
            className={`w-full py-4.5 rounded-2xl font-black text-base tracking-widest uppercase transition-all duration-300 shadow-lg text-white select-none
              ${
                isFlipping
                  ? 'bg-zinc-800 border border-zinc-700 text-zinc-500 cursor-not-allowed shadow-none'
                  : showPrediction && prediction === 'orange'
                    ? 'bg-amber-600 border border-amber-500 hover:bg-amber-500 shadow-amber-950/20 active:translate-y-0.5 cursor-pointer'
                    : showPrediction && prediction === 'blue'
                      ? 'bg-blue-600 border border-blue-500 hover:bg-blue-500 shadow-blue-950/20 active:translate-y-0.5 cursor-pointer'
                      : 'bg-indigo-600 border border-indigo-500 hover:bg-indigo-500 shadow-indigo-950/20 active:translate-y-0.5 cursor-pointer'
              }
            `}
          >
            {isFlipping ? 'FLIPPING...' : 'FLIP COIN'}
          </button>

          {showHistory && <CoinHistory history={history} />}
        </div>

        {showRules && <CoinFlipRules />}
      </div>
    );
  },
);
