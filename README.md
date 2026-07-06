<div align="center">
  <h1>🎲</h1>
  <h1>RNG React Components</h1>
  <p>A state-of-the-art suite of high-fidelity, visually stunning random number generator (RNG) and gaming-inspired UI components for React and TypeScript.</p>
  <p>
    <a href="https://www.npmjs.com/package/@itme.day/rng-react-components"><img src="https://img.shields.io/npm/v/@itme.day/rng-react-components" alt="NPM Version" /></a>
  </p>
</div>

---

## ✨ Features

- **Premium Gaming Aesthetics**: Sleek glassmorphism panels, glowing neon tracks, custom gradients, and modern typography tailored for high-end web applications.
- **Precision Mathematical Synchronization**: Instantly syncs and maps target inputs, multiplier rates, chance percentages, and slider thumb states in real-time.
- **Fluid Micro-Animations**: Powered by physics-based springs that provide visual confirmation for win/loss conditions, active roll sequences, and interactive dragging.
- **Fully Responsive & Accessible**: Optimized for touch inputs on mobile viewports and structured to maintain semantic accessibility standards.

---

## 🚀 Installation

Published on npm as [`@itme.day/rng-react-components`](https://www.npmjs.com/package/@itme.day/rng-react-components).

```bash
npm install @itme.day/rng-react-components
```

### 🎨 Importing Styles

To ensure they render with premium visual glows, **import the pre-compiled CSS bundle** at the root of your application (typically in `main.tsx` or `App.tsx`):

```tsx
import '@itme.day/rng-react-components/style.css';
```

---

## 🧩 Components Included

### 🪙 CoinFlip (minimal)

Click-to-flip 3D coin — the default export. No glass panel, stats, or history.

```tsx
import { CoinFlip } from '@itme.day/rng-react-components';

<CoinFlip onFlipComplete={(landed) => console.log(landed)} />
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `onFlipStart` | `() => void` | | Callback when the flip animation begins. |
| `onFlipComplete` | `(landed: CoinSide) => void` | | Callback when the coin lands. |
| `onIsFlippingChange` | `(isFlipping: boolean) => void` | | Flip phase changes. |
| `flipRequest` | `number` | | Increment to trigger a flip from the parent. |
| `disabled` | `boolean` | `false` | Disable interaction. |
| `animationDuration` | `number` | `950` | Flip duration in ms. |
| `rng` | `Rng` | `Math.random` | Injectable random source. |

### 🪙 CoinFlipConsole

Full composite with optional chrome. Enable header, history, rules, and prediction via props (all default `false` except `showPrediction` which defaults `true`).

```tsx
import { CoinFlipConsole } from '@itme.day/rng-react-components';

<CoinFlipConsole
  showHeader
  showHistory
  showRules
  showPrediction
  onFlipComplete={(landed, isWin) => console.log(landed, isWin)}
/>
```

`ClickToFlipCoin` is deprecated — use `CoinFlip`.

A highly interactive, physics-based probability slider replicating high-stakes dice gaming tracks with real-time target adjustments, over/under toggles, and snappy win/loss outcome badges.

<div align="center">
  <img src="./public/Screenshot%202026-05-26%20011141.png" alt="Dice Slider Console Screenshot" width="600" />
</div>


#### Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `onRollStart` | `() => void` | | Optional callback when the roll animation begins. |
| `onRollComplete` | `(outcome: number, isWin: boolean) => void` | | Optional callback triggered when the roll is finished. |
| `initialHistory` | `RollResult[]` | `[]` | Initial roll history to calculate starting statistics. |
| `initialTarget` | `number` | `50.00` | Starting roll target threshold. |
| `initialIsRollOver` | `boolean` | `true` | Controls whether the game logic defaults to "Roll Over" mode. |
| `disabled` | `boolean` | `false` | Whether the slider and input controls are disabled. |
| `className` | `string` | `''` | Optional CSS class name for the root element. |
| `minTarget` | `number` | `0.01` | Minimum allowed target value. |
| `maxTarget` | `number` | `99.99` | Maximum allowed target value. |
| `showHeader` | `boolean` | `false` | Show session stats header. |
| `showHistory` | `boolean` | `false` | Show roll history panel. |


### 🎡 RngWheel

A suspenseful spinning wheel component showcasing a wiggly pointer, real-time cycling multiplier center badge, and precise customizable win chance percentages.

<div align="center">
  <img src="./public/Screenshot%202026-05-26%20011311.png" alt="RNG Wheel Screenshot" width="600" />
</div>

#### Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `onSpinStart` | `() => void` | | Optional callback when the spin animation begins. |
| `onSpinComplete` | `(isWin: boolean) => void` | | Optional callback triggered when the spin settles. |
| `initialHistory` | `WheelSpinResult[]` | `[]` | Initial spin history to calculate starting statistics. |
| `disabled` | `boolean` | `false` | Whether the spin button and controls are disabled. |
| `className` | `string` | `''` | Optional CSS class name for the root element. |
| `spinDuration` | `number` | `1500` | Spin animation duration in milliseconds. |
| `initialWinChance` | `number` | `10.00` | Initial win chance percentage. |

---

## Storybook

Browse interactive component stories on [GitHub Pages](https://itmedotday.github.io/rng-react-components/) (deployed from `main` on each push).

```bash
npm run storybook          # dev server at http://localhost:6006
npm run build-storybook    # static output in storybook-static/
```

For a local build that matches the hosted subpath:

```bash
STORYBOOK_BASE_PATH=/rng-react-components/ npm run build-storybook
```

---

## 🤝 Contributing

We welcome open-source contributions to expand the suite of gaming/RNG components! Please check out the [Contributor Guide](./contributor.md) to learn how to set up local dependencies and run interactive tests.

## 📄 License

MIT &copy; 2026 Daylen Nguyen
