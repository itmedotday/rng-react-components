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

### 🪙 CoinFlip

A sleek 3D coin flip simulator featuring a dynamic spinning model, history ledger, and predictive selection. It utilizes smooth physics for the spinning animation and tracks user stats like win streaks.

<div align="center">
  <img src="./public/Screenshot%202026-05-26%20011230.png" alt="Coin Flip Console Screenshot" width="600" />
</div>


#### Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `onFlipStart` | `() => void` | | Optional callback when the flip animation begins. |
| `onFlipComplete` | `(landed: CoinSide, isWin: boolean) => void` | | Optional callback triggered when the coin lands. |
| `onIsFlippingChange` | `(isFlipping: boolean) => void` | | Optional callback when the flip phase changes (`true` at start, `false` when settled). |
| `flipRequest` | `number` | | Increment from the parent to trigger a flip (e.g. `setN((n) => n + 1)`). |
| `initialPrediction` | `'orange' \| 'blue'` | `'orange'` | Starting predicted side for the coin. |
| `disabled` | `boolean` | `false` | Whether the component and its controls are disabled. |
| `className` | `string` | `''` | Optional CSS class name for the root element. |
| `animationDuration` | `number` | `950` | Duration of the flip animation in milliseconds. |

`CoinFlip` also accepts a **ref** with type `CoinFlipHandle` (`{ flip(): void }`) to start a flip imperatively. External triggers respect the same guards as the built-in button (`disabled`, already flipping).

#### External flip control

**Declarative** — bump `flipRequest` when the parent should start a flip:

```tsx
import { useState } from 'react';
import { CoinFlip } from '@itme.day/rng-react-components';

function App() {
  const [flipRequest, setFlipRequest] = useState(0);

  return (
    <>
      <button type="button" onClick={() => setFlipRequest((n) => n + 1)}>
        Flip
      </button>
      <CoinFlip
        flipRequest={flipRequest}
        onIsFlippingChange={(flipping) => {
          /* sync parent UI */
        }}
      />
    </>
  );
}
```

**Imperative** — call `flip()` on the ref:

```tsx
import { useRef } from 'react';
import { CoinFlip, type CoinFlipHandle } from '@itme.day/rng-react-components';

function App() {
  const coinRef = useRef<CoinFlipHandle>(null);

  return (
    <>
      <button type="button" onClick={() => coinRef.current?.flip()}>
        Flip
      </button>
      <CoinFlip ref={coinRef} />
    </>
  );
}
```


### 🎲 Dice Slider

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
