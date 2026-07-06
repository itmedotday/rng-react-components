import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { CoinFlipConsole } from './CoinFlipConsole';
import type { CoinFlipConsoleHandle } from './types';

const meta: Meta<typeof CoinFlipConsole> = {
  title: 'Components/CoinFlipConsole',
  component: CoinFlipConsole,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#09090b' }],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onFlipStart: { action: 'flip started' },
    onFlipComplete: { action: 'flip completed' },
    onIsFlippingChange: { action: 'is flipping changed' },
    flipRequest: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof CoinFlipConsole>;

export const Default: Story = {
  args: {
    initialPrediction: 'orange',
    showPrediction: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /flip coin/i })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /predict orange/i })).toBeInTheDocument();
  },
};

export const FullConsole: Story = {
  args: {
    initialPrediction: 'orange',
    showHeader: true,
    showHistory: true,
    showRules: true,
    showPrediction: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('COIN FLIP CONSOLE')).toBeInTheDocument();
    await expect(canvas.getByText('Win Ratio')).toBeInTheDocument();
    await expect(canvas.getByText('0.00%')).toBeInTheDocument();
  },
};

export const InteractiveSelection: Story = {
  args: { initialPrediction: 'orange', showPrediction: true },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const predictOrangeBtn = canvas.getByRole('button', { name: /predict orange/i });
    const predictBlueBtn = canvas.getByRole('button', { name: /predict blue/i });

    await step('Clicking Blue switches prediction', async () => {
      await userEvent.click(predictBlueBtn);
      await expect(predictBlueBtn).toHaveClass('border-blue-500');
      await expect(predictOrangeBtn).not.toHaveClass('border-amber-500');
    });
  },
};

export const FlipSimulation: Story = {
  args: {
    initialPrediction: 'orange',
    showPrediction: true,
    showHistory: true,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const triggerBtn = canvas.getByRole('button', { name: /flip coin/i });

    await step('Flip logs history when showHistory is enabled', async () => {
      await userEvent.click(triggerBtn);
      await waitFor(
        async () => {
          await expect(canvas.getByRole('button', { name: /flip coin/i })).not.toBeDisabled();
        },
        { timeout: 2000 },
      );
      await expect(canvas.getByText(/last 1 flips/i)).toBeInTheDocument();
    });
  },
};

export const FastAnimation: Story = {
  args: {
    initialPrediction: 'orange',
    showPrediction: true,
    animationDuration: 200,
  },
};

export const DeterministicWin: Story = {
  args: {
    initialPrediction: 'orange',
    animationDuration: 200,
    rng: () => 0,
    showHeader: true,
    showHistory: true,
    showPrediction: true,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('Deterministic rng produces a logged win', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /flip coin/i }));
      await waitFor(
        async () => {
          await expect(canvas.getByText('100.00%')).toBeInTheDocument();
        },
        { timeout: 2000 },
      );
      await expect(canvas.getByText(/last 1 flips/i)).toBeInTheDocument();
    });
  },
};

function ExternalFlipRequestDemo() {
  const [flipRequest, setFlipRequest] = useState(0);
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
      <button
        type="button"
        className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold uppercase tracking-wide"
        onClick={() => setFlipRequest((n) => n + 1)}
      >
        Flip from parent
      </button>
      <CoinFlipConsole flipRequest={flipRequest} showPrediction />
    </div>
  );
}

export const ExternalFlipRequest: Story = {
  render: () => <ExternalFlipRequestDemo />,
};

function ImperativeFlipDemo() {
  const coinRef = useRef<CoinFlipConsoleHandle>(null);
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
      <button
        type="button"
        className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold uppercase tracking-wide"
        onClick={() => coinRef.current?.flip()}
      >
        Flip via ref
      </button>
      <CoinFlipConsole ref={coinRef} showPrediction />
    </div>
  );
}

export const ImperativeFlip: Story = {
  render: () => <ImperativeFlipDemo />,
};
