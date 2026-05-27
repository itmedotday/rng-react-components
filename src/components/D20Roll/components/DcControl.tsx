import React from 'react';

export interface DcControlProps {
  rawTarget: string;
  rawWinChance: string;
  isRolling: boolean;
  disabled?: boolean;
  onTargetChange: (value: string) => void;
  onTargetBlur: () => void;
}

export const DcControl: React.FC<DcControlProps> = ({
  rawTarget,
  rawWinChance,
  isRolling,
  disabled = false,
  onTargetChange,
  onTargetBlur,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-2 text-left bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4">
        <label className="text-zinc-400 text-xs font-black tracking-wider uppercase">
          Difficulty Class (DC)
        </label>
        <span className="text-[10px] text-zinc-600 font-bold -mt-1">DC = Difficulty Class</span>
        <div className="relative flex items-center">
          <input
            type="text"
            inputMode="numeric"
            value={rawTarget}
            onChange={(e) => onTargetChange(e.target.value)}
            onBlur={onTargetBlur}
            disabled={isRolling || disabled}
            aria-label="Difficulty Class"
            className="w-full glass-input rounded-xl px-4 py-3.5 text-lg font-black font-mono text-white disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 text-left bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4">
        <label className="text-zinc-400 text-xs font-black tracking-wider uppercase flex items-center gap-1">
          Win Chance %
        </label>
        <span className="text-[10px] text-zinc-600 font-bold -mt-1 opacity-0 select-none" aria-hidden>
          spacer
        </span>
        <div className="relative flex items-center">
          <input
            type="text"
            readOnly
            value={rawWinChance}
            tabIndex={-1}
            aria-label="Win Chance"
            className="w-full glass-input rounded-xl px-4 py-3.5 pr-10 text-lg font-black font-mono text-violet-300 opacity-90 cursor-default"
          />
          <span className="absolute right-4 text-zinc-500 font-bold select-none">%</span>
        </div>
      </div>
    </div>
  );
};
