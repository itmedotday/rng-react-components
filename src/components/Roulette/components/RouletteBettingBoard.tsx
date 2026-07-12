import React from 'react';
import type { RouletteSpot, SpotStack } from '../types';
import {
  NUMBER_ROWS,
  RED_NUMBERS,
  formatChipAmount,
  spotKey,
} from '../rouletteMath';

function numberColor(n: number): 'red' | 'black' | 'green' {
  if (n === 0) return 'green';
  return RED_NUMBERS.has(n) ? 'red' : 'black';
}

function ChipMarker({ amount }: { amount: number }) {
  return (
    <span
      className="pointer-events-none absolute inset-0 m-auto flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full border-2 border-white/80 bg-rose-600 text-[8px] sm:text-[9px] font-black text-white shadow-[0_1px_4px_rgba(0,0,0,0.6)] ring-1 ring-rose-900/80"
      aria-hidden="true"
    >
      {formatChipAmount(amount)}
    </span>
  );
}

export interface RouletteBettingBoardProps {
  stacks: ReadonlyMap<string, SpotStack>;
  onPlace: (spot: RouletteSpot) => void;
  onUndo: () => void;
  onClear: () => void;
  disabled: boolean;
  lastNumber?: number | null;
  canUndo: boolean;
}

export const RouletteBettingBoard: React.FC<RouletteBettingBoardProps> = ({
  stacks,
  onPlace,
  onUndo,
  onClear,
  disabled,
  lastNumber,
  canUndo,
}) => {
  const stackOn = (spot: RouletteSpot) => stacks.get(spotKey(spot));

  function cellClass(n: number): string {
    const color = numberColor(n);
    const isLast = n === lastNumber;
    const base =
      'relative flex items-center justify-center text-white font-bold text-[10px] sm:text-xs cursor-pointer select-none transition-colors border border-black/40 rounded-sm min-h-8 sm:min-h-9';
    const colorCls =
      color === 'green'
        ? 'bg-[#147b3a] hover:bg-[#1a9348]'
        : color === 'red'
          ? 'bg-[#c41e1e] hover:bg-[#d42a2a]'
          : 'bg-[#1c2833] hover:bg-[#243447]';
    const lastCls = isLast ? 'ring-1 ring-amber-300/70' : '';
    const disabledCls = disabled ? 'opacity-60 cursor-not-allowed' : '';
    return `${base} ${colorCls} ${lastCls} ${disabledCls}`;
  }

  function outsideClass(active: boolean): string {
    return `relative flex items-center justify-center min-h-9 sm:min-h-10 rounded-sm border border-[#2f4553] bg-[#1a2c38] text-[10px] sm:text-xs font-bold uppercase tracking-wide text-white/90 cursor-pointer select-none transition-colors hover:bg-[#213743]
      ${active ? 'ring-1 ring-amber-300/60' : ''}
      ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`;
  }

  const place = (spot: RouletteSpot) => {
    if (disabled) return;
    onPlace(spot);
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="w-full overflow-x-auto pb-1 -mx-0.5 px-0.5">
        <div className="min-w-[520px] sm:min-w-0 flex flex-col gap-1">
          {/* Main grid: 0 | numbers | 2:1 columns */}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => place({ type: 'number', number: 0 })}
              disabled={disabled}
              className={`${cellClass(0)} w-9 sm:w-10 self-stretch`}
              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
              aria-label="Bet number 0"
            >
              0
              {stackOn({ type: 'number', number: 0 }) && (
                <ChipMarker amount={stackOn({ type: 'number', number: 0 })!.amount} />
              )}
            </button>

            <div className="flex-1 grid grid-rows-3 gap-1">
              {NUMBER_ROWS.map((row, ri) => (
                <div key={ri} className="grid grid-cols-12 gap-1">
                  {row.map((n) => {
                    const spot: RouletteSpot = { type: 'number', number: n };
                    const stack = stackOn(spot);
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => place(spot)}
                        disabled={disabled}
                        className={cellClass(n)}
                        aria-label={`Bet number ${n}`}
                      >
                        {n}
                        {stack && <ChipMarker amount={stack.amount} />}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="grid grid-rows-3 gap-1 w-10 sm:w-12">
              {([3, 2, 1] as const).map((column) => {
                const spot: RouletteSpot = { type: 'column', column };
                const stack = stackOn(spot);
                return (
                  <button
                    key={column}
                    type="button"
                    onClick={() => place(spot)}
                    disabled={disabled}
                    className={outsideClass(Boolean(stack))}
                    aria-label={`Bet column ${column}, pays 2 to 1`}
                  >
                    2:1
                    {stack && <ChipMarker amount={stack.amount} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dozens */}
          <div className="grid grid-cols-3 gap-1 pl-10 sm:pl-11 pr-11 sm:pr-13">
            {([1, 2, 3] as const).map((dozen) => {
              const spot: RouletteSpot = { type: 'dozen', dozen };
              const stack = stackOn(spot);
              const label =
                dozen === 1 ? '1 to 12' : dozen === 2 ? '13 to 24' : '25 to 36';
              return (
                <button
                  key={dozen}
                  type="button"
                  onClick={() => place(spot)}
                  disabled={disabled}
                  className={outsideClass(Boolean(stack))}
                  aria-label={`Bet ${label}`}
                >
                  {label}
                  {stack && <ChipMarker amount={stack.amount} />}
                </button>
              );
            })}
          </div>

          {/* Outside row */}
          <div className="grid grid-cols-6 gap-1 pl-10 sm:pl-11 pr-11 sm:pr-13">
            {(
              [
                { spot: { type: 'range', range: 'low' } as const, label: '1 to 18' },
                { spot: { type: 'parity', parity: 'even' } as const, label: 'Even' },
                { spot: { type: 'color', color: 'red' } as const, label: '◆', red: true },
                { spot: { type: 'color', color: 'black' } as const, label: '◆', black: true },
                { spot: { type: 'parity', parity: 'odd' } as const, label: 'Odd' },
                { spot: { type: 'range', range: 'high' } as const, label: '19 to 36' },
              ] as const
            ).map(({ spot, label, ...flags }) => {
              const stack = stackOn(spot);
              const red = 'red' in flags && flags.red;
              const black = 'black' in flags && flags.black;
              return (
                <button
                  key={spotKey(spot)}
                  type="button"
                  onClick={() => place(spot)}
                  disabled={disabled}
                  className={`${outsideClass(Boolean(stack))} ${red ? 'text-red-500' : ''} ${black ? 'text-zinc-300' : ''}`}
                  aria-label={
                    spot.type === 'color'
                      ? `Bet ${spot.color}`
                      : `Bet ${label}`
                  }
                >
                  {red || black ? (
                    <span
                      className={`inline-block h-4 w-4 rotate-45 border ${red ? 'border-red-500 bg-red-600/80' : 'border-zinc-400 bg-zinc-800'}`}
                    />
                  ) : (
                    label
                  )}
                  {stack && <ChipMarker amount={stack.amount} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          type="button"
          onClick={onUndo}
          disabled={disabled || !canUndo}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wide text-zinc-300 bg-[#1a2c38] border border-[#2f4553] hover:bg-[#213743] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          aria-label="Undo last chip"
        >
          <span aria-hidden="true">↶</span>
          Undo
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={disabled || stacks.size === 0}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wide text-zinc-300 bg-[#1a2c38] border border-[#2f4553] hover:bg-[#213743] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          aria-label="Clear all chips"
        >
          <span aria-hidden="true">↻</span>
          Clear
        </button>
      </div>
    </div>
  );
};
