# Agent Developer Guide (AGENT.md)

Welcome, future AI Coding Agent! This document acts as your onboarding manual, architectural blueprint, and quality-standard checklist for contributing to **rng-react-components**. 

Our library specializes in premium, high-fidelity, visually stunning random number generator (RNG) and gaming-inspired UI components in React and TypeScript. To maintain visual excellence, mathematical precision, and stable builds, you must strictly follow the specifications below.

---

## 🛠️ Tech Stack & Architecture

- **Core**: React 19, TypeScript, and Vite.
- **Styling**: Tailwind CSS (v4). Standalone styling is packaged using pre-compiled CSS (`dist/style.css`), meaning Tailwind is **optional** in the consumer's host application.
- **Animations**: Physics-based springs powered by `@react-spring/web` for fluid 3D card tilts, coin flips, and slider thumb dragging.
- **Sandbox**: Storybook (v10) for modular, isolated component development.
- **Testing**: Vitest with `@storybook/addon-vitest` and Playwright for visual and interaction testing inside headless Chromium.

---

## 📁 Repository Conventions & Structure

All UI components reside in `src/components/` and are isolated in modular directories:

```
src/components/[ComponentName]/
├── [ComponentName].tsx           # Master console orchestrating states and outcomes
├── [ComponentName].stories.tsx   # CSF 3 stories and Playwright-powered play-tests
├── types.ts                    # Explicit interface and model declarations
└── components/                 # Isolated modular subcomponents
    ├── SubComponentA.tsx
    └── SubComponentB.tsx
```

### Dashboard Core (`src/App.tsx`)
- The main entry contains a central stats state (Plays, Win Ratio %, Current and Max Streaks).
- We support tab navigation to switch between flagship games. **Ensure that any new console you add integrates with the global game outcome callback `handleGameOutcome(isWin: boolean)` to keep stats synchronized.**

---

## 🎨 Premium Visual Style Guide

If your component designs look flat, generic, or default, **you have failed the aesthetic standards.** Every component must adhere to these rich styling principles:
1. **Dark Theme by Default**: Use harmony-rich deep dark backdrops (`#09090b` / Slate-950) with high contrast.
2. **Glassmorphism Panels**: Apply borders with low-opacity colors (`border-zinc-800/80` or `border-white/10`) coupled with subtle backdrops (`bg-zinc-950/40` or `glass-panel`).
3. **Neon Glows**: Implement pulsating glows using custom shadow values (`shadow-indigo-500/20` or `shadow-amber-500/30`) that glow brighter during win conditions.
4. **3D Perspective Trajectories**: For cards, dice, or coin flips, construct real 3D depth by translating face components along the Z-axis (e.g. `translateZ(4px)`) and using layered borders for edges.
5. **Metallic Reflections**: Implement sweeping reflection overlays using linear gradients that shift rapidly across assets during roll or spin sequences.

---

## 🧪 Storybook Interaction Testing (CSF 3)

We do not write standard `.test.tsx` files. Instead, **our Storybook stories serve as our browser test suite.** Each story includes an automated `play` function containing Playwright-based browser assertions.

### Standard Import & Type Rules
To prevent lint errors and compiler failures, always import types from the Storybook framework packages rather than the renderer libraries:

* ❌ **Do NOT use**:
  ```typescript
  import type { Meta, StoryObj } from '@storybook/react'; // Fails storybook/no-renderer-packages
  ```
*  **Do use**:
  ```typescript
  import type { Meta, StoryObj } from '@storybook/react-vite'; // SUCCESS!
  ```

### Authoring Interactive Play-Tests
Leverage `@storybook/test` modules to simulate user behavior:
```typescript
import { expect, userEvent, within, waitFor } from 'storybook/test';

export const Simulation: Story = {
  args: { ... },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /flip coin/i });

    await step('Trigger action and verify locked state', async () => {
      await userEvent.click(trigger);
      await expect(trigger).toBeDisabled();
    });

    await step('Wait for physics timers to resolve and verify log', async () => {
      await waitFor(async () => {
        await expect(trigger).not.toBeDisabled();
      }, { timeout: 2000 });
      await expect(canvas.getByText(/last flip/i)).toBeInTheDocument();
    });
  }
};
```

---

## 🛠️ Quality Assurance Checklist

Before ending your turn or pushing your changes, you must run and pass the following quality commands:

### 1. Code Linting (`npm run lint`)
- **Flat ESLint Rules**: Our flat ESLint configurations flag unused variables, explicit `any` declarations, and direct Storybook renderer imports.
- **Synchronized State Effects**: If you update secondary text representations inside state-effect loops, you must disable the linter warning using:
  ```typescript
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setRawTarget(val);
  ```

### 2. Bundler & Compiler Verification (`npm run build`)
- Runs `tsc -b` and `vite build`. Ensures complete type-safety across TypeScript boundaries and validates module packaging.

### 3. Automated Browser Play-Tests (`npm run test`)
- Executes Vitest inside Playwright instances to run all story play-tests in headless Chromium.

---

## ✍️ Version Control Standards

We enforce **Conventional Commits** for clean changelogs:
- `feat(component)`: Introducing a premium component (e.g. `feat(CoinFlip): add custom 3D flipping`).
- `fix(scope)`: Bug fixes (e.g. `fix(linter): resolve storybook renderer imports`).
- `docs(scope)`: Documentation corrections.
- `style(scope)`: Layout/CSS updates.
- `test(scope)`: Writing play-tests or expanding coverage.
