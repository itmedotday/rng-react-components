import React from 'react';
import { HelpCircle } from 'lucide-react';

export const RngWheelRules: React.FC = () => {
  return (
    <div className="w-full flex gap-3 items-start select-none bg-zinc-900/20 rounded-2xl p-4.5 mt-8 border border-zinc-900/60">
      <HelpCircle className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
      <div className="flex flex-col gap-1">
        <h3 className="text-xs font-bold text-zinc-400">RNG Wheel Guidelines</h3>
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          The wheel represents a mathematically pure probability model. Configure your win chance to dynamically adjust the green sector. Trigger the spin to rotate the ring clockwise. Landing the green sector under the top indicator results in a win.
        </p>
      </div>
    </div>
  );
};
