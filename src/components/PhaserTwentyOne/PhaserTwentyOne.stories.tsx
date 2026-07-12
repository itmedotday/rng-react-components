import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { PhaserTwentyOne } from './PhaserTwentyOne';
import type { PhaserTwentyOneHandle } from './types';

/** Deterministic PRNG so shuffles are repeatable in play tests. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const meta: Meta<typeof PhaserTwentyOne> = {
  title: 'Components/PhaserTwentyOne',
  component: PhaserTwentyOne,
  parameters: {
    layout: 'centered',
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
          'Blackjack table whose felt and card dealing/flip animations render on a canvas via the Phaser game engine, driven by the same round engine as TwentyOne. The action pad, bet bar, and totals stay in the DOM for accessibility.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onDealStart: { action: 'deal started' },
    onDealComplete: { action: 'deal completed' },
    onIsDealingChange: { action: 'is dealing changed' },
    onBalanceChange: { action: 'balance changed' },
    dealRequest: { control: 'number' },
    initialBalance: { control: 'number' },
    initialBet: { control: 'number' },
    width: { control: 'number' },
    rng: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof PhaserTwentyOne>;

async function waitForTableReady(canvas: ReturnType<typeof within>) {
  await waitFor(
    () => expect(canvas.queryByText(/loading table/i)).not.toBeInTheDocument(),
    { timeout: 15_000 },
  );
  const betButton = canvas.getByRole('button', { name: /^bet$/i });
  await waitFor(() => expect(betButton).not.toBeDisabled(), { timeout: 15_000 });
  return betButton;
}

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('img', { name: 'Blackjack table' })).toBeInTheDocument();
    await waitForTableReady(canvas);
    await expect(canvas.getByTestId('phaser-twentyone-status')).toHaveTextContent(
      /place a bet/i,
    );
  },
};

export const DealsAHand: Story = {
  args: {
    rng: mulberry32(42),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const betButton = await waitForTableReady(canvas);

    await step('Placing a bet deals cards onto the Phaser table', async () => {
      await userEvent.click(betButton);
      // The deal animates card by card; wait for it to leave the dealing phase.
      await waitFor(
        () => {
          const status = canvas.getByTestId('phaser-twentyone-status').textContent ?? '';
          expect(status).not.toMatch(/place a bet|dealing/i);
        },
        { timeout: 15_000 },
      );
      await expect(canvas.getByTestId('phaser-twentyone-player-total')).toBeInTheDocument();
      await expect(canvas.getByTestId('phaser-twentyone-dealer-total')).toBeInTheDocument();
    });
  },
};

export const HighRoller: Story = {
  args: { initialBalance: 100_000, initialBet: 500, currencyLabel: 'USD' },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /^bet$/i })).toBeDisabled();
  },
};

function ExternalDealRequestDemo() {
  const [dealRequest, setDealRequest] = useState(0);
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold uppercase tracking-wide"
        onClick={() => setDealRequest((n) => n + 1)}
      >
        Deal from parent
      </button>
      <PhaserTwentyOne dealRequest={dealRequest} />
    </div>
  );
}

export const ExternalDealRequest: Story = {
  render: () => <ExternalDealRequestDemo />,
};

function ImperativeDealDemo() {
  const tableRef = useRef<PhaserTwentyOneHandle>(null);
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold uppercase tracking-wide"
        onClick={() => tableRef.current?.deal()}
      >
        Deal via ref
      </button>
      <PhaserTwentyOne ref={tableRef} />
    </div>
  );
}

export const ImperativeDeal: Story = {
  render: () => <ImperativeDealDemo />,
};
