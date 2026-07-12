import { useId } from 'react';
import type { CSSProperties } from 'react';
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

function CardFaceFront({
  rank,
  suit,
  size,
  playerActive,
  highlight,
}: {
  rank: CardRank;
  suit: CardSuit;
  size: NonNullable<PlayingCardProps['size']>;
  playerActive: boolean;
  highlight: PlayingCardProps['highlight'];
}) {
  const corner = size === 'lg' ? 'text-sm' : size === 'md' ? 'text-[11px]' : 'text-[9px]';
  const color = suitColor(suit);
  const borderCls = playerActive
    ? 'border-[3px] border-rose-500 shadow-[0_0_0_1px_rgba(244,63,94,0.35)]'
    : highlight === 'win'
      ? 'border-emerald-400/70 shadow-emerald-500/20 shadow-lg border'
      : highlight === 'bust'
        ? 'border-rose-400/60 shadow-rose-500/20 shadow-md border'
        : 'border border-zinc-300/80 shadow-md';

  return (
    <div className={`relative w-full h-full rounded-lg bg-zinc-50 ${borderCls} select-none`}>
      <div
        className={`absolute top-1 left-1 ${corner} font-black leading-none flex flex-col items-center`}
        style={{ color }}
      >
        <span>{rank}</span>
        <span>{suit}</span>
      </div>
      <CenterSuit suit={suit} />
      <div
        className={`absolute bottom-1 right-1 ${corner} font-black leading-none flex flex-col items-center rotate-180`}
        style={{ color }}
      >
        <span>{rank}</span>
        <span>{suit}</span>
      </div>
    </div>
  );
}

function CardFaceBack({ patternId }: { patternId: string }) {
  return (
    <div className="relative w-full h-full rounded-lg border border-zinc-500/50 bg-gradient-to-br from-slate-700 to-slate-900 shadow-lg flex items-center justify-center overflow-hidden">
      <svg width="100%" height="100%" className="opacity-40" aria-hidden="true">
        <defs>
          <pattern id={patternId} x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M-1,1 l2,-2 M0,8 l8,-8 M7,9 l2,-2" stroke="#94a3b8" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
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
  /** Animate deal entrance from the shoe. */
  animateIn?: boolean;
  /** Stagger delay in ms for deal-in. */
  dealDelayMs?: number;
  className?: string;
  style?: CSSProperties;
}

export function PlayingCard({
  rank,
  suit,
  faceDown = false,
  size = 'md',
  playerActive = false,
  highlight = null,
  animateIn = false,
  dealDelayMs = 0,
  className = '',
  style,
}: PlayingCardProps) {
  const uid = useId().replace(/:/g, '');
  const patternId = `twentyone-back-${uid}`;
  const dim = size === 'lg' ? 'w-[4.5rem] h-[6.25rem]' : size === 'md' ? 'w-14 h-20' : 'w-10 h-14';

  return (
    <div
      className={`twentyone-card-scene ${dim} flex-shrink-0 ${animateIn ? 'twentyone-deal-in' : ''} ${className}`}
      style={{
        ...style,
        animationDelay: animateIn && dealDelayMs > 0 ? `${dealDelayMs}ms` : undefined,
      }}
      role="img"
      aria-label={faceDown ? 'Face-down card' : `${rank} of ${suit}`}
    >
      <div className={`twentyone-card-flipper ${faceDown ? 'is-flipped' : ''}`}>
        <div className="twentyone-card-face">
          <CardFaceFront
            rank={rank}
            suit={suit}
            size={size}
            playerActive={playerActive}
            highlight={highlight}
          />
        </div>
        <div className="twentyone-card-face is-back">
          <CardFaceBack patternId={patternId} />
        </div>
      </div>
    </div>
  );
}
