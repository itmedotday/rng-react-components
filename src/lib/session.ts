export interface GameStats {
  totalPlays: number;
  wins: number;
  losses: number;
  currentStreak: number;
  maxStreak: number;
}

export interface GameOutcomeBase {
  id: string;
  isWin: boolean;
  timestamp: Date;
}

export const EMPTY_GAME_STATS: GameStats = {
  totalPlays: 0,
  wins: 0,
  losses: 0,
  currentStreak: 0,
  maxStreak: 0,
};

export function buildStatsFromHistory<T extends GameOutcomeBase>(
  history: readonly T[],
): GameStats {
  let wins = 0;
  let losses = 0;
  let currentStreak = 0;
  let maxStreak = 0;
  const reversed = [...history].reverse();
  for (const entry of reversed) {
    if (entry.isWin) {
      wins++;
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      losses++;
      currentStreak = 0;
    }
  }
  return {
    totalPlays: history.length,
    wins,
    losses,
    currentStreak,
    maxStreak,
  };
}

export function updateStats(prev: GameStats, isWin: boolean): GameStats {
  const currentStreak = isWin ? prev.currentStreak + 1 : 0;
  return {
    totalPlays: prev.totalPlays + 1,
    wins: isWin ? prev.wins + 1 : prev.wins,
    losses: isWin ? prev.losses : prev.losses + 1,
    currentStreak,
    maxStreak: Math.max(prev.maxStreak, currentStreak),
  };
}

export function createOutcomeId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function computeWinRatio(stats: GameStats): string {
  return stats.totalPlays === 0
    ? '0.00'
    : ((stats.wins / stats.totalPlays) * 100).toFixed(2);
}
