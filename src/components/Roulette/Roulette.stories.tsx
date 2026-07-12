import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { Roulette } from './Roulette';
import type { RouletteHandle } from './types';

const meta: Meta<typeof Roulette> = {
  title: 'Components/Roulette',
  component: Roulette,
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'stake',
      values: [
        { name: 'stake', value: '#0f212e' },
        { name: 'dark', value: '#09090b' },
      ],
    },
    docs: {
      description: {
        component:
          'Stake-style European roulette: pick chip denominations, stack chips on multiple cloth spots, then Play. The ball is always visible on the wheel; layout stacks on mobile.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onSpinStart: { action: 'spin started' },
    onSpinComplete: { action: 'spin completed' },
    onIsSpinningChange: { action: 'is spinning changed' },
    spinRequest: { control: 'number' },
    initialChipValue: { control: 'number' },
    spinDuration: { control: 'number' },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-5xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Roulette>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /^play$/i })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /^play$/i })).toBeDisabled();
  },
};

export const FullConsole: Story = {
  args: {
    showHeader: true,
    showHistory: true,
    showRules: true,
  },
};

export const WithInitialBet: Story = {
  args: {
    initialBet: { type: 'color', color: 'red' },
    initialChipValue: 25,
    showHistory: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /^play$/i })).not.toBeDisabled();
  },
};

export const MultiChipSpin: Story = {
  args: { showHistory: true },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const playButton = canvas.getByRole('button', { name: /^play$/i });

    await step('Select a larger chip, then place on multiple spots', async () => {
      await userEvent.click(canvas.getByRole('option', { name: '100' }));
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
          await expect(playButton).toHaveTextContent(/^play$/i);
        },
        { timeout: 4000 },
      );
    });
  },
};

export const UndoAndClear: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Place chips', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Bet number 7' }));
      await userEvent.click(canvas.getByRole('button', { name: 'Bet black' }));
      await expect(canvas.getByRole('button', { name: 'Undo last chip' })).not.toBeDisabled();
    });

    await step('Undo last placement', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Undo last chip' }));
      await expect(canvas.getByRole('button', { name: /^play$/i })).not.toBeDisabled();
    });

    await step('Clear the table', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Clear all chips' }));
      await expect(canvas.getByRole('button', { name: /^play$/i })).toBeDisabled();
    });
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    initialBet: { type: 'number', number: 1 },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /^play$/i })).toBeDisabled();
  },
};

export const FastSpin: Story = {
  args: {
    spinDuration: 250,
    initialBet: { type: 'color', color: 'black' },
  },
};

export const CustomChipStrip: Story = {
  args: {
    chipValues: [1, 10, 100, 1000, 10_000],
    initialChipValue: 100,
    showRules: true,
  },
};

export const MobileWidth: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    layout: 'fullscreen',
  },
  args: {
    showHistory: true,
    showRules: true,
    initialBet: { type: 'color', color: 'red' },
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
        { timeout: 4000 },
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
        { timeout: 4000 },
      );
    });
  },
};
