import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { resolveRng } from '../../lib/rng';
import { prefersReducedMotion } from '../../lib/reducedMotion';
import { useGameTrigger } from '../../lib/useGameTrigger';
import { formatHandTotals, handValue } from '../TwentyOne/blackjack';
import { ActionPad } from '../TwentyOne/components/ActionPad';
import { BetBar } from '../TwentyOne/components/BetBar';
import { useTwentyOneRound } from '../TwentyOne/useTwentyOneRound';
import {
  SCENE_HEIGHT,
  SCENE_WIDTH,
  createTwentyOneTableScene,
  type PhaserNamespace,
  type TableState,
  type TwentyOneTableScene,
} from './phaserTableScene';
import type { PhaserTwentyOneHandle, PhaserTwentyOneProps } from './types';

const noopRecordOutcome = () => {};

/**
 * Blackjack table whose felt and card animations are rendered on a canvas by
 * the Phaser game engine, driven by the same round engine as `TwentyOne`.
 * Phaser is loaded lazily on mount, so the component is SSR-safe; the action
 * pad, bet bar, and totals stay in the DOM for accessibility.
 */
export const PhaserTwentyOne = forwardRef<PhaserTwentyOneHandle, PhaserTwentyOneProps>(
  function PhaserTwentyOne(
    {
      onDealStart,
      onDealComplete,
      onIsDealingChange,
      dealRequest,
      disabled = false,
      className = '',
      rng: rngProp,
      initialBalance = 1000,
      initialBet = 10,
      currencyLabel = 'GG',
      onBalanceChange,
      width = 512,
    },
    ref,
  ) {
    const rng = resolveRng(rngProp);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const gameRef = useRef<Phaser.Game | null>(null);
    const sceneRef = useRef<TwentyOneTableScene | null>(null);
    const executeRef = useRef<() => void>(() => {});

    const [ready, setReady] = useState(false);

    const { setBusy, guardExecute } = useGameTrigger(ref, {
      disabled,
      request: dealRequest,
      onBusyChange: onIsDealingChange,
      execute: () => executeRef.current(),
      handle: { deal: () => executeRef.current() },
    });

    const round = useTwentyOneRound({
      rng,
      disabled,
      initialBalance,
      initialBet,
      trackSession: false,
      recordOutcome: noopRecordOutcome,
      onDealStart,
      onDealComplete,
      onBalanceChange,
      setBusy,
      guardExecute,
    });

    executeRef.current = round.startDeal;

    const tableState = useMemo<TableState>(
      () => ({
        dealer: round.dealerCards.map((card, i) => ({
          rank: card.rank,
          suit: card.suit,
          faceUp: !(i === 1 && round.holeHidden),
        })),
        hands: round.hands.map((hand) =>
          hand.cards.map((card) => ({
            rank: card.rank,
            suit: card.suit,
            faceUp: true,
          })),
        ),
        activeHand: round.activeHand,
      }),
      [round.dealerCards, round.holeHidden, round.hands, round.activeHand],
    );

    const tableStateRef = useRef(tableState);
    tableStateRef.current = tableState;

    useEffect(() => {
      let cancelled = false;

      (async () => {
        const mod = await import('phaser');
        const P =
          ((mod as unknown as { default?: PhaserNamespace }).default ??
            mod) as PhaserNamespace;
        if (cancelled || !containerRef.current) return;

        const scene = createTwentyOneTableScene(P, () => {
          if (cancelled) return;
          sceneRef.current = scene;
          // Catch up on any state that changed while Phaser was loading.
          scene.syncTable(tableStateRef.current, { instant: true });
          setReady(true);
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
        sceneRef.current = null;
        setReady(false);
        gameRef.current?.destroy(true);
        gameRef.current = null;
      };
    }, []);

    useEffect(() => {
      if (!ready) return;
      sceneRef.current?.syncTable(tableState, {
        instant: prefersReducedMotion(),
      });
    }, [tableState, ready]);

    const settledOutcome = round.lastResult?.outcome ?? null;
    const isIdleFelt = round.phase === 'betting' && round.dealerCards.length === 0;
    const dealerValue =
      round.dealerCards.length > 0
        ? handValue(round.holeHidden ? round.dealerCards.slice(0, 1) : round.dealerCards)
        : null;
    const playerValue = round.playerCards.length > 0 ? handValue(round.playerCards) : null;

    return (
      <div
        className={`w-full rounded-3xl border border-zinc-800/80 bg-[#1a2332] p-5 relative flex flex-col select-none shadow-[0_20px_60px_rgba(0,0,0,0.45)] ${className}`}
        style={{ maxWidth: width }}
      >
        <div className="relative w-full mb-3">
          <div
            ref={containerRef}
            role="img"
            aria-label="Blackjack table"
            className="aspect-[24/17] w-full [&>canvas]:w-full [&>canvas]:h-full"
          />
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center rounded-3xl border border-zinc-700/60 bg-zinc-900/60 text-xs font-bold uppercase tracking-widest text-zinc-400">
              Loading table…
            </div>
          )}

          <div className="absolute top-2 left-3 flex flex-col items-start gap-1">
            {dealerValue && (
              <span
                data-testid="phaser-twentyone-dealer-total"
                aria-label="Dealer total"
                className="px-2 py-0.5 rounded-md bg-zinc-950/70 border border-zinc-700/60 text-[11px] font-black text-zinc-200 tabular-nums"
              >
                Dealer {formatHandTotals(dealerValue)}
                {round.holeHidden ? ' + ?' : ''}
              </span>
            )}
          </div>
          <div className="absolute bottom-2 left-3 flex items-center gap-2">
            {playerValue && (
              <span
                data-testid="phaser-twentyone-player-total"
                aria-label="Player total"
                className="px-2 py-0.5 rounded-md bg-zinc-950/70 border border-emerald-700/50 text-[11px] font-black text-emerald-200 tabular-nums"
              >
                You {formatHandTotals(playerValue)}
              </span>
            )}
            {round.hands.length > 1 && (
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                Hand {round.activeHand + 1} of {round.hands.length}
              </span>
            )}
          </div>
        </div>

        <div
          aria-live="polite"
          data-testid="phaser-twentyone-status"
          className="min-h-7 mb-3 flex items-center justify-center"
        >
          {isIdleFelt && (
            <span className="text-xs text-zinc-500 tracking-wide">Place a bet to deal</span>
          )}
          {round.phase === 'dealing' && (
            <span className="text-xs font-bold text-zinc-400 tracking-wide">Dealing…</span>
          )}
          {round.phase === 'dealer' && !round.statusMessage && (
            <span className="text-xs font-bold text-zinc-400 tracking-wide">Dealer plays…</span>
          )}
          {round.phase === 'insurance' && (
            <span className="text-xs font-bold text-amber-300/90 tracking-wide">
              Dealer shows Ace — insurance?
            </span>
          )}
          {round.statusMessage && round.phase === 'settled' && (
            <span
              className={`px-4 py-1 rounded-full border text-xs font-black uppercase tracking-wider
                ${
                  settledOutcome === 'win'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                    : settledOutcome === 'push'
                      ? 'bg-zinc-500/20 border-zinc-500/50 text-zinc-300'
                      : 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                }
              `}
            >
              {round.statusMessage}
            </span>
          )}
        </div>

        <div className="w-full rounded-2xl bg-zinc-900/70 border border-zinc-800/80 p-3 flex flex-col gap-3">
          <ActionPad
            phase={
              round.phase === 'settled' || round.phase === 'dealing'
                ? 'betting'
                : round.phase
            }
            canHit={
              round.phase === 'player' &&
              !!round.currentHand &&
              !handValue(round.playerCards).isBust
            }
            canStand={round.phase === 'player'}
            canDouble={round.canDouble}
            canSplit={round.canSplit}
            disabled={disabled || round.phase === 'dealer' || round.phase === 'dealing'}
            onHit={round.onHit}
            onStand={round.onStand}
            onDouble={round.onDouble}
            onSplit={round.onSplit}
            onInsuranceAccept={() => round.resolveInsurance(true)}
            onInsuranceDecline={() => round.resolveInsurance(false)}
          />

          <BetBar
            bet={round.bet}
            balance={round.balance}
            currencyLabel={currencyLabel}
            disabled={disabled || !ready || !round.bettingEnabled}
            rawBet={round.rawBet}
            onRawBetChange={round.setRawBet}
            onBetCommit={round.commitBetInput}
            onHalf={() => round.setBetAmount(round.bet / 2)}
            onDouble={() => round.setBetAmount(round.bet * 2)}
            onPlaceBet={round.startDeal}
            placeLabel={round.phase === 'dealing' ? 'Dealing…' : 'Bet'}
          />
        </div>
      </div>
    );
  },
);
