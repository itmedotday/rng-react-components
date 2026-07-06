# RNG React Components — Domain Context

## Console

A self-contained RNG game UI with optional chrome (stats header, history, rules). Full composites are exported as `*Console` components (`CoinFlipConsole`, `D20RollConsole`) or enabled via `showHeader` / `showHistory` / `showRules` props on `DiceSlider` and `RngWheel`.

## Minimal export

The default import for each game is the smallest working UI: `CoinFlip` and `D20Roll` are click-to-play primitives; `DiceSlider` and `RngWheel` render track/wheel plus controls only unless layout props opt in to chrome.

## Session

The accumulated play state for a console: stats (wins, losses, win ratio, streaks) and a capped outcome history. Managed by `useGameSession` and pure helpers in `src/lib/session.ts`. Session tracking runs only when `showHeader` or `showHistory` is enabled.

## Outcome

One recorded result of a play: `{ id, isWin, timestamp }` plus game-specific fields (e.g. `landed` for CoinFlip, `roll` for D20). Per-game types extend `GameOutcomeBase`.

## Rng

Injectable randomness adapter (`() => number` in `[0, 1)`). Consoles accept an optional `rng` prop defaulting to `Math.random` so tests can supply deterministic outcomes.

## Layout options

Shared via `ConsoleLayoutOptions` in `src/lib/layoutOptions.ts`: `showHeader`, `showHistory`, `showRules` (all default `false`). `CoinFlipConsole` also supports `showPrediction` (default `true`).
