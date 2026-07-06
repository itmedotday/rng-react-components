import type { ConsoleLayoutOptions } from '../../lib/layoutOptions';
import type { GameOutcomeBase } from '../../lib/session';
import type { Rng } from '../../lib/rng';

export interface D20RollResult extends GameOutcomeBase {
  roll: number;
  target: number;
  isCritical: boolean;
  isFumble: boolean;
}

export interface D20RollHandle {
  roll: () => void;
}

/** @deprecated Use `D20RollHandle` instead. */
export type ClickToRollD20Handle = D20RollHandle;

export interface ClickToRollD20Result {
  roll: number;
  isCritical: boolean;
  isFumble: boolean;
}

export interface D20RollProps {
  onRollStart?: () => void;
  onRollComplete?: (result: ClickToRollD20Result) => void;
  onIsRollingChange?: (isRolling: boolean) => void;
  rollRequest?: number;
  disabled?: boolean;
  className?: string;
  animationDuration?: number;
  diceSrc?: string;
  rng?: Rng;
}

/** @deprecated Use `D20RollProps` instead. */
export type ClickToRollD20Props = D20RollProps;

export interface D20RollConsoleHandle {
  roll: () => void;
}

export interface D20RollConsoleProps extends ConsoleLayoutOptions {
  onRollStart?: () => void;
  onRollComplete?: (roll: number, isWin: boolean) => void;
  onIsRollingChange?: (isRolling: boolean) => void;
  rollRequest?: number;
  initialTarget?: number;
  initialHistory?: D20RollResult[];
  disabled?: boolean;
  className?: string;
  animationDuration?: number;
  diceSrc?: string;
  rng?: Rng;
}

export function computeWinChancePct(target: number): string {
  const clamped = Math.min(20, Math.max(1, Math.round(target)));
  return (((21 - clamped) / 20) * 100).toFixed(2);
}

export function clampTarget(value: number): number {
  return Math.min(20, Math.max(1, Math.round(value)));
}
