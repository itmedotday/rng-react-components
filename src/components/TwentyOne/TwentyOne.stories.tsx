import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { TwentyOne } from './TwentyOne';
import type { TwentyOneHandle } from './types';

const meta: Meta<typeof TwentyOne> = {
  title: 'Components/TwentyOne',
  component: TwentyOne,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#09090b' }],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onDealStart: { action: 'deal started' },
    onDealComplete: { action: 'deal completed' },
    onIsDealingChange: { action: 'is dealing changed' },
    dealRequest: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof TwentyOne>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /^bet$/i })).toBeInTheDocument();
  },
};

export const FullConsole: Story = {
  args: {
    showHeader: true,
    showHistory: true,
    showRules: true,
  },
};

export const BetAndActions: Story = {
  args: { showHistory: true, initialBalance: 500, initialBet: 25 },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const betButton = canvas.getByRole('button', { name: /^bet$/i });

    await step('Placing a bet starts a hand', async () => {
      await userEvent.click(betButton);
      await waitFor(() => {
        expect(betButton).toBeDisabled();
      });
    });

    await step('Action pad or insurance or settle appears', async () => {
      await waitFor(() => {
        const hit = canvas.queryByRole('button', { name: /^hit$/i });
        const insurance = canvas.queryByRole('button', { name: /^insurance$/i });
        const status = canvas.queryByText(/blackjack!|you win|dealer wins|push|bust/i);
        expect(hit || insurance || status).toBeTruthy();
      });
    });
  },
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
      <TwentyOne dealRequest={dealRequest} />
    </div>
  );
}

export const ExternalDealRequest: Story = {
  render: () => <ExternalDealRequestDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const betButton = canvas.getByRole('button', { name: /^bet$/i });
    await step('Parent dealRequest triggers deal', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /deal from parent/i }));
      await waitFor(() => {
        expect(betButton).toBeDisabled();
      });
    });
  },
};

function ImperativeDealDemo() {
  const twentyOneRef = useRef<TwentyOneHandle>(null);
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold uppercase tracking-wide"
        onClick={() => twentyOneRef.current?.deal()}
      >
        Deal via ref
      </button>
      <TwentyOne ref={twentyOneRef} />
    </div>
  );
}

export const ImperativeDeal: Story = {
  render: () => <ImperativeDealDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const betButton = canvas.getByRole('button', { name: /^bet$/i });
    await step('ref.deal() triggers deal', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /deal via ref/i }));
      await waitFor(() => {
        expect(betButton).toBeDisabled();
      });
    });
  },
};
