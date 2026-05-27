# Contributing to RNG React Components

Thank you for choosing to contribute to **rng-react-components**! This library is dedicated to providing high-fidelity, premium, interactive random number generator (RNG) and gaming-inspired UI components for the modern web.

To maintain the premium standard, visual excellence, and mathematical precision of this library, we ask that all contributors follow the guidelines, directory structures, and workflows outlined in this document.

---

## 🌟 Core Philosophy

When building components for this library, keep our four pillars of quality in mind:

1. **Rich Aesthetics & Premium Design**:
   - Avoid standard generic colors and simple default browser states.
   - Use dynamic gradients, subtle micro-animations (e.g., using `@react-spring/web` or pure CSS), and glassmorphism panel backdrops.
   - Always prioritize a premium dark theme by default, ensuring harmony, vibrant glows, and elegant transitions.
2. **Mathematical Correctness**:
   - Ensure all probability distributions, targets, win rates, and ratios are calculated precisely.
   - Guard rails must be built-in to handle out-of-bounds inputs gracefully (e.g., clamping inputs to valid boundaries).
3. **Rigorous Interaction Testing**:
   - All interactive UI flows, calculations, limits, and loading states must be covered by high-fidelity tests.
   - We write interactive tests directly inside our Storybook stories using the CSF 3 `play` function, which are executed in a headless browser.
4. **Strict Type-Safety**:
   - Write cleanly typed React components using TypeScript. Avoid `any` at all costs.

---

## 🛠️ Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18 or higher recommended)
- **npm** (or your preferred package manager like `pnpm` or `yarn`)

### Local Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/itmedotday/rng-react-components.git
   cd rng-react-components
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Install Browser Binaries**:
   Our automated testing pipeline runs Vitest stories directly inside real browser instances powered by Playwright. Download the required headless browser binaries:
   ```bash
   npx playwright install chromium
   ```

4. **Launch the Storybook Dev Workspace**:
   Our primary environment for developing and refining components is Storybook:
   ```bash
   npm run storybook
   ```
   Open your browser to `http://localhost:6006` to inspect and interact with the component catalog.

---

## 📁 Component Directory Structure

All RNG components reside in `src/components/` and must adhere to a strict modular folder structure. Let's look at the structure for a component named `YourComponent`:

```
src/components/YourComponent/
├── YourComponent.tsx           # Main component file containing primary state & layout
├── YourComponent.stories.tsx   # CSF 3 Storybook stories & interactive play-tests
├── types.ts                    # Explicit TypeScript interface/type declarations
└── components/                 # Sub-components directory for smaller modular chunks
    ├── SubComponentA.tsx
    ├── SubComponentA.stories.tsx
    ├── SubComponentB.tsx
    └── SubComponentB.stories.tsx
```

### Component Guidelines
- **types.ts**: Define clean interfaces for the primary props and export them.
- **components/**: Keep the main component readable by extracting sub-components into this directory. Each sub-component can have its own stories if it contains isolated styling or complexity.
- **Aesthetics**: Rely on Tailwind CSS (v4) classes for layout and visual styling. For complex spring-based fluid physics animations, prefer `@react-spring/web`.

---

## 🧪 Testing & Code Quality Workflow

We leverage Storybook's CSF 3 `play` function coupled with **Vitest** and **Playwright** to run visual, interaction, and accessibility tests inside an actual browser environment.

### Core Testing Commands

* **Run All Tests (Headless Browser)**:
  Runs the complete test suite within a headless Chromium browser.
  ```bash
  npm run test
  ```

* **Interactive Test UI**:
  Launches Vitest's visual test dashboard, showing step-by-step browser interactions.
  ```bash
  npm run test:ui
  ```

* **Code Linting**:
  Runs ESLint to verify codebase standards:
  ```bash
  npm run lint
  ```

* **Production Code Compilation**:
  Ensures that TypeScript type-checks successfully and Vite compiles the bundle cleanly:
  ```bash
  npm run build
  ```

### Writing Interaction Tests

When writing component stories in `YourComponent.stories.tsx`, define a `play` function to automate and assert user interactions.

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within, waitFor, fireEvent } from 'storybook/test';
import { YourComponent } from './YourComponent';

const meta: Meta<typeof YourComponent> = {
  title: 'Components/YourComponent',
  component: YourComponent,
  parameters: { layout: 'centered' },
};
export default meta;

type Story = StoryObj<typeof YourComponent>;

export const InteractiveState: Story = {
  args: { /* initial props */ },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Verify initial structure and defaults', async () => {
      const button = canvas.getByRole('button', { name: 'ROLL' });
      await expect(button).toBeInTheDocument();
      await expect(button).not.toBeDisabled();
    });

    await step('Simulate roll interaction and disabled states', async () => {
      const button = canvas.getByRole('button', { name: 'ROLL' });
      await userEvent.click(button);

      // Verify immediate state change
      await expect(button).toHaveTextContent('ROLLING...');
      await expect(button).toBeDisabled();
    });
  },
};
```

---

## ✍️ Contribution & Git Standards

To ensure smooth version releases and self-documenting change logs, we use the **Conventional Commits** standard.

### Commit Message Format

Each commit message must follow this structure:
```
<type>(<scope>): <short summary>

[optional body description]
```

#### Allowed Types
- `feat`: A new feature or premium UI component.
- `fix`: A bug fix (e.g., resolving calculator rounding bugs or visual clipping).
- `docs`: Documentation edits (e.g., updating the readme or contributor guide).
- `style`: Changes that do not affect the meaning of the code (formatting, minor CSS tweaks).
- `refactor`: A code change that neither fixes a bug nor adds a feature.
- `test`: Adding missing tests or correcting existing ones.
- `chore`: Updating package dependencies, configurations, etc.

#### Examples
- `feat(DiceSlider): add dynamic animation on winning dice result`
- `fix(history): resolve ledger overflow on small screens`
- `docs(contributor): detail new headless testing commands`

### Submission Guidelines

1. **Branch Names**: Create a branch with a descriptive prefix and short slug:
   - `feature/your-component-name`
   - `bugfix/issue-description`
2. **Pre-commit Self Checks**: Before pushing, always run:
   ```bash
   npm run lint
   npm run build
   npm run test
   ```
3. **Pull Request (PR) Checklist**:
   - Provide a clear explanation of what is added/changed.
   - Include screenshots or visual recordings of new components/UI interactions.
   - Ensure the Vitest browser tests pass with 100% success.

---

## 📦 Publishing (maintainers)

This repository publishes `@itme.day/rng-react-components` to both npmjs.org and GitHub Packages using GitHub Actions.

### Prerequisites

- Add `NPM_TOKEN` as a GitHub Actions secret using an npm **Automation** access token (not a publish token that requires 2FA/OTP in CI).
- Ensure GitHub Actions has `packages: write` permissions for publishing to GitHub Packages.

### Release steps

1. Make sure `package.json` has the intended version (for example `0.1.0`).
2. Push a tag that matches the version (for example `v0.1.0`).
3. Publish a GitHub Release for that tag.

The `publish` workflow validates that the tag version matches `package.json`, then runs lint/tests/build and publishes to both registries.

If npm publish fails with a one-time password (OTP) error, replace `NPM_TOKEN` with an npm **Automation** token, then re-run the workflow manually with `registry_target` set to `npm` (GitHub Packages is already published for that version).
