import React from 'react';
import { D20Die3D, type D20Die3DProps } from './D20Die3D';

export type D20VisualProps = D20Die3DProps;

export const D20Visual: React.FC<D20VisualProps> = (props) => {
  const { isRolling, isCritical, isFumble } = props;

  return (
    <div className="relative select-none flex items-center justify-center">
      <D20Die3D {...props} />

      {!isRolling && isCritical && (
        <div className="absolute -top-1 right-0 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-[9px] font-black uppercase tracking-wider text-amber-400">
          Nat 20
        </div>
      )}
      {!isRolling && isFumble && (
        <div className="absolute -top-1 right-0 px-2 py-0.5 rounded-full bg-zinc-700/40 border border-zinc-500/50 text-[9px] font-black uppercase tracking-wider text-zinc-400">
          Nat 1
        </div>
      )}
    </div>
  );
};
