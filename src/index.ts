export { DiceSlider } from './components/DiceSlider/DiceSlider';
export type {
  DiceSliderHandle,
  DiceSliderProps,
  RollResult,
} from './components/DiceSlider/types';
export { ControlInputs } from './components/DiceSlider/components/ControlInputs';
export type { ControlInputsProps } from './components/DiceSlider/components/ControlInputs';
export { HistoryLedger } from './components/DiceSlider/components/HistoryLedger';
export type { HistoryLedgerProps } from './components/DiceSlider/components/HistoryLedger';
export { InteractiveTrack } from './components/DiceSlider/components/InteractiveTrack';
export type { InteractiveTrackProps } from './components/DiceSlider/components/InteractiveTrack';
export { OutcomeBadge } from './components/DiceSlider/components/OutcomeBadge';
export type { OutcomeBadgeProps } from './components/DiceSlider/components/OutcomeBadge';

export { CoinFlip } from './components/CoinFlip/CoinFlip';
export { CoinFlipConsole } from './components/CoinFlip/CoinFlipConsole';
export type {
  CoinFlipHandle,
  CoinFlipProps,
  CoinFlipConsoleHandle,
  CoinFlipConsoleProps,
  CoinFlipResult,
  CoinSide,
} from './components/CoinFlip/types';
/** @deprecated Use `CoinFlip` instead. */
export { ClickToFlipCoin } from './components/CoinFlip/components/ClickToFlipCoin';
export type {
  ClickToFlipCoinHandle,
  ClickToFlipCoinProps,
} from './components/CoinFlip/types';
export { Coin3D } from './components/CoinFlip/components/Coin3D';
export type { Coin3DProps } from './components/CoinFlip/components/Coin3D';
/** @deprecated Use `StatsHeader` instead. */
export { CoinFlipHeader } from './components/CoinFlip/components/CoinFlipHeader';
export type { CoinFlipHeaderProps, CoinFlipStats } from './components/CoinFlip/components/CoinFlipHeader';
export { CoinFlipRules } from './components/CoinFlip/components/CoinFlipRules';
export { CoinHistory } from './components/CoinFlip/components/CoinHistory';
export type { CoinHistoryProps } from './components/CoinFlip/components/CoinHistory';
export { PredictionSelector } from './components/CoinFlip/components/PredictionSelector';
export type { PredictionSelectorProps } from './components/CoinFlip/components/PredictionSelector';
export { ProbabilityDashboard } from './components/CoinFlip/components/ProbabilityDashboard';
export type { ProbabilityDashboardProps } from './components/CoinFlip/components/ProbabilityDashboard';

export { RngWheel } from './components/RngWheel/RngWheel';
export type {
  RngWheelHandle,
  RngWheelProps,
  WheelSpinResult,
} from './components/RngWheel/types';
/** @deprecated Use `StatsHeader` instead. */
export { RngWheelHeader } from './components/RngWheel/components/RngWheelHeader';
export type { RngWheelHeaderProps, RngWheelStats } from './components/RngWheel/components/RngWheelHeader';
export { RngWheelRules } from './components/RngWheel/components/RngWheelRules';
export { RngWheelHistory } from './components/RngWheel/components/RngWheelHistory';
export type { RngWheelHistoryProps } from './components/RngWheel/components/RngWheelHistory';
export { WheelVisual } from './components/RngWheel/components/WheelVisual';
export type { WheelVisualProps } from './components/RngWheel/components/WheelVisual';

export { D20Roll } from './components/D20Roll/D20Roll';
export { D20RollConsole } from './components/D20Roll/D20RollConsole';
export type {
  D20RollHandle,
  D20RollProps,
  D20RollConsoleHandle,
  D20RollConsoleProps,
  D20RollResult,
  ClickToRollD20Result,
} from './components/D20Roll/types';
/** @deprecated Use `D20Roll` instead. */
export { ClickToRollD20 } from './components/D20Roll/components/ClickToRollD20';
export type {
  ClickToRollD20Handle,
  ClickToRollD20Props,
} from './components/D20Roll/types';
/** @deprecated Use `StatsHeader` instead. */
export { D20RollHeader } from './components/D20Roll/components/D20RollHeader';
export type { D20RollHeaderProps, D20RollStats } from './components/D20Roll/components/D20RollHeader';
export { D20Visual } from './components/D20Roll/components/D20Visual';
export type { D20VisualProps } from './components/D20Roll/components/D20Visual';
export { D20Die3D } from './components/D20Roll/components/D20Die3D';
export type { D20Die3DProps } from './components/D20Roll/components/D20Die3D';
export { DcControl } from './components/D20Roll/components/DcControl';
export type { DcControlProps } from './components/D20Roll/components/DcControl';
export { D20RollHistory } from './components/D20Roll/components/D20RollHistory';
export type { D20RollHistoryProps } from './components/D20Roll/components/D20RollHistory';
export { D20RollRules } from './components/D20Roll/components/D20RollRules';

export { Roulette } from './components/Roulette/Roulette';
export type {
  RouletteHandle,
  RouletteProps,
  RouletteSpinResult,
  RouletteColor,
  RouletteBet,
  RouletteSpot,
  ChipPlacement,
  SpotStack,
  SpotSettlement,
} from './components/Roulette/types';
export { RouletteWheelVisual } from './components/Roulette/components/RouletteWheelVisual';
export type { RouletteWheelVisualProps } from './components/Roulette/components/RouletteWheelVisual';
export { RouletteBettingBoard } from './components/Roulette/components/RouletteBettingBoard';
export type { RouletteBettingBoardProps } from './components/Roulette/components/RouletteBettingBoard';
export { RouletteControls } from './components/Roulette/components/RouletteControls';
export type { RouletteControlsProps } from './components/Roulette/components/RouletteControls';
export {
  DEFAULT_CHIP_VALUES,
  NUMBER_ROWS,
  RED_NUMBERS,
  WHEEL_SEQUENCE,
  formatChipAmount,
  resolveRouletteColor,
  settleStacks,
  spotHits,
  spotKey,
  spotLabel,
  spotOdds,
} from './components/Roulette/rouletteMath';

export { TwentyOne } from './components/TwentyOne/TwentyOne';
export type {
  TwentyOneHandle,
  TwentyOneProps,
  TwentyOneResult,
  TwentyOnePhase,
  HandOutcome,
  HandValue,
  Card,
  CardRank,
  CardSuit,
} from './components/TwentyOne/types';
export { PlayingCard } from './components/TwentyOne/components/PlayingCard';
export type { PlayingCardProps } from './components/TwentyOne/components/PlayingCard';
export { CardHand } from './components/TwentyOne/components/CardHand';
export type { CardHandProps } from './components/TwentyOne/components/CardHand';
export { ActionPad } from './components/TwentyOne/components/ActionPad';
export type { ActionPadProps } from './components/TwentyOne/components/ActionPad';
export { BetBar } from './components/TwentyOne/components/BetBar';
export type { BetBarProps } from './components/TwentyOne/components/BetBar';
export {
  createShoe,
  shuffleShoe,
  handValue,
  formatHandTotals,
  settleMainHand,
  settleInsurance,
  dealerShouldHit,
  playDealer,
  isPair,
  isBlackjack,
  insuranceCost,
} from './components/TwentyOne/blackjack';

export { TextFx } from './components/TextFx/TextFx';
export { TextFxConsole } from './components/TextFx/TextFxConsole';
export type {
  TextFxProps,
  TextFxConsoleProps,
  FxColorId,
  FxColorDef,
  FxEffectId,
  FxSpec,
  FxPreviewProps,
  FxCodeTagProps,
  FxChipRowProps,
} from './components/TextFx/types';
export {
  buildFxTag,
  FX_COLORS,
  FX_DEFAULT_GLOW,
  FX_EFFECTS,
  FX_EFFECT_IDS,
  SUGGESTED_FONT_STACK,
} from './components/TextFx/types';
export { FxPreview } from './components/TextFx/components/FxPreview';
export { FxCodeTag } from './components/TextFx/components/FxCodeTag';
export { FxChipRow } from './components/TextFx/components/FxChipRow';

export {
  buildStatsFromHistory,
  computeWinRatio,
  createOutcomeId,
  updateStats,
  EMPTY_GAME_STATS,
} from './lib/session';
export type { GameOutcomeBase, GameStats } from './lib/session';
export { useGameSession } from './lib/useGameSession';
export type { UseGameSessionOptions } from './lib/useGameSession';
export { useGameTrigger } from './lib/useGameTrigger';
export type { UseGameTriggerOptions } from './lib/useGameTrigger';
export { defaultRng, resolveRng } from './lib/rng';
export type { Rng } from './lib/rng';
export type { ConsoleLayoutOptions } from './lib/layoutOptions';
export { StatsHeader } from './lib/components/StatsHeader';
export type { StatsHeaderProps } from './lib/components/StatsHeader';
