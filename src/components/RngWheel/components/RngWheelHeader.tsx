import { Activity } from 'lucide-react';
import { StatsHeader } from '../../../lib/components/StatsHeader';
import type { GameStats } from '../../../lib/session';

/** @deprecated Use `GameStats` from the package root instead. */
export type RngWheelStats = GameStats;

export interface RngWheelHeaderProps {
  stats: RngWheelStats;
}

/** @deprecated Use `StatsHeader` from the package root instead. */
export function RngWheelHeader({ stats }: RngWheelHeaderProps) {
  return (
    <StatsHeader
      title="RNG WHEEL CONSOLE"
      icon={<Activity className="w-5 h-5 text-rose-500 animate-pulse" />}
      stats={stats}
    />
  );
}
