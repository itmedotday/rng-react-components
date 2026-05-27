import React from 'react';
import { animated } from '@react-spring/web';

export interface OutcomeBadgeProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style: any; // React Spring animated style coordinates
  isRolling: boolean;
  cyclingNumber: string;
  rollOutcome: number | null;
  rollStatus: 'idle' | 'win' | 'loss';
}

export const OutcomeBadge: React.FC<OutcomeBadgeProps> = ({
  style,
  isRolling,
  cyclingNumber,
  rollOutcome,
  rollStatus,
}) => {
  return (
    <animated.div
      style={style}
      data-testid="outcome-badge"
      aria-label="Roll Outcome"
      className={`absolute z-10 px-4 py-2 rounded-xl text-sm font-black shadow-lg border pointer-events-none select-none flex flex-col items-center
        ${isRolling 
          ? 'bg-indigo-600 text-white border-indigo-400 shadow-indigo-500/20' 
          : rollStatus === 'win'
            ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-emerald-500/30'
            : 'bg-rose-600 text-white border-rose-500 shadow-rose-600/30'
        }
      `}
    >
      <span className="leading-tight text-base font-black font-mono">
        {isRolling ? cyclingNumber : (rollOutcome !== null ? rollOutcome.toFixed(2) : '')}
      </span>
      {/* Downward pointer caret */}
      <div className={`w-3 h-3 rotate-45 absolute -bottom-1.5 border-r border-b 
        ${isRolling 
          ? 'bg-indigo-600 border-indigo-400' 
          : rollStatus === 'win'
            ? 'bg-emerald-500 border-emerald-400'
            : 'bg-rose-600 border-rose-500'
        }
      `} />
    </animated.div>
  );
};
