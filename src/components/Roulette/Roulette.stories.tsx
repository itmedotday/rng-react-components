import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { Roulette } from './Roulette';
import type { RouletteHandle } from './types';

const meta: Meta<typeof Roulette> = {
  title: 'Components/Roulette',
  component: Roulette,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#09090b' }],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onSpinStart: { action: 'spin started' },
    onSpinComplete: { action: 'spin completed' },
    onIsSpinningChange: { action: 'is spinning changed' },
    spinRequest: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof Roulette>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /spin/i })).toBeInTheDocument();
  },
};

export const FullConsole: Story = {
  args: {
    showHeader: true,
    showHistory: true,
    showRules: true,
  },
};

export const SpinSimulation: Story = {
  args: { showHistory: true },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const spinButton = canvas.getByRole('button', { name: /spin/i });

    await step('Clicking spin triggers spin animation', async () => {
      await userEvent.click(spinButton);
      await expect(spinButton).toBeDisabled();
      await waitFor(
        async () => {
          await expect(spinButton).not.toBeDisabled();
        },
        { timeout: 2200 },
      );
    });
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /spin/i })).toBeDisabled();
  },
};

export const FastSpin: Story = {
  args: { spinDuration: 250 },
};

function ExternalSpinRequestDemo() {
  const [spinRequest, setSpinRequest] = useState(0);
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold uppercase tracking-wide"
        onClick={() => setSpinRequest((n) => n + 1)}
      >
        Spin from parent
      </button>
      <Roulette spinRequest={spinRequest} />
    </div>
  );
}

export const ExternalSpinRequest: Story = {
  render: () => <ExternalSpinRequestDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const spinButton = canvas.getByRole('button', { name: /^spin \(/i });
    await step('Parent spinRequest triggers spin', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /spin from parent/i }));
      await expect(spinButton).toBeDisabled();
      await waitFor(
        async () => {
          await expect(spinButton).not.toBeDisabled();
        },
        { timeout: 2200 },
      );
    });
  },
};

function ImperativeSpinDemo() {
  const rouletteRef = useRef<RouletteHandle>(null);
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold uppercase tracking-wide"
        onClick={() => rouletteRef.current?.spin()}
      >
        Spin via ref
      </button>
      <Roulette ref={rouletteRef} />
    </div>
  );
}

export const ImperativeSpin: Story = {
  render: () => <ImperativeSpinDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const spinButton = canvas.getByRole('button', { name: /^spin \(/i });
    await step('ref.spin() triggers spin', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /spin via ref/i }));
      await expect(spinButton).toBeDisabled();
      await waitFor(
        async () => {
          await expect(spinButton).not.toBeDisabled();
        },
        { timeout: 2200 },
      );
    });
  },
};
