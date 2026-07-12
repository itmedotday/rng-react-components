import React from 'react';
import type { Card } from '../types';
import { formatHandTotals, handValue } from '../blackjack';
import { PlayingCard } from './PlayingCard';

export interface CardHandProps {
  cards: Card[];
  label?: string;
  labelId?: string;
  /** Indices of face-down cards (e.g. dealer hole). */
  hiddenIndices?: number[];
  /** Hide total badge (e.g. while hole card hidden and no upcard total desired). */
  showTotal?: boolean;
  /** Override displayed total string. */
  totalOverride?: string | null;
  playerActive?: boolean;
  highlight?: 'win' | 'loss' | 'bust' | null;
  size?: 'sm' | 'md' | 'lg';
  /** Score pill tone: dealer = dark, player = red when active. */
  pillTone?: 'dealer' | 'player' | 'neutral';
}

export const CardHand: React.FC<CardHandProps> = ({
  cards,
  label,
  labelId,
  hiddenIndices = [],
  showTotal = true,
  totalOverride = null,
  playerActive = false,
  highlight = null,
  size = 'lg',
  pillTone = 'neutral',
}) => {
  const visibleCards = cards.filter((_, i) => !hiddenIndices.includes(i));
  const value = handValue(visibleCards.length > 0 ? visibleCards : cards);
  const isBust = highlight === 'bust' || (showTotal && value.isBust && hiddenIndices.length === 0);
  const totalText =
    totalOverride ??
    (showTotal && cards.length > 0 && (hiddenIndices.length === 0 || visibleCards.length > 0)
      ? formatHandTotals(handValue(hiddenIndices.length ? visibleCards : cards))
      : null);

  const pillCls =
    pillTone === 'player' || highlight === 'bust'
      ? 'bg-rose-600 text-white border-rose-500'
      : highlight === 'win'
        ? 'bg-emerald-600 text-white border-emerald-500'
        : highlight === 'loss'
          ? 'bg-zinc-700 text-zinc-200 border-zinc-600'
          : 'bg-zinc-800/90 text-white border-zinc-700';

  const overlap = size === 'lg' ? -28 : size === 'md' ? -20 : -14;

  return (
    <div className="flex flex-col items-center gap-2 min-w-0">
      {label && (
        <div
          className="text-[11px] text-zinc-500 font-black uppercase tracking-wider"
          id={labelId}
        >
          {label}
        </div>
      )}

      {totalText !== null && (
        <div
          className={`px-3 py-1 rounded-full border text-sm font-black font-mono tracking-tight shadow-md ${pillCls}`}
          role="status"
          aria-live="polite"
          aria-labelledby={labelId}
        >
          {totalText}
          {isBust && (
            <span className="ml-1 text-[10px] uppercase tracking-widest opacity-90">Bust</span>
          )}
        </div>
      )}

      <div className="relative flex justify-center items-end min-h-[6.5rem] px-2">
        {cards.length === 0 ? (
          <div className="flex" style={{ gap: 8 }}>
            {[0, 1].map((i) => (
              <div
                key={i}
                className="w-[4.5rem] h-[6.25rem] rounded-lg border border-dashed border-zinc-700/50 bg-zinc-900/20"
              />
            ))}
          </div>
        ) : (
          <div className="flex items-end">
            {cards.map((c, i) => (
              <div
                key={`${c.rank}${c.suit}-${i}`}
                style={{ marginLeft: i === 0 ? 0 : overlap, zIndex: i }}
              >
                <PlayingCard
                  rank={c.rank}
                  suit={c.suit}
                  faceDown={hiddenIndices.includes(i)}
                  size={size}
                  playerActive={playerActive && !hiddenIndices.includes(i)}
                  highlight={
                    highlight === 'win' ? 'win' : isBust && !hiddenIndices.includes(i) ? 'bust' : null
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
