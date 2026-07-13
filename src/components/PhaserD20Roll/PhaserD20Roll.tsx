import {
  forwardRef,
  useEffect,
  useRef,
  useState,
} from 'react';
import { resolveRng } from '../../lib/rng';
import { prefersReducedMotion } from '../../lib/reducedMotion';
import { useGameTrigger } from '../../lib/useGameTrigger';
import {
  SCENE_SIZE,
  createD20Scene,
  type D20Scene,
  type PhaserNamespace,
} from './phaserD20Scene';
import type {
  PhaserD20RollHandle,
  PhaserD20RollProps,
  PhaserD20RollResult,
} from './types';

/**
 * Canvas twenty-sided die rendered with the Phaser game engine. Phaser is
 * loaded lazily on mount, so the component is SSR-safe and consumers that
 * never render it don't pay for the engine.
 */
export const PhaserD20Roll = forwardRef<PhaserD20RollHandle, PhaserD20RollProps>(
  function PhaserD20Roll(
    {
      onRollStart,
      onRollComplete,
      onIsRollingChange,
      rollRequest,
      animationDuration = 950,
      size = 320,
      disabled = false,
      showRollButton = true,
      className = '',
      rng: rngProp,
    },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const gameRef = useRef<Phaser.Game | null>(null);
    const sceneRef = useRef<D20Scene | null>(null);
    const pendingRollRef = useRef(false);
    const executeRef = useRef<() => void>(() => {});
    const runRollRef = useRef<() => void>(() => {});

    const [ready, setReady] = useState(false);
    const [result, setResult] = useState<PhaserD20RollResult | null>(null);

    const { isBusy: isRolling, setBusy, guardExecute } = useGameTrigger(ref, {
      disabled,
      request: rollRequest,
      onBusyChange: onIsRollingChange,
      execute: () => executeRef.current(),
      handle: { roll: () => executeRef.current() },
    });

    runRollRef.current = () => {
      const scene = sceneRef.current;
      if (!scene) return;
      const roll = Math.floor(resolveRng(rngProp)() * 20) + 1;
      const rollResult: PhaserD20RollResult = {
        roll,
        isCritical: roll === 20,
        isFumble: roll === 1,
      };
      const duration = prefersReducedMotion()
        ? Math.min(250, animationDuration)
        : animationDuration;
      scene.rollToValue(roll, duration, () => {
        setResult(rollResult);
        setBusy(false);
        onRollComplete?.(rollResult);
      });
    };

    executeRef.current = () => {
      if (!guardExecute()) return;
      setResult(null);
      setBusy(true);
      onRollStart?.();
      if (sceneRef.current) {
        runRollRef.current();
      } else {
        // Phaser is still loading; the roll starts as soon as the scene is ready.
        pendingRollRef.current = true;
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

        const scene = createD20Scene(P, () => {
          if (cancelled) return;
          sceneRef.current = scene;
          setReady(true);
          if (pendingRollRef.current) {
            pendingRollRef.current = false;
            runRollRef.current();
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
        pendingRollRef.current = false;
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
            aria-label="Twenty-sided die"
            className="aspect-square w-full [&>canvas]:w-full [&>canvas]:h-full"
          />
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl border border-zinc-700/60 bg-zinc-900/60 text-xs font-bold uppercase tracking-widest text-zinc-400">
              Loading die…
            </div>
          )}
        </div>

        <div aria-live="polite" className="min-h-8 flex items-center">
          {result && !isRolling && (
            <span
              data-testid="phaser-d20-result"
              className={`px-3 py-1 rounded-md border text-xs font-black uppercase tracking-wider
                ${
                  result.isCritical
                    ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                    : result.isFumble
                      ? 'bg-red-500/20 border-red-500/50 text-red-400'
                      : 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                }
              `}
            >
              {result.isCritical
                ? `Nat ${result.roll}!`
                : result.isFumble
                  ? `Fumble (${result.roll})`
                  : `Rolled ${result.roll}`}
            </span>
          )}
        </div>

        {showRollButton && (
          <button
            type="button"
            onClick={() => executeRef.current()}
            disabled={disabled || isRolling || !ready}
            className="px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold uppercase tracking-wide transition-colors"
          >
            {isRolling ? 'Rolling…' : 'Roll'}
          </button>
        )}
      </div>
    );
  },
);
