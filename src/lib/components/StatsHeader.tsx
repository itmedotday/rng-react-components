import type { ReactNode } from 'react';
import { Trophy, XCircle, Percent, Flame } from 'lucide-react';
import { computeWinRatio, type GameStats } from '../session';

export interface StatsHeaderProps {
  title: string;
  icon: ReactNode;
  stats: GameStats;
}

export function StatsHeader({ title, icon, stats }: StatsHeaderProps) {
  const winRatio = computeWinRatio(stats);

  return (
    <div className="w-full flex items-center justify-between mb-8 border-b border-zinc-800/60 pb-5">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-bold tracking-wide text-zinc-300">{title}</h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-emerald-400" />
            Wins
          </span>
          <div className="text-lg font-black font-mono text-emerald-400 tracking-tight leading-none">
            {stats.wins}
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            Losses
          </span>
          <div className="text-lg font-black font-mono text-rose-400 tracking-tight leading-none">
            {stats.losses}
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-emerald-400" />
            Win Ratio
          </span>
          <div className="text-lg font-black font-mono text-emerald-400 tracking-tight leading-none">
            {winRatio}%
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            Win Streak
          </span>
          <div className="text-lg font-black font-mono text-zinc-300 tracking-tight leading-none">
            {stats.currentStreak}
          </div>
        </div>
      </div>
    </div>
  );
}
