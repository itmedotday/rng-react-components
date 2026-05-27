import React from 'react';
import { Activity, Trophy, XCircle, Percent, Flame } from 'lucide-react';

export interface RngWheelStats {
  totalPlays: number;
  wins: number;
  losses: number;
  currentStreak: number;
  maxStreak: number;
}

export interface RngWheelHeaderProps {
  stats: RngWheelStats;
}

export const RngWheelHeader: React.FC<RngWheelHeaderProps> = ({ stats }) => {
  const winRatio = stats.totalPlays === 0 ? '0.00' : ((stats.wins / stats.totalPlays) * 100).toFixed(2);

  return (
    <div className="w-full flex items-center justify-between mb-8 border-b border-zinc-800/60 pb-5">

      {/* Title (Left) */}
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-rose-500 animate-pulse" />
        <h2 className="text-lg font-bold tracking-wide text-zinc-300">RNG WHEEL CONSOLE</h2>
      </div>

      {/* Session Stats (Right) */}
      <div className="flex items-center gap-6">
        {/* Wins */}
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-emerald-400" />
            Wins
          </span>
          <div className="text-lg font-black font-mono text-emerald-400 tracking-tight leading-none">
            {stats.wins}
          </div>
        </div>

        {/* Losses */}
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            Losses
          </span>
          <div className="text-lg font-black font-mono text-rose-400 tracking-tight leading-none">
            {stats.losses}
          </div>
        </div>

        {/* Win Ratio */}
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-emerald-400" />
            Win Ratio
          </span>
          <div className="text-lg font-black font-mono text-emerald-400 tracking-tight leading-none">
            {winRatio}%
          </div>
        </div>

        {/* Win Streak */}
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
};
