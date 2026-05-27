import React from 'react';
import { HelpCircle } from 'lucide-react';

export const CoinFlipRules: React.FC = () => {
  return (
    <div className="w-full flex gap-3 items-start select-none bg-zinc-900/20 rounded-2xl p-4.5 mt-8 border border-zinc-900/60">
      <HelpCircle className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
      <div className="flex flex-col gap-1">
        <h3 className="text-xs font-bold text-zinc-400">Rules</h3>
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          Select your prediction side (Orange Heads or Blue Tails). Trigger the flip to launch the 3D coin rotation sequence. Test your prediction accuracy over consecutive random trials.
        </p>
      </div>
    </div>
  );
};
