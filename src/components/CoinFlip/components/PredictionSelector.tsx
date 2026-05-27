import React from 'react';
import type { CoinSide } from '../types';

export interface PredictionSelectorProps {
  prediction: CoinSide;
  onSelect: (side: CoinSide) => void;
  disabled: boolean;
}

export const PredictionSelector: React.FC<PredictionSelectorProps> = ({
  prediction,
  onSelect,
  disabled,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Predict Orange Option */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect('orange')}
        className={`flex items-center justify-center gap-3 px-5 py-4 rounded-2xl border text-sm font-bold tracking-wider uppercase transition-all duration-300 select-none
          ${
            prediction === 'orange'
              ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:text-zinc-400 hover:border-zinc-700'
          }
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        `}
      >
        <div
          className={`w-5 h-5 rounded-full border-4 bg-zinc-900 transition-all duration-300
            ${prediction === 'orange' ? 'border-amber-400 shadow-inner' : 'border-zinc-700'}
          `}
        />
        Predict Orange
      </button>

      {/* Predict Blue Option */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect('blue')}
        className={`flex items-center justify-center gap-3 px-5 py-4 rounded-2xl border text-sm font-bold tracking-wider uppercase transition-all duration-300 select-none
          ${
            prediction === 'blue'
              ? 'bg-blue-500/10 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
              : 'bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:text-zinc-400 hover:border-zinc-700'
          }
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        `}
      >
        <div
          className={`w-4.5 h-4.5 rotate-45 rounded-sm border-[3px] bg-zinc-900 transition-all duration-300
            ${prediction === 'blue' ? 'border-blue-400 shadow-inner' : 'border-zinc-700'}
          `}
        />
        Predict Blue
      </button>
    </div>
  );
};
