import React from 'react';
import { formatChipAmount } from '../rouletteMath';

export interface RouletteControlsProps {
  chipValues: number[];
  chipValue: number;
  onChipValueChange: (value: number) => void;
  totalAmount: number;
  onHalve: () => void;
  onDouble: () => void;
  onPlay: () => void;
  disabled: boolean;
  isSpinning: boolean;
  canPlay: boolean;
}

export const RouletteControls: React.FC<RouletteControlsProps> = ({
  chipValues,
  chipValue,
  onChipValueChange,
  totalAmount,
  onHalve,
  onDouble,
  onPlay,
  disabled,
  isSpinning,
  canPlay,
}) => {
  const busy = disabled || isSpinning;
  const playReady = !busy && canPlay;

  return (
    <aside className="w-full lg:w-56 xl:w-64 shrink-0 flex flex-col gap-3 rounded-xl bg-[#1a2c38] border border-[#2f4553] p-3 sm:p-4">
      <div
        className="flex rounded-lg bg-[#0f212e] p-1 border border-[#2f4553]"
        role="tablist"
        aria-label="Bet mode"
      >
        <button
          type="button"
          role="tab"
          aria-selected="true"
          className="flex-1 rounded-md py-2 text-xs font-bold uppercase tracking-wide bg-[#2f4553] text-white cursor-default"
        >
          Manual
        </button>
        <button
          type="button"
          role="tab"
          aria-selected="false"
          disabled
          className="flex-1 rounded-md py-2 text-xs font-bold uppercase tracking-wide text-zinc-500 cursor-not-allowed"
          title="Auto mode coming soon"
        >
          Auto
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-zinc-400">
          <span>Chip Value</span>
          <span className="inline-flex items-center gap-1 text-amber-300 tabular-nums transition-all duration-200">
            <span
              className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[8px] font-black text-zinc-950"
              aria-hidden="true"
            >
              G
            </span>
            {formatChipAmount(chipValue)}
          </span>
        </div>
        <div
          className="flex gap-1.5 overflow-x-auto pb-1 -mx-0.5 px-0.5 overscroll-x-contain"
          role="listbox"
          aria-label="Chip denominations"
        >
          {chipValues.map((value) => {
            const selected = value === chipValue;
            return (
              <button
                key={value}
                type="button"
                role="option"
                aria-selected={selected}
                disabled={busy}
                onClick={() => onChipValueChange(value)}
                className={`relative shrink-0 h-11 w-11 rounded-full border-2 text-[10px] font-black text-white shadow-md cursor-pointer transition-[transform,box-shadow,border-color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80
                  ${selected ? 'border-white scale-110 ring-2 ring-amber-300/50 shadow-[0_0_12px_rgba(251,191,36,0.35)]' : 'border-rose-200/70 hover:scale-105'}
                  ${busy ? 'opacity-50 cursor-not-allowed hover:scale-100' : 'active:scale-95'}
                  bg-gradient-to-b from-rose-400 to-rose-700`}
              >
                {formatChipAmount(value)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="roulette-total-amount"
          className="text-xs font-bold uppercase tracking-wide text-zinc-400"
        >
          Total Amount
        </label>
        <div className="flex gap-1.5">
          <div className="flex-1 flex items-center gap-2 rounded-md bg-[#0f212e] border border-[#2f4553] px-3 py-2.5 transition-colors duration-200 focus-within:border-amber-300/40">
            <span
              className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[8px] font-black text-zinc-950"
              aria-hidden="true"
            >
              G
            </span>
            <input
              id="roulette-total-amount"
              readOnly
              value={totalAmount.toFixed(2)}
              className="w-full bg-transparent text-sm font-semibold text-white outline-none tabular-nums transition-opacity duration-200"
            />
          </div>
          <button
            type="button"
            onClick={onHalve}
            disabled={busy || totalAmount <= 0}
            className="rounded-md px-3 py-2 text-xs font-black text-white bg-[#2f4553] hover:bg-[#3a5566] transition-[transform,background-color] duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70"
            aria-label="Halve all chip stacks"
          >
            ½
          </button>
          <button
            type="button"
            onClick={onDouble}
            disabled={busy || totalAmount <= 0}
            className="rounded-md px-3 py-2 text-xs font-black text-white bg-[#2f4553] hover:bg-[#3a5566] transition-[transform,background-color] duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70"
            aria-label="Double all chip stacks"
          >
            2x
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onPlay}
        disabled={!playReady}
        className={`w-full rounded-md py-3.5 text-sm font-black uppercase tracking-widest transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70
          ${
            !playReady
              ? 'bg-[#2f4553] text-zinc-500 cursor-not-allowed'
              : 'bg-[#00e701] text-zinc-950 hover:bg-[#1fff20] active:translate-y-px shadow-[0_0_20px_rgba(0,231,1,0.28)] roulette-play-ready'
          }
          ${isSpinning ? 'roulette-play-busy' : ''}
        `}
      >
        {isSpinning ? 'Spinning…' : 'Play'}
      </button>
    </aside>
  );
};
