import {
  forwardRef,
  useEffect,
  useRef,
  useState,
} from 'react';
import { resolveRng } from '../../lib/rng';
import { prefersReducedMotion } from '../../lib/reducedMotion';
import { useGameTrigger } from '../../lib/useGameTrigger';
import { ControlInputs } from '../DiceSlider/components/ControlInputs';
import {
  SCENE_HEIGHT,
  SCENE_WIDTH,
  createDiceSliderScene,
  type DiceSliderScene,
  type PhaserNamespace,
} from './phaserSliderScene';
import type {
  PhaserDiceSliderHandle,
  PhaserDiceSliderProps,
  PhaserDiceSliderResult,
} from './types';

/**
 * Probability slider whose track and outcome badge are rendered on a canvas
 * by the Phaser game engine. Phaser is loaded lazily on mount, so the
 * component is SSR-safe; the target/chance inputs stay in the DOM for precise
 * entry, keyboard access, and screen readers.
 */
export const PhaserDiceSlider = forwardRef<PhaserDiceSliderHandle, PhaserDiceSliderProps>(
  function PhaserDiceSlider(
    {
      onRollStart,
      onRollComplete,
      onIsRollingChange,
      rollRequest,
      initialTarget = 50,
      initialIsRollOver = true,
      minTarget = 0.01,
      maxTarget = 99.99,
      animationDuration = 400,
      width = 640,
      disabled = false,
      showControls = true,
      className = '',
      rng: rngProp,
    },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const gameRef = useRef<Phaser.Game | null>(null);
    const sceneRef = useRef<DiceSliderScene | null>(null);
    const pendingRollRef = useRef(false);
    const executeRef = useRef<() => void>(() => {});
    const runRollRef = useRef<() => void>(() => {});

    const [ready, setReady] = useState(false);
    const [result, setResult] = useState<PhaserDiceSliderResult | null>(null);

    const [rollTarget, setRollTarget] = useState(initialTarget);
    const [isRollOver, setIsRollOver] = useState(initialIsRollOver);
    const [rawTarget, setRawTarget] = useState(initialTarget.toFixed(2));
    const [rawChance, setRawChance] = useState(
      (initialIsRollOver ? 100 - initialTarget : initialTarget).toFixed(4),
    );

    const targetStateRef = useRef({ rollTarget, isRollOver });
    targetStateRef.current = { rollTarget, isRollOver };

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
      const { rollTarget: target, isRollOver: rollOver } = targetStateRef.current;
      const outcome = parseFloat((resolveRng(rngProp)() * 100).toFixed(2));
      const isWin = rollOver ? outcome >= target : outcome <= target;
      const duration = prefersReducedMotion()
        ? Math.min(120, animationDuration)
        : animationDuration;
      scene.rollToOutcome(outcome, isWin, duration, () => {
        setResult({ outcome, isWin, target, isRollOver: rollOver });
        setBusy(false);
        onRollComplete?.(outcome, isWin);
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

        const scene = createDiceSliderScene(P, () => {
          if (cancelled) return;
          sceneRef.current = scene;
          const { rollTarget: target, isRollOver: rollOver } = targetStateRef.current;
          scene.setTarget(target, rollOver);
          setReady(true);
          if (pendingRollRef.current) {
            pendingRollRef.current = false;
            runRollRef.current();
          }
        });

        gameRef.current = new P.Game({
          type: P.CANVAS,
          parent: containerRef.current,
          width: SCENE_WIDTH,
          height: SCENE_HEIGHT,
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

    useEffect(() => {
      if (!ready) return;
      sceneRef.current?.setTarget(rollTarget, isRollOver);
    }, [rollTarget, isRollOver, ready]);

    // --- Target/chance input synchronization (mirrors DiceSlider) ---

    const handleToggleMode = () => {
      if (isRolling || disabled) return;
      const nextIsRollOver = !isRollOver;
      setIsRollOver(nextIsRollOver);
      setRawChance((nextIsRollOver ? 100 - rollTarget : rollTarget).toFixed(4));
      setResult(null);
    };

    const handleTargetChange = (val: string) => {
      setRawTarget(val);
      const parsed = parseFloat(val);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
        setRollTarget(parsed);
        setRawChance((isRollOver ? 100 - parsed : parsed).toFixed(4));
      }
    };

    const handleTargetBlur = () => {
      let parsed = parseFloat(rawTarget);
      if (isNaN(parsed) || parsed < 0) parsed = 0;
      if (parsed > 100) parsed = 100;
      const clampedTarget = Math.max(
        minTarget,
        Math.min(maxTarget, parseFloat(parsed.toFixed(2))),
      );
      setRollTarget(clampedTarget);
      setRawTarget(clampedTarget.toFixed(2));
      setRawChance((isRollOver ? 100 - clampedTarget : clampedTarget).toFixed(4));
    };

    const handleChanceChange = (val: string) => {
      setRawChance(val);
      const parsed = parseFloat(val);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
        const computedTarget = isRollOver ? 100 - parsed : parsed;
        setRollTarget(parseFloat(computedTarget.toFixed(2)));
        setRawTarget(computedTarget.toFixed(2));
      }
    };

    const handleChanceBlur = () => {
      let parsed = parseFloat(rawChance);
      if (isNaN(parsed) || parsed < 0) parsed = 0;
      if (parsed > 100) parsed = 100;
      const clampedChance = parseFloat(parsed.toFixed(4));
      setRawChance(clampedChance.toFixed(4));
      const computedTarget = isRollOver ? 100 - clampedChance : clampedChance;
      const clampedTarget = Math.max(
        minTarget,
        Math.min(maxTarget, parseFloat(computedTarget.toFixed(2))),
      );
      setRollTarget(clampedTarget);
      setRawTarget(clampedTarget.toFixed(2));
    };

    return (
      <div
        className={`flex flex-col items-center gap-4 w-full ${className}`}
        style={{ maxWidth: width }}
      >
        <div className="relative w-full">
          <div
            ref={containerRef}
            role="img"
            aria-label="Probability slider track"
            className="aspect-[16/5] w-full [&>canvas]:w-full [&>canvas]:h-full"
          />
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center rounded-3xl border border-zinc-700/60 bg-zinc-900/60 text-xs font-bold uppercase tracking-widest text-zinc-400">
              Loading slider…
            </div>
          )}
        </div>

        <div aria-live="polite" className="min-h-8 flex items-center">
          {result && !isRolling && (
            <span
              data-testid="phaser-diceslider-result"
              className={`px-3 py-1 rounded-md border text-xs font-black uppercase tracking-wider
                ${
                  result.isWin
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                    : 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                }
              `}
            >
              {result.outcome.toFixed(2)} — {result.isWin ? 'Win' : 'Loss'}
            </span>
          )}
        </div>

        {showControls && (
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
            onRollTrigger={() => executeRef.current()}
            disabled={disabled || !ready}
          />
        )}
      </div>
    );
  },
);
