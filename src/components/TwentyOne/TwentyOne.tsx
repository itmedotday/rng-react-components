import { forwardRef, useId, useRef } from 'react';
import { BadgeCent } from 'lucide-react';
import { resolveRng } from '../../lib/rng';
import { useGameSession } from '../../lib/useGameSession';
import { useGameTrigger } from '../../lib/useGameTrigger';
import { StatsHeader } from '../../lib/components/StatsHeader';
import { handValue } from './blackjack';
import type {
  HandOutcome,
  TwentyOneHandle,
  TwentyOneProps,
  TwentyOneResult,
} from './types';
import { ActionPad } from './components/ActionPad';
import { BetBar } from './components/BetBar';
import { CardHand } from './components/CardHand';
import { useTwentyOneRound } from './useTwentyOneRound';

function outcomeHighlight(
  outcome: HandOutcome | null,
  bust: boolean,
): 'win' | 'loss' | 'bust' | null {
  if (bust) return 'bust';
  if (outcome === 'win') return 'win';
  if (outcome === 'loss') return 'loss';
  return null;
}

export const TwentyOne = forwardRef<TwentyOneHandle, TwentyOneProps>(function TwentyOne(
  {
    onDealStart,
    onDealComplete,
    onIsDealingChange,
    dealRequest,
    initialHistory = [],
    disabled = false,
    className = '',
    rng: rngProp,
    showHeader = false,
    showHistory = false,
    showRules = false,
    initialBalance = 1000,
    initialBet = 10,
    currencyLabel = 'GG',
    onBalanceChange,
  },
  ref,
) {
  const rng = resolveRng(rngProp);
  const dealerLabelId = useId();
  const playerLabelId = useId();
  const trackSession = showHeader || showHistory;
  const executeRef = useRef<() => void>(() => {});

  const { stats, history, recordOutcome } = useGameSession<TwentyOneResult>({
    initialHistory: trackSession ? initialHistory : [],
  });

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
    trackSession,
    recordOutcome,
    onDealStart,
    onDealComplete,
    onBalanceChange,
    setBusy,
    guardExecute,
  });

  executeRef.current = round.startDeal;

  const settledOutcome = round.lastResult?.outcome ?? null;
  const isIdleFelt = round.phase === 'betting' && round.dealerCards.length === 0;
  const panelGlow =
    round.phase === 'settled' && settledOutcome === 'win'
      ? 'animate-pulse-glow-green border-emerald-500/40'
      : round.phase === 'settled' && settledOutcome === 'loss'
        ? 'animate-pulse-glow-red border-rose-500/40'
        : 'border-zinc-800/80';

  return (
    <div
      className={`w-full max-w-lg rounded-3xl border bg-[#1a2332] p-5 relative flex flex-col select-none shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition-[border-color,box-shadow] duration-500 ${panelGlow} ${className}`}
    >
      {showHeader && (
        <StatsHeader
          title="21 CONSOLE"
          icon={<BadgeCent className="w-5 h-5 text-emerald-400 animate-pulse" />}
          stats={stats}
        />
      )}

      <div className="relative w-full rounded-2xl bg-[#15202b] border border-zinc-800/60 px-4 pt-6 pb-8 mb-4 min-h-[360px] flex flex-col items-center overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            background:
              'radial-gradient(ellipse at 50% 20%, rgba(16,185,129,0.08), transparent 55%), radial-gradient(ellipse at 50% 85%, rgba(244,63,94,0.06), transparent 50%)',
          }}
          aria-hidden="true"
        />

        <div className="absolute top-3 right-3 opacity-80" aria-hidden="true">
          <div className="relative w-8 h-11 transition-transform duration-300 hover:scale-105">
            <div className="absolute inset-0 rounded-md bg-slate-700 border border-slate-500 translate-x-0.5 -translate-y-0.5" />
            <div className="absolute inset-0 rounded-md bg-slate-800 border border-slate-500 flex items-center justify-center text-[8px] font-black text-slate-300">
              21
            </div>
          </div>
        </div>

        <CardHand
          cards={round.dealerCards}
          labelId={dealerLabelId}
          hiddenIndices={
            round.dealerCards.length >= 2 && round.holeHidden ? [1] : []
          }
          showTotal={round.dealerCards.length > 0}
          pillTone="dealer"
          highlight={
            round.phase === 'settled'
              ? outcomeHighlight(
                  settledOutcome === 'loss'
                    ? 'win'
                    : settledOutcome === 'win'
                      ? 'loss'
                      : null,
                  false,
                )
              : null
          }
          size="lg"
        />

        <div className="my-5 text-center text-[10px] font-semibold tracking-[0.2em] text-zinc-500 uppercase leading-relaxed relative z-[1]">
          <div>Blackjack pays 3 to 2</div>
          <div>Insurance pays 2 to 1</div>
        </div>

        <CardHand
          cards={round.hands[round.activeHand]?.cards ?? round.hands[0]?.cards ?? []}
          labelId={playerLabelId}
          showTotal={(round.hands[0]?.cards.length ?? 0) > 0}
          playerActive={round.phase === 'player' || round.phase === 'insurance'}
          pillTone={
            round.phase === 'player' || round.phase === 'insurance' || round.playerBust
              ? 'player'
              : 'neutral'
          }
          highlight={
            round.phase === 'settled'
              ? outcomeHighlight(settledOutcome, round.playerBust)
              : round.playerBust
                ? 'bust'
                : null
          }
          size="lg"
        />

        {round.hands.length > 1 && (
          <div className="mt-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider twentyone-outcome-in">
            Hand {round.activeHand + 1} of {round.hands.length}
          </div>
        )}

        <div className="mt-4 h-7 flex items-center justify-center relative z-[1]">
          {isIdleFelt && (
            <div className="text-xs text-zinc-500 tracking-wide">
              Place a bet to deal
            </div>
          )}
          {round.phase === 'dealing' && (
            <div className="text-xs font-bold text-zinc-400 tracking-wide twentyone-outcome-in">
              Dealing…
            </div>
          )}
          {round.phase === 'dealer' && !round.statusMessage && (
            <div className="text-xs font-bold text-zinc-400 tracking-wide twentyone-outcome-in">
              Dealer plays…
            </div>
          )}
          {round.statusMessage && round.phase === 'settled' && (
            <div
              className={`twentyone-outcome-in px-4 py-1 rounded-full border text-xs font-black uppercase tracking-wider
                ${
                  round.lastResult?.outcome === 'win'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                    : round.lastResult?.outcome === 'push'
                      ? 'bg-zinc-500/20 border-zinc-500/50 text-zinc-300'
                      : 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                }
              `}
            >
              {round.statusMessage}
            </div>
          )}
          {round.phase === 'insurance' && (
            <div className="text-xs font-bold text-amber-300/90 tracking-wide twentyone-outcome-in">
              Dealer shows Ace — insurance?
            </div>
          )}
        </div>
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
          disabled={!round.bettingEnabled}
          rawBet={round.rawBet}
          onRawBetChange={round.setRawBet}
          onBetCommit={round.commitBetInput}
          onHalf={() => round.setBetAmount(round.bet / 2)}
          onDouble={() => round.setBetAmount(round.bet * 2)}
          onPlaceBet={round.startDeal}
          placeLabel={round.phase === 'dealing' ? 'Dealing…' : 'Bet'}
        />
      </div>

      {showHistory && (
        <div className="w-full mt-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/30 p-4">
          <div className="text-zinc-400 text-xs font-black uppercase tracking-wider mb-3">
            Last {history.length} hands
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-zinc-500">No hands yet.</p>
          ) : (
            <ul className="space-y-2">
              {history.slice(-8).reverse().map((entry) => (
                <li
                  key={entry.id}
                  className="text-sm text-zinc-300 font-mono flex justify-between gap-2 twentyone-outcome-in"
                >
                  <span>
                    P {entry.playerTotal} vs D {entry.dealerTotal}
                    {entry.doubled ? ' ×2' : ''}
                  </span>
                  <span
                    className={
                      entry.outcome === 'win'
                        ? 'text-emerald-400'
                        : entry.outcome === 'push'
                          ? 'text-zinc-400'
                          : 'text-rose-400'
                    }
                  >
                    {entry.outcome === 'win'
                      ? 'Win'
                      : entry.outcome === 'push'
                        ? 'Push'
                        : 'Loss'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {showRules && (
        <div className="w-full mt-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/30 p-4 text-sm text-zinc-400 leading-relaxed">
          Hit, stand, double, or take insurance when the dealer shows an Ace.
          Blackjack pays 3:2. Dealer hits soft 17. Split pairs when available.
        </div>
      )}
    </div>
  );
});
