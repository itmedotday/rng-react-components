import { Dices } from 'lucide-react';
import { StatsHeader } from '../../../lib/components/StatsHeader';
import type { GameStats } from '../../../lib/session';

/** @deprecated Use `GameStats` from the package root instead. */
export type D20RollStats = GameStats;

export interface D20RollHeaderProps {
  stats: D20RollStats;
}

/** @deprecated Use `StatsHeader` from the package root instead. */
export function D20RollHeader({ stats }: D20RollHeaderProps) {
  return (
    <StatsHeader
      title="D20 ROLL CONSOLE"
      icon={<Dices className="w-5 h-5 text-violet-400 animate-pulse" />}
      stats={stats}
    />
  );
}
