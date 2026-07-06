## Learned User Preferences

- Prefer dual publishing to both npmjs.org and GitHub Packages (not GitHub-only).
- Prefer automated releases triggered by GitHub Release / version tags after CI passes.
- Use the npm package `@itme.day/rng-react-components` (https://www.npmjs.com/package/@itme.day/rng-react-components) as the canonical install name.
- Prefer compact, concise plans and task lists over verbose documentation.
- Prefer backward-compatible API changes (deprecated aliases, minor bump) over breaking changes for the published package.
- Export embeddable click-only primitives (`ClickToFlipCoin`, `ClickToRollD20`) from the package, not only full console composites.

## Learned Workspace Facts

- GitHub source repo is `itmedotday/rng-react-components`; npm package name is `@itme.day/rng-react-components`.
- CI runs `npm run lint`, `vitest run`, and `npm run build:lib` before publish.
- Publish workflow supports `registry_target` (`both`, `github`, `npm`) for partial retries after a failed registry publish.
- `NPM_TOKEN` must be an npm Automation or granular token with 2FA bypass for CI; tokens that require OTP fail with `EOTP`.
- Node.js `>=22` is required (see `.nvmrc`).
- Four game console components: CoinFlip, DiceSlider, RngWheel, D20Roll; publish sub-components and shared lib modules from `src/index.ts`.
- Shared session/RNG/trigger logic lives in `src/lib/` (`useGameSession`, `useGameTrigger`, `StatsHeader`, `rng`, `session`).
- RNG console UIs (CoinFlip, DiceSlider, RngWheel, D20Roll) should align header stats and lower-panel layout with RngWheel (Wins, Losses, Win Ratio, Win Streak; controls, full-width action, history below).
