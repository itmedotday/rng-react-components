import React from 'react';
import type { D20RollResult } from '../types';

export interface D20RollHistoryProps {
  history: D20RollResult[];
}

export const D20RollHistory: React.FC<D20RollHistoryProps> = ({ history }) => {
  return (
    <div className="w-full bg-zinc-950/40 border border-zinc-900/80 rounded-2xl p-4 flex flex-col gap-3 select-none">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">History</span>
        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest font-mono">
          Last {history.length} Rolls
        </span>
      </div>

      <div className="w-full min-h-[44px] flex items-center gap-3 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {history.length === 0 ? (
          <div className="text-xs text-zinc-600 italic select-none">No rolls logged yet...</div>
        ) : (
          <div className="flex items-center gap-2.5">
            {history.map((result) => (
              <div
                key={result.id}
                title={`Roll ${result.roll} vs DC ${result.target} - ${result.isWin ? 'SUCCESS' : 'FAIL'}`}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 animate-slide-in transition-all duration-300 shadow-md font-black font-mono text-xs
                  ${
                    result.isWin
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-emerald-950/10'
                      : 'bg-rose-500/10 border-rose-500/40 text-rose-400 shadow-rose-950/10'
                  }
                  ${result.isCritical ? 'ring-2 ring-amber-500/40' : ''}
                  ${result.isFumble ? 'ring-2 ring-zinc-500/40' : ''}
                `}
              >
                {result.roll}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
