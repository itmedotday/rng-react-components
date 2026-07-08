import React from 'react';
import type { CardRank, CardSuit } from '../types';

function suitColor(suit: CardSuit): string {
  return suit === '♥' || suit === '♦' ? '#dc2626' : '#f8fafc';
}

/** Large decorative suit glyph in the card centre. */
function CenterSuit({ suit }: { suit: CardSuit }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
      style={{ color: suitColor(suit), fontSize: '2rem', lineHeight: 1 }}
      aria-hidden="true"
    >
      {suit}
    </div>
  );
}

/** Back-face design for a face-down card. */
function CardBack({ size }: { size: PlayingCardProps['size'] }) {
  const dim = size === 'lg' ? 'w-20 h-28' : size === 'md' ? 'w-14 h-20' : 'w-10 h-14';
  return (
    <div
      className={`${dim} rounded-lg border border-zinc-600/60 bg-indigo-900/80 shadow-lg flex items-center justify-center`}
      aria-label="Face-down card"
    >
      {/* Simple diagonal line pattern */}
      <svg
        width="100%"
        height="100%"
        className="rounded-lg overflow-hidden opacity-30"
        aria-hidden="true"
      >
        <defs>
          <pattern id="card-back-pattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M-1,1 l2,-2 M0,8 l8,-8 M7,9 l2,-2" stroke="#818cf8" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#card-back-pattern)" />
      </svg>
    </div>
  );
}

export interface PlayingCardProps {
  rank: CardRank;
  suit: CardSuit;
  /** When true the card shows its back face (hidden). Default: false. */
  faceDown?: boolean;
  /** Visual size of the card. Default: 'md'. */
  size?: 'sm' | 'md' | 'lg';
  /** Highlighted state (e.g. bust or winning card). */
  highlight?: 'win' | 'bust' | null;
}

export const PlayingCard: React.FC<PlayingCardProps> = ({
  rank,
  suit,
  faceDown = false,
  size = 'md',
  highlight = null,
}) => {
  if (faceDown) return <CardBack size={size} />;

  const dimMap = {
    sm: { card: 'w-10 h-14', corner: 'text-[9px]', gap: 'gap-0' },
    md: { card: 'w-14 h-20', corner: 'text-[11px]', gap: 'gap-0' },
    lg: { card: 'w-20 h-28', corner: 'text-sm', gap: 'gap-0' },
  };
  const d = dimMap[size];
  const color = suitColor(suit);

  const borderCls =
    highlight === 'win'
      ? 'border-emerald-400/70 shadow-emerald-500/20 shadow-lg'
      : highlight === 'bust'
      ? 'border-rose-400/60 shadow-rose-500/20 shadow-md'
      : 'border-zinc-600/40 shadow-zinc-900/40 shadow-sm';

  return (
    <div
      className={`relative ${d.card} rounded-lg bg-zinc-100 border ${borderCls} select-none flex-shrink-0`}
      role="img"
      aria-label={`${rank} of ${suit}`}
    >
      {/* Top-left corner */}
      <div
        className={`absolute top-1 left-1 ${d.corner} font-black leading-none flex flex-col ${d.gap} items-center`}
        style={{ color }}
      >
        <span>{rank}</span>
        <span>{suit}</span>
      </div>

      {/* Centre suit symbol */}
      <CenterSuit suit={suit} />

      {/* Bottom-right corner (rotated 180°) */}
      <div
        className={`absolute bottom-1 right-1 ${d.corner} font-black leading-none flex flex-col ${d.gap} items-center rotate-180`}
        style={{ color }}
      >
        <span>{rank}</span>
        <span>{suit}</span>
      </div>
    </div>
  );
};
