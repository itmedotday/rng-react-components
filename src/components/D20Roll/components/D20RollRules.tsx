import React from 'react';
import { HelpCircle } from 'lucide-react';

export const D20RollRules: React.FC = () => {
  return (
    <div className="w-full flex gap-3 items-start select-none bg-zinc-900/20 rounded-2xl p-4.5 mt-8 border border-zinc-900/60">
      <HelpCircle className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
      <div className="flex flex-col gap-1">
        <h3 className="text-xs font-bold text-zinc-400">Rules</h3>
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          Set your Difficulty Class (DC). DC means Difficulty Class. You win when your roll is greater
          than or equal to the DC. Default DC is 11. Natural 20 and natural 1 badges are visual flair
          only and do not change the win rule.
        </p>
      </div>
    </div>
  );
};
