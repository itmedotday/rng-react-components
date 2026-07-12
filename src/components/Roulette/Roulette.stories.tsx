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
      default: 'stake',
      values: [
        { name: 'stake', value: '#0f212e' },
        { name: 'dark', value: '#09090b' },
      ],
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
    await expect(canvas.getByRole('button', { name: /^play$/i })).toBeInTheDocument();
  },
};

export const FullConsole: Story = {
  args: {
    showHeader: true,
    showHistory: true,
    showRules: true,
  },
};

export const MultiChipSpin: Story = {
  args: { showHistory: true },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const playButton = canvas.getByRole('button', { name: /^play$/i });

    await step('Place chips on multiple spots', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Bet number 17' }));
      await userEvent.click(canvas.getByRole('button', { name: 'Bet red' }));
      await userEvent.click(canvas.getByRole('button', { name: 'Bet Even' }));
      await expect(playButton).not.toBeDisabled();
    });

    await step('Play spins the wheel', async () => {
      await userEvent.click(playButton);
      await expect(playButton).toBeDisabled();
      await waitFor(
        async () => {
          // Table clears after settle, so Play stays disabled — assert spin finished.
          await expect(playButton).toHaveTextContent(/^play$/i);
        },
        { timeout: 2800 },
      );
    });
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /^play$/i })).toBeDisabled();
  },
};

export const FastSpin: Story = {
  args: { spinDuration: 250 },
};

export const MobileWidth: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  args: {
    showHistory: true,
  },
};

function ExternalSpinRequestDemo() {
  const [spinRequest, setSpinRequest] = useState(0);
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-5xl">
      <button
        type="button"
        className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold uppercase tracking-wide"
        onClick={() => setSpinRequest((n) => n + 1)}
      >
        Spin from parent
      </button>
      <Roulette spinRequest={spinRequest} initialBet={{ type: 'color', color: 'red' }} />
    </div>
  );
}

export const ExternalSpinRequest: Story = {
  render: () => <ExternalSpinRequestDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const playButton = canvas.getByRole('button', { name: /^play$/i });
    await step('Parent spinRequest triggers spin', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /spin from parent/i }));
      await expect(playButton).toBeDisabled();
      await waitFor(
        async () => {
          await expect(playButton).toHaveTextContent(/^play$/i);
        },
        { timeout: 2800 },
      );
    });
  },
};

function ImperativeSpinDemo() {
  const rouletteRef = useRef<RouletteHandle>(null);
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-5xl">
      <button
        type="button"
        className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold uppercase tracking-wide"
        onClick={() => rouletteRef.current?.spin()}
      >
        Spin via ref
      </button>
      <Roulette ref={rouletteRef} initialBet={{ type: 'number', number: 7 }} />
    </div>
  );
}

export const ImperativeSpin: Story = {
  render: () => <ImperativeSpinDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const playButton = canvas.getByRole('button', { name: /^play$/i });
    await step('ref.spin() triggers spin', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /spin via ref/i }));
      await expect(playButton).toBeDisabled();
      await waitFor(
        async () => {
          await expect(playButton).toHaveTextContent(/^play$/i);
        },
        { timeout: 2800 },
      );
    });
  },
};
