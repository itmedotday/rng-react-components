import React from 'react';
import type { RollResult } from '../types';

export interface HistoryLedgerProps {
  history: RollResult[];
}

export const HistoryLedger: React.FC<HistoryLedgerProps> = ({ history }) => {
  return (
    <div className="w-full bg-zinc-950/40 border border-zinc-900/80 rounded-2xl p-4 flex flex-col gap-3 select-none">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">History</span>
        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest font-mono">
          Last {history.length} Rolls
        </span>
      </div>

      <ul
        className="w-full min-h-[44px] flex items-center gap-3 overflow-x-auto py-1 list-none m-0 p-0 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
        aria-label="Roll History"
      >
        {history.length === 0 ? (
          <li className="text-xs text-zinc-600 italic select-none list-none">
            No rolls logged yet...
          </li>
        ) : (
          history.map((item) => (
            <li
              key={item.id}
              title={`Outcome: ${item.outcome.toFixed(2)} (${item.isWin ? 'Win' : 'Loss'})`}
              className={`shrink-0 px-3 py-2 rounded-xl border text-xs font-black font-mono tracking-tight animate-slide-in transition-all duration-300 shadow-md list-none
                ${
                  item.isWin
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-emerald-950/10 ring-2 ring-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/40 shadow-rose-950/10 ring-1 ring-zinc-800'
                }
              `}
            >
              {item.outcome.toFixed(2)}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};
