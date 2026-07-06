import { describe, expect, it } from 'vitest';
import {
  buildStatsFromHistory,
  computeWinRatio,
  createOutcomeId,
  updateStats,
  EMPTY_GAME_STATS,
  type GameOutcomeBase,
} from './session';

interface TestOutcome extends GameOutcomeBase {
  label: string;
}

function outcome(isWin: boolean, label: string): TestOutcome {
  return {
    id: label,
    isWin,
    timestamp: new Date(),
    label,
  };
}

describe('buildStatsFromHistory', () => {
  it('returns empty stats for empty history', () => {
    expect(buildStatsFromHistory([])).toEqual(EMPTY_GAME_STATS);
  });

  it('computes wins, losses, and streak from chronological history', () => {
    const history = [
      outcome(true, 'a'),
      outcome(true, 'b'),
      outcome(false, 'c'),
      outcome(true, 'd'),
    ];
    expect(buildStatsFromHistory(history)).toEqual({
      totalPlays: 4,
      wins: 3,
      losses: 1,
      currentStreak: 2,
      maxStreak: 2,
    });
  });
});

describe('updateStats', () => {
  it('increments wins and streak on win', () => {
    const next = updateStats(
      { totalPlays: 2, wins: 1, losses: 1, currentStreak: 0, maxStreak: 1 },
      true,
    );
    expect(next).toEqual({
      totalPlays: 3,
      wins: 2,
      losses: 1,
      currentStreak: 1,
      maxStreak: 1,
    });
  });

  it('resets streak on loss', () => {
    const next = updateStats(
      { totalPlays: 3, wins: 2, losses: 1, currentStreak: 2, maxStreak: 2 },
      false,
    );
    expect(next).toEqual({
      totalPlays: 4,
      wins: 2,
      losses: 2,
      currentStreak: 0,
      maxStreak: 2,
    });
  });
});

describe('computeWinRatio', () => {
  it('returns 0.00 when no plays', () => {
    expect(computeWinRatio(EMPTY_GAME_STATS)).toBe('0.00');
  });

  it('formats ratio to two decimals', () => {
    expect(
      computeWinRatio({ totalPlays: 3, wins: 1, losses: 2, currentStreak: 0, maxStreak: 1 }),
    ).toBe('33.33');
  });
});

describe('createOutcomeId', () => {
  it('returns a non-empty string', () => {
    expect(createOutcomeId().length).toBeGreaterThan(0);
  });
});
