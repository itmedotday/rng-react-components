export interface D20RollResult {
  id: string;
  roll: number;
  target: number;
  isWin: boolean;
  isCritical: boolean;
  isFumble: boolean;
  timestamp: Date;
}

export interface D20RollHandle {
  roll: () => void;
}

export interface ClickToRollD20Handle {
  roll: () => void;
}

export interface ClickToRollD20Result {
  roll: number;
  isCritical: boolean;
  isFumble: boolean;
}

export interface ClickToRollD20Props {
  onRollStart?: () => void;
  onRollComplete?: (result: ClickToRollD20Result) => void;
  onIsRollingChange?: (isRolling: boolean) => void;
  rollRequest?: number;
  disabled?: boolean;
  className?: string;
  animationDuration?: number;
  diceSrc?: string;
}

export interface D20RollProps {
  onRollStart?: () => void;
  onRollComplete?: (roll: number, isWin: boolean) => void;
  onIsRollingChange?: (isRolling: boolean) => void;
  rollRequest?: number;
  initialTarget?: number;
  initialHistory?: D20RollResult[];
  disabled?: boolean;
  className?: string;
  animationDuration?: number;
  /** Override die image URL; defaults to bundled src/assets/d20.svg */
  diceSrc?: string;
}

export function computeWinChancePct(target: number): string {
  const clamped = Math.min(20, Math.max(1, Math.round(target)));
  return (((21 - clamped) / 20) * 100).toFixed(2);
}

export function clampTarget(value: number): number {
  return Math.min(20, Math.max(1, Math.round(value)));
}
