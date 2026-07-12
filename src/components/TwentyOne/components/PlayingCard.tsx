import React from 'react';
import type { CardRank, CardSuit } from '../types';

function suitColor(suit: CardSuit): string {
  return suit === '♥' || suit === '♦' ? '#dc2626' : '#18181b';
}

function CenterSuit({ suit }: { suit: CardSuit }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
      style={{ color: suitColor(suit), fontSize: '1.75rem', lineHeight: 1, opacity: 0.9 }}
      aria-hidden="true"
    >
      {suit}
    </div>
  );
}

function CardBack({ size }: { size: PlayingCardProps['size'] }) {
  const dim = size === 'lg' ? 'w-[4.5rem] h-[6.25rem]' : size === 'md' ? 'w-14 h-20' : 'w-10 h-14';
  return (
    <div
      className={`${dim} rounded-lg border border-zinc-500/50 bg-gradient-to-br from-slate-700 to-slate-900 shadow-lg flex items-center justify-center overflow-hidden`}
      aria-label="Face-down card"
    >
      <svg width="100%" height="100%" className="opacity-40" aria-hidden="true">
        <defs>
          <pattern id="card-back-pattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M-1,1 l2,-2 M0,8 l8,-8 M7,9 l2,-2" stroke="#94a3b8" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#card-back-pattern)" />
      </svg>
      <span className="absolute text-slate-300/80 text-xs font-black tracking-widest">21</span>
    </div>
  );
}

export interface PlayingCardProps {
  rank: CardRank;
  suit: CardSuit;
  faceDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /** Player-active red outline (screenshot style). */
  playerActive?: boolean;
  highlight?: 'win' | 'bust' | null;
  className?: string;
  style?: React.CSSProperties;
}

export const PlayingCard: React.FC<PlayingCardProps> = ({
  rank,
  suit,
  faceDown = false,
  size = 'md',
  playerActive = false,
  highlight = null,
  className = '',
  style,
}) => {
  if (faceDown) {
    return (
      <div className={className} style={style}>
        <CardBack size={size} />
      </div>
    );
  }

  const dimMap = {
    sm: { card: 'w-10 h-14', corner: 'text-[9px]' },
    md: { card: 'w-14 h-20', corner: 'text-[11px]' },
    lg: { card: 'w-[4.5rem] h-[6.25rem]', corner: 'text-sm' },
  };
  const d = dimMap[size];
  const color = suitColor(suit);

  const borderCls = playerActive
    ? 'border-[3px] border-rose-500 shadow-[0_0_0_1px_rgba(244,63,94,0.35)]'
    : highlight === 'win'
      ? 'border-emerald-400/70 shadow-emerald-500/20 shadow-lg border'
      : highlight === 'bust'
        ? 'border-rose-400/60 shadow-rose-500/20 shadow-md border'
        : 'border border-zinc-300/80 shadow-md';

  return (
    <div
      className={`relative ${d.card} rounded-lg bg-zinc-50 ${borderCls} select-none flex-shrink-0 ${className}`}
      role="img"
      aria-label={`${rank} of ${suit}`}
      style={style}
    >
      <div
        className={`absolute top-1 left-1 ${d.corner} font-black leading-none flex flex-col items-center`}
        style={{ color }}
      >
        <span>{rank}</span>
        <span>{suit}</span>
      </div>
      <CenterSuit suit={suit} />
      <div
        className={`absolute bottom-1 right-1 ${d.corner} font-black leading-none flex flex-col items-center rotate-180`}
        style={{ color }}
      >
        <span>{rank}</span>
        <span>{suit}</span>
      </div>
    </div>
  );
};
