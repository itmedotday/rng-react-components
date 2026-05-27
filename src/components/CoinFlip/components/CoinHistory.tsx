import React from 'react';
import type { CoinFlipResult } from '../types';

export interface CoinHistoryProps {
  history: CoinFlipResult[];
}

export const CoinHistory: React.FC<CoinHistoryProps> = ({ history }) => {
  return (
    <div className="w-full bg-zinc-950/40 border border-zinc-900/80 rounded-2xl p-4 flex flex-col gap-3 select-none">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">History</span>
        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest font-mono">
          Last {history.length} Flips
        </span>
      </div>

      <div className="w-full min-h-[44px] flex items-center gap-3 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {history.length === 0 ? (
          <div className="text-xs text-zinc-600 italic select-none">No flips logged yet...</div>
        ) : (
          <div className="flex items-center gap-2.5">
            {history.map((result) => (
              <div
                key={result.id}
                title={`Result: ${result.landed.toUpperCase()} (Prediction: ${result.prediction.toUpperCase()} - ${result.isWin ? 'CORRECT' : 'INCORRECT'})`}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 animate-slide-in transition-all duration-300 shadow-md
                  ${
                    result.landed === 'orange'
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-amber-950/10'
                      : 'bg-blue-500/10 border-blue-500/40 text-blue-400 shadow-blue-950/10'
                  }
                  ${result.isWin ? 'ring-2 ring-emerald-500/30' : 'ring-1 ring-zinc-800'}
                `}
              >
                {result.landed === 'orange' ? (
                  /* Orange circle icon representation matching heads reference */
                  <div className="w-5 h-5 rounded-full border-4 border-amber-400/80 bg-zinc-900 shadow-inner" />
                ) : (
                  /* Blue diamond icon representation matching tails reference */
                  <div className="w-4.5 h-4.5 rotate-45 rounded-sm border-[3px] border-blue-400 bg-zinc-900 shadow-inner" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
