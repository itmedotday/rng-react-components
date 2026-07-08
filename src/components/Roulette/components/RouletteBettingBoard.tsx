import React from 'react';
import type { RouletteBet, RouletteColor } from '../types';

const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

function numberColor(n: number): RouletteColor {
  if (n === 0) return 'green';
  return RED_NUMBERS.has(n) ? 'red' : 'black';
}

/**
 * Standard roulette table layout:
 *   Row 0 (top): 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36
 *   Row 1 (mid): 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35
 *   Row 2 (btm): 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34
 */
const NUMBER_ROWS: number[][] = [
  [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
  [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
  [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
];

function activeBetLabel(bet: RouletteBet): string {
  if (bet.type === 'number') return `#${bet.number}`;
  if (bet.color === 'red') return 'RED';
  if (bet.color === 'black') return 'BLACK';
  return 'GREEN';
}

export interface RouletteBettingBoardProps {
  bet: RouletteBet;
  onBetChange: (bet: RouletteBet) => void;
  disabled: boolean;
  lastNumber?: number | null;
}

export const RouletteBettingBoard: React.FC<RouletteBettingBoardProps> = ({
  bet,
  onBetChange,
  disabled,
  lastNumber,
}) => {
  const selectNumber = (n: number) => {
    if (disabled) return;
    onBetChange({ type: 'number', number: n });
  };

  const selectColor = (color: RouletteColor) => {
    if (disabled) return;
    onBetChange({ type: 'color', color });
  };

  function numberCellClass(n: number): string {
    const color = numberColor(n);
    const isSelected = bet.type === 'number' && bet.number === n;
    const isLast = n === lastNumber;

    const base = 'relative flex items-center justify-center text-white font-bold text-[10px] cursor-pointer select-none transition-all duration-150 border rounded';
    const colorCls =
      color === 'green'
        ? 'bg-emerald-700/70 border-emerald-600/50 hover:bg-emerald-600/80'
        : color === 'red'
        ? 'bg-red-700/70 border-red-600/40 hover:bg-red-600/80'
        : 'bg-zinc-800/80 border-zinc-700/50 hover:bg-zinc-700/70';
    const selectedCls = isSelected ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-black' : '';
    const lastCls = isLast && !isSelected ? 'ring-1 ring-white/40' : '';
    const disabledCls = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

    return `${base} ${colorCls} ${selectedCls} ${lastCls} ${disabledCls}`;
  }

  function colorBtnClass(color: RouletteColor): string {
    const isSelected = bet.type === 'color' && bet.color === color;
    const base = 'flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-wide border transition-all duration-150 cursor-pointer select-none';
    const colorMap = {
      red: 'bg-red-700/60 border-red-600/50 text-red-100 hover:bg-red-600/80',
      black: 'bg-zinc-800/80 border-zinc-600/50 text-zinc-100 hover:bg-zinc-700/80',
      green: 'bg-emerald-700/60 border-emerald-600/50 text-emerald-100 hover:bg-emerald-600/80',
    };
    const selectedRing = 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-black';
    const disabledCls = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';
    return `${base} ${colorMap[color]} ${isSelected ? selectedRing : ''} ${disabledCls}`;
  }

  return (
    <div className="w-full rounded-2xl border border-zinc-800/80 bg-zinc-950/50 p-3 flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-zinc-400 text-xs font-black uppercase tracking-wider">Betting Board</span>
        <span className="text-yellow-400 text-xs font-black uppercase tracking-wider">
          Bet: {activeBetLabel(bet)}
        </span>
      </div>

      {/* Number grid: 0 | 3×12 grid */}
      <div className="flex gap-1">
        {/* Zero */}
        <button
          type="button"
          onClick={() => selectNumber(0)}
          disabled={disabled}
          className={numberCellClass(0) + ' w-7 row-span-3 self-stretch text-[10px]'}
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          aria-label="Bet number 0"
        >
          0
        </button>

        {/* 3 rows of 12 numbers */}
        <div className="flex-1 grid grid-rows-3 gap-0.5">
          {NUMBER_ROWS.map((row, ri) => (
            <div key={ri} className="grid grid-cols-12 gap-0.5 h-7">
              {row.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => selectNumber(n)}
                  disabled={disabled}
                  className={numberCellClass(n)}
                  aria-label={`Bet number ${n}`}
                >
                  {n}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Column bets (2:1) — decorative labels */}
        <div className="grid grid-rows-3 gap-0.5 w-8">
          {['2:1', '2:1', '2:1'].map((label, i) => (
            <div
              key={i}
              className="flex items-center justify-center bg-zinc-800/40 border border-zinc-700/30 rounded text-[8px] text-zinc-500 font-bold h-7 select-none"
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Dozen bets — decorative labels */}
      <div className="grid grid-cols-3 gap-0.5">
        {['1st 12', '2nd 12', '3rd 12'].map((label) => (
          <div
            key={label}
            className="flex items-center justify-center bg-zinc-800/40 border border-zinc-700/30 rounded-lg py-1.5 text-[10px] text-zinc-500 font-black uppercase tracking-wide select-none"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Outside colour bets */}
      <div className="flex gap-1.5">
        {(['red', 'black', 'green'] as RouletteColor[]).map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => selectColor(color)}
            disabled={disabled}
            className={colorBtnClass(color)}
            aria-label={`Bet ${color}`}
          >
            {color}
          </button>
        ))}
      </div>
    </div>
  );
};
