import React from 'react';
import { ArrowLeftRight } from 'lucide-react';

export interface ControlInputsProps {
  isRollOver: boolean;
  isRolling: boolean;
  rawTarget: string;
  rawChance: string;
  onTargetChange: (val: string) => void;
  onTargetBlur: () => void;
  onChanceChange: (val: string) => void;
  onChanceBlur: () => void;
  onToggleMode: () => void;
  onRollTrigger: () => void;
  disabled?: boolean;
}

export const ControlInputs: React.FC<ControlInputsProps> = ({
  isRollOver,
  isRolling,
  rawTarget,
  rawChance,
  onTargetChange,
  onTargetBlur,
  onChanceChange,
  onChanceBlur,
  onToggleMode,
  onRollTrigger,
  disabled = false,
}) => {
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2 text-left bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4">
          <label className="text-zinc-400 text-xs font-black tracking-wider uppercase flex items-center gap-1">
            {isRollOver ? 'Roll Over' : 'Roll Under'} Target
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={rawTarget}
              onChange={(e) => onTargetChange(e.target.value)}
              onBlur={onTargetBlur}
              disabled={isRolling || disabled}
              aria-label="Roll Target"
              className="w-full glass-input rounded-xl px-4 py-3.5 pr-12 text-lg font-black font-mono text-white disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={onToggleMode}
              disabled={isRolling || disabled}
              title="Switch Roll Over / Under"
              className="absolute right-2 px-2.5 py-2 text-zinc-400 hover:text-indigo-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-left bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4">
          <label className="text-zinc-400 text-xs font-black tracking-wider uppercase flex items-center gap-1">
            Win Chance %
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={rawChance}
              onChange={(e) => onChanceChange(e.target.value)}
              onBlur={onChanceBlur}
              disabled={isRolling || disabled}
              aria-label="Win Chance"
              className="w-full glass-input rounded-xl px-4 py-3.5 pr-10 text-lg font-black font-mono text-white disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <span className="absolute right-4 text-zinc-500 font-bold select-none">%</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onRollTrigger}
        disabled={isRolling || disabled}
        className={`w-full py-4.5 rounded-2xl font-black text-base tracking-widest uppercase transition-all duration-300 shadow-lg text-white select-none disabled:cursor-not-allowed
          ${
            isRolling
              ? 'bg-zinc-800 border border-zinc-700 text-zinc-500 shadow-none'
              : 'bg-indigo-600 border border-indigo-500 hover:bg-indigo-500 shadow-indigo-950/20 active:translate-y-0.5 cursor-pointer'
          }
        `}
      >
        {isRolling ? 'ROLLING...' : 'ROLL DICE'}
      </button>
    </div>
  );
};
