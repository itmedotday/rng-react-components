import { Coins } from 'lucide-react';
import { StatsHeader } from '../../../lib/components/StatsHeader';
import type { GameStats } from '../../../lib/session';

/** @deprecated Use `GameStats` from the package root instead. */
export type CoinFlipStats = GameStats;

export interface CoinFlipHeaderProps {
  stats: CoinFlipStats;
}

/** @deprecated Use `StatsHeader` from the package root instead. */
export function CoinFlipHeader({ stats }: CoinFlipHeaderProps) {
  return (
    <StatsHeader
      title="COIN FLIP CONSOLE"
      icon={<Coins className="w-5 h-5 text-indigo-400 animate-pulse" />}
      stats={stats}
    />
  );
}
