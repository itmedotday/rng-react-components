import type { ReactNode } from 'react';
import {
  ArrowDownToLine,
  Coins,
  Hand,
  Layers,
  Shield,
  ShieldOff,
} from 'lucide-react';
import type { TwentyOnePhase } from '../types';

export interface ActionPadProps {
  phase: TwentyOnePhase;
  canHit: boolean;
  canStand: boolean;
  canDouble: boolean;
  canSplit: boolean;
  disabled?: boolean;
  onHit: () => void;
  onStand: () => void;
  onDouble: () => void;
  onSplit: () => void;
  onInsuranceAccept: () => void;
  onInsuranceDecline: () => void;
}

function ActionButton({
  label,
  icon,
  onClick,
  disabled,
  accent = 'zinc',
  emphasize = false,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  accent?: 'zinc' | 'amber' | 'violet' | 'emerald' | 'rose';
  emphasize?: boolean;
}) {
  const accentCls =
    accent === 'amber'
      ? 'text-amber-400'
      : accent === 'violet'
        ? 'text-violet-400'
        : accent === 'emerald'
          ? 'text-emerald-400'
          : accent === 'rose'
            ? 'text-rose-400'
            : 'text-zinc-400';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3.5 text-sm font-bold tracking-wide transition-[background-color,border-color,transform,box-shadow,opacity] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2332]
        ${
          disabled
            ? 'bg-zinc-900/80 border-zinc-800 text-zinc-600 cursor-not-allowed'
            : `bg-zinc-800/90 border-zinc-700 text-zinc-100 hover:bg-zinc-700 hover:border-zinc-600 active:scale-[0.98] cursor-pointer ${emphasize ? 'twentyone-action-ready border-zinc-500' : ''}`
        }
      `}
    >
      <span className={`transition-colors duration-200 ${disabled ? 'text-zinc-600' : accentCls}`}>
        {icon}
      </span>
      {label}
    </button>
  );
}

export function ActionPad({
  phase,
  canHit,
  canStand,
  canDouble,
  canSplit,
  disabled = false,
  onHit,
  onStand,
  onDouble,
  onSplit,
  onInsuranceAccept,
  onInsuranceDecline,
}: ActionPadProps) {
  if (phase === 'insurance') {
    return (
      <div className="grid grid-cols-2 gap-2 w-full twentyone-outcome-in">
        <ActionButton
          label="Insurance"
          icon={<Shield className="w-4 h-4" />}
          onClick={onInsuranceAccept}
          disabled={disabled}
          accent="emerald"
          emphasize
        />
        <ActionButton
          label="No Insurance"
          icon={<ShieldOff className="w-4 h-4" />}
          onClick={onInsuranceDecline}
          disabled={disabled}
          accent="rose"
        />
      </div>
    );
  }

  const actionsLocked = disabled || phase !== 'player';

  return (
    <div className="grid grid-cols-2 gap-2 w-full">
      <ActionButton
        label="Hit"
        icon={<ArrowDownToLine className="w-4 h-4" />}
        onClick={onHit}
        disabled={actionsLocked || !canHit}
        accent="amber"
        emphasize={!actionsLocked && canHit}
      />
      <ActionButton
        label="Stand"
        icon={<Hand className="w-4 h-4" />}
        onClick={onStand}
        disabled={actionsLocked || !canStand}
        accent="violet"
        emphasize={!actionsLocked && canStand}
      />
      <ActionButton
        label="Split"
        icon={<Layers className="w-4 h-4" />}
        onClick={onSplit}
        disabled={actionsLocked || !canSplit}
      />
      <ActionButton
        label="Double"
        icon={<Coins className="w-4 h-4" />}
        onClick={onDouble}
        disabled={actionsLocked || !canDouble}
        emphasize={!actionsLocked && canDouble}
      />
    </div>
  );
}
