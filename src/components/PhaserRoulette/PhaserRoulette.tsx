import {
  forwardRef,
  useEffect,
  useRef,
  useState,
} from 'react';
import { resolveRng } from '../../lib/rng';
import { useGameTrigger } from '../../lib/useGameTrigger';
import { WHEEL_SEQUENCE, resolveRouletteColor } from '../Roulette/rouletteMath';
import {
  SCENE_SIZE,
  createRouletteWheelScene,
  type PhaserNamespace,
  type RouletteWheelScene,
} from './phaserWheelScene';
import type {
  PhaserRouletteHandle,
  PhaserRouletteProps,
  PhaserRouletteResult,
} from './types';

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Canvas roulette wheel rendered with the Phaser game engine. Phaser is
 * loaded lazily on mount, so the component is SSR-safe and consumers that
 * never render it don't pay for the engine.
 */
export const PhaserRoulette = forwardRef<PhaserRouletteHandle, PhaserRouletteProps>(
  function PhaserRoulette(
    {
      onSpinStart,
      onSpinComplete,
      onIsSpinningChange,
      spinRequest,
      spinDuration = 3200,
      size = 420,
      disabled = false,
      showSpinButton = true,
      className = '',
      rng: rngProp,
    },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const gameRef = useRef<Phaser.Game | null>(null);
    const sceneRef = useRef<RouletteWheelScene | null>(null);
    const pendingSpinRef = useRef(false);
    const executeRef = useRef<() => void>(() => {});
    const runSpinRef = useRef<() => void>(() => {});

    const [ready, setReady] = useState(false);
    const [result, setResult] = useState<PhaserRouletteResult | null>(null);

    const { isBusy: isSpinning, setBusy, guardExecute } = useGameTrigger(ref, {
      disabled,
      request: spinRequest,
      onBusyChange: onIsSpinningChange,
      execute: () => executeRef.current(),
      handle: { spin: () => executeRef.current() },
    });

    runSpinRef.current = () => {
      const scene = sceneRef.current;
      if (!scene) return;
      const index = Math.floor(resolveRng(rngProp)() * WHEEL_SEQUENCE.length) % WHEEL_SEQUENCE.length;
      const number = WHEEL_SEQUENCE[index];
      const color = resolveRouletteColor(number);
      const duration = prefersReducedMotion() ? Math.min(320, spinDuration) : spinDuration;
      scene.spinToPocket(index, duration, () => {
        const spinResult: PhaserRouletteResult = { number, color };
        setResult(spinResult);
        setBusy(false);
        onSpinComplete?.(spinResult);
      });
    };

    executeRef.current = () => {
      if (!guardExecute()) return;
      setResult(null);
      setBusy(true);
      onSpinStart?.();
      if (sceneRef.current) {
        runSpinRef.current();
      } else {
        // Phaser is still loading; the spin starts as soon as the scene is ready.
        pendingSpinRef.current = true;
      }
    };

    useEffect(() => {
      let cancelled = false;

      (async () => {
        const mod = await import('phaser');
        const P =
          ((mod as unknown as { default?: PhaserNamespace }).default ??
            mod) as PhaserNamespace;
        if (cancelled || !containerRef.current) return;

        const scene = createRouletteWheelScene(P, () => {
          if (cancelled) return;
          sceneRef.current = scene;
          setReady(true);
          if (pendingSpinRef.current) {
            pendingSpinRef.current = false;
            runSpinRef.current();
          }
        });

        gameRef.current = new P.Game({
          type: P.CANVAS,
          parent: containerRef.current,
          width: SCENE_SIZE,
          height: SCENE_SIZE,
          transparent: true,
          banner: false,
          audio: { noAudio: true },
          scene,
        });
      })();

      return () => {
        cancelled = true;
        pendingSpinRef.current = false;
        sceneRef.current = null;
        setReady(false);
        gameRef.current?.destroy(true);
        gameRef.current = null;
      };
    }, []);

    return (
      <div className={`flex flex-col items-center gap-4 ${className}`}>
        <div className="relative w-full" style={{ maxWidth: size }}>
          <div
            ref={containerRef}
            role="img"
            aria-label="Roulette wheel"
            className="aspect-square w-full [&>canvas]:w-full [&>canvas]:h-full"
          />
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full border border-zinc-700/60 bg-zinc-900/60 text-xs font-bold uppercase tracking-widest text-zinc-400">
              Loading wheel…
            </div>
          )}
        </div>

        <div aria-live="polite" className="min-h-8 flex items-center">
          {result && !isSpinning && (
            <span
              data-testid="phaser-roulette-result"
              className={`px-3 py-1 rounded-md border text-xs font-black uppercase tracking-wider
                ${result.color === 'red' ? 'bg-red-500/20 border-red-500/50 text-red-400' : ''}
                ${result.color === 'black' ? 'bg-zinc-700/30 border-zinc-500/50 text-zinc-100' : ''}
                ${result.color === 'green' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : ''}
              `}
            >
              #{result.number} {result.color}
            </span>
          )}
        </div>

        {showSpinButton && (
          <button
            type="button"
            onClick={() => executeRef.current()}
            disabled={disabled || isSpinning || !ready}
            className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold uppercase tracking-wide transition-colors"
          >
            {isSpinning ? 'Spinning…' : 'Spin'}
          </button>
        )}
      </div>
    );
  },
);
