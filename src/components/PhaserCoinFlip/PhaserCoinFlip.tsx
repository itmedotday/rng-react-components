import {
  forwardRef,
  useEffect,
  useRef,
  useState,
} from 'react';
import { resolveRng } from '../../lib/rng';
import { prefersReducedMotion } from '../../lib/reducedMotion';
import { useGameTrigger } from '../../lib/useGameTrigger';
import type { CoinSide } from '../CoinFlip/types';
import {
  SCENE_SIZE,
  createCoinFlipScene,
  type CoinFlipScene,
  type PhaserNamespace,
} from './phaserCoinScene';
import type {
  PhaserCoinFlipHandle,
  PhaserCoinFlipProps,
  PhaserCoinFlipResult,
} from './types';

/**
 * Canvas coin flip rendered with the Phaser game engine. Phaser is loaded
 * lazily on mount, so the component is SSR-safe and consumers that never
 * render it don't pay for the engine.
 */
export const PhaserCoinFlip = forwardRef<PhaserCoinFlipHandle, PhaserCoinFlipProps>(
  function PhaserCoinFlip(
    {
      onFlipStart,
      onFlipComplete,
      onIsFlippingChange,
      flipRequest,
      animationDuration = 950,
      size = 320,
      disabled = false,
      showFlipButton = true,
      className = '',
      rng: rngProp,
    },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const gameRef = useRef<Phaser.Game | null>(null);
    const sceneRef = useRef<CoinFlipScene | null>(null);
    const pendingFlipRef = useRef(false);
    const executeRef = useRef<() => void>(() => {});
    const runFlipRef = useRef<() => void>(() => {});

    const [ready, setReady] = useState(false);
    const [result, setResult] = useState<PhaserCoinFlipResult | null>(null);

    const { isBusy: isFlipping, setBusy, guardExecute } = useGameTrigger(ref, {
      disabled,
      request: flipRequest,
      onBusyChange: onIsFlippingChange,
      execute: () => executeRef.current(),
      handle: { flip: () => executeRef.current() },
    });

    runFlipRef.current = () => {
      const scene = sceneRef.current;
      if (!scene) return;
      const landed: CoinSide = resolveRng(rngProp)() < 0.5 ? 'orange' : 'blue';
      const duration = prefersReducedMotion()
        ? Math.min(250, animationDuration)
        : animationDuration;
      scene.flipToSide(landed, duration, () => {
        setResult({ landed });
        setBusy(false);
        onFlipComplete?.(landed);
      });
    };

    executeRef.current = () => {
      if (!guardExecute()) return;
      setResult(null);
      setBusy(true);
      onFlipStart?.();
      if (sceneRef.current) {
        runFlipRef.current();
      } else {
        // Phaser is still loading; the flip starts as soon as the scene is ready.
        pendingFlipRef.current = true;
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

        const scene = createCoinFlipScene(P, () => {
          if (cancelled) return;
          sceneRef.current = scene;
          setReady(true);
          if (pendingFlipRef.current) {
            pendingFlipRef.current = false;
            runFlipRef.current();
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
        pendingFlipRef.current = false;
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
            aria-label="Coin"
            className="aspect-square w-full [&>canvas]:w-full [&>canvas]:h-full"
          />
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full border border-zinc-700/60 bg-zinc-900/60 text-xs font-bold uppercase tracking-widest text-zinc-400">
              Loading coin…
            </div>
          )}
        </div>

        <div aria-live="polite" className="min-h-8 flex items-center">
          {result && !isFlipping && (
            <span
              data-testid="phaser-coinflip-result"
              className={`px-3 py-1 rounded-md border text-xs font-black uppercase tracking-wider
                ${
                  result.landed === 'orange'
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                    : 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                }
              `}
            >
              {result.landed}
            </span>
          )}
        </div>

        {showFlipButton && (
          <button
            type="button"
            onClick={() => executeRef.current()}
            disabled={disabled || isFlipping || !ready}
            className="px-8 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold uppercase tracking-wide transition-colors"
          >
            {isFlipping ? 'Flipping…' : 'Flip'}
          </button>
        )}
      </div>
    );
  },
);
