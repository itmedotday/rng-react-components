import React from 'react';
import type { Card } from '../types';
import { PlayingCard } from './PlayingCard';

export interface CardHandProps {
  /** Cards to display. Pass an empty array for the "idle" (no cards) state. */
  cards: Card[];
  /** Calculated hand total. Displayed as a badge when provided. */
  total: number | null;
  /** Label shown above the hand (e.g. "Player", "Dealer"). */
  label: string;
  /** Aria id for the total element. */
  labelId: string;
  /** When true, all cards except the first are shown face-down. */
  hideAll?: boolean;
  /** Bust / win highlight for the total badge. */
  highlight?: 'win' | 'loss' | 'bust' | null;
  /** Card visual size. */
  size?: 'sm' | 'md' | 'lg';
}

export const CardHand: React.FC<CardHandProps> = ({
  cards,
  total,
  label,
  labelId,
  hideAll = false,
  highlight = null,
  size = 'md',
}) => {
  const isBust = total !== null && total > 21;

  const badgeCls =
    highlight === 'win'
      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
      : highlight === 'loss' || highlight === 'bust'
      ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
      : 'bg-zinc-800/60 border-zinc-700/50 text-zinc-300';

  return (
    <div className="flex flex-col items-center gap-2 min-w-0">
      {/* Label */}
      <div className="text-[11px] text-zinc-500 font-black uppercase tracking-wider" id={labelId}>
        {label}
      </div>

      {/* Card spread */}
      <div className="relative flex justify-center min-h-[80px]">
        {cards.length === 0 ? (
          /* Placeholder when no cards dealt yet */
          <div className="flex gap-1.5">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="w-14 h-20 rounded-lg border border-dashed border-zinc-700/40 bg-zinc-900/30"
              />
            ))}
          </div>
        ) : (
          <div className="flex gap-1.5 flex-wrap justify-center">
            {cards.map((card, i) => (
              <PlayingCard
                key={i}
                rank={card.rank}
                suit={card.suit}
                faceDown={hideAll}
                size={size}
                highlight={highlight === 'win' ? 'win' : isBust ? 'bust' : null}
              />
            ))}
          </div>
        )}
      </div>

      {/* Total badge */}
      <div
        className={`px-3 py-1 rounded-full border text-sm font-black font-mono tracking-tight
          ${total !== null ? badgeCls : 'bg-zinc-900/40 border-zinc-800/50 text-zinc-600'}
        `}
        role="status"
        aria-live="polite"
        aria-labelledby={labelId}
      >
        {total !== null ? (
          <>
            {total}
            {isBust && (
              <span className="ml-1 text-[10px] uppercase tracking-widest text-rose-300">Bust</span>
            )}
          </>
        ) : (
          '—'
        )}
      </div>
    </div>
  );
};
