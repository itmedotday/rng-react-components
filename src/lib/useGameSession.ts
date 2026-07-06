import { useCallback, useState } from 'react';
import {
  buildStatsFromHistory,
  updateStats,
  type GameOutcomeBase,
  type GameStats,
} from './session';

export interface UseGameSessionOptions<T extends GameOutcomeBase> {
  initialHistory?: T[];
  historyLimit?: number;
}

export function useGameSession<T extends GameOutcomeBase>({
  initialHistory = [],
  historyLimit = 15,
}: UseGameSessionOptions<T> = {}) {
  const [history, setHistory] = useState<T[]>(initialHistory);
  const [stats, setStats] = useState<GameStats>(() =>
    buildStatsFromHistory(initialHistory),
  );

  const recordOutcome = useCallback(
    (outcome: T) => {
      setHistory((prev) => [outcome, ...prev].slice(0, historyLimit));
      setStats((prev) => updateStats(prev, outcome.isWin));
    },
    [historyLimit],
  );

  return { stats, history, recordOutcome };
}
