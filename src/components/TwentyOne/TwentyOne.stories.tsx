import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within, waitFor } from 'storybook/test';
import { TwentyOne } from './TwentyOne';
import type { TwentyOneHandle } from './types';
import { ActionPad } from './components/ActionPad';
import { BetBar } from './components/BetBar';
import { CardHand } from './components/CardHand';

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
    onBalanceChange: { action: 'balance changed' },
    dealRequest: { control: 'number' },
    initialBalance: { control: 'number' },
    initialBet: { control: 'number' },
    currencyLabel: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof TwentyOne>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /^bet$/i })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /^hit$/i })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: /^stand$/i })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: /^double$/i })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: /^split$/i })).toBeDisabled();
  },
};

export const FullConsole: Story = {
  args: {
    showHeader: true,
    showHistory: true,
    showRules: true,
    initialBalance: 1000,
    initialBet: 10,
  },
};

export const CustomBankroll: Story = {
  args: {
    showHeader: true,
    initialBalance: 250,
    initialBet: 25,
    currencyLabel: 'GG',
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

    await step('Action pad, insurance, or settle appears', async () => {
      await waitFor(
        () => {
          const hit = canvas.queryByRole('button', { name: /^hit$/i });
          const insurance = canvas.queryByRole('button', { name: /^insurance$/i });
          const status = canvas.queryByText(/blackjack!|you win|dealer wins|push|bust/i);
          const hitEnabled = hit && !hit.hasAttribute('disabled');
          expect(hitEnabled || insurance || status).toBeTruthy();
        },
        { timeout: 4000 },
      );
    });
  },
};

export const HitThenStand: Story = {
  args: { initialBalance: 500, initialBet: 10 },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Bet to start the round', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /^bet$/i }));
    });

    await step('Decline insurance if offered', async () => {
      await waitFor(
        () => {
          const hit = canvas.queryByRole('button', { name: /^hit$/i });
          const noIns = canvas.queryByRole('button', { name: /^no insurance$/i });
          const status = canvas.queryByText(/blackjack!|you win|dealer wins|push|bust/i);
          expect(hit || noIns || status).toBeTruthy();
        },
        { timeout: 4000 },
      );
      const noIns = canvas.queryByRole('button', { name: /^no insurance$/i });
      if (noIns) await userEvent.click(noIns);
    });

    await step('Hit once when available, then stand', async () => {
      await waitFor(
        () => {
          const hit = canvas.queryByRole('button', { name: /^hit$/i });
          const status = canvas.queryByText(/blackjack!|you win|dealer wins|push|bust/i);
          expect(hit || status).toBeTruthy();
        },
        { timeout: 4000 },
      );

      const hit = canvas.queryByRole('button', { name: /^hit$/i });
      if (hit && !hit.hasAttribute('disabled')) {
        await userEvent.click(hit);
      }

      const stand = canvas.queryByRole('button', { name: /^stand$/i });
      if (stand && !stand.hasAttribute('disabled')) {
        await userEvent.click(stand);
      }

      await waitFor(
        () => {
          expect(canvas.getByRole('button', { name: /^bet$/i })).not.toBeDisabled();
        },
        { timeout: 6000 },
      );
    });
  },
};

export const DoubleWhenAvailable: Story = {
  args: { initialBalance: 500, initialBet: 10 },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Bet to start', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /^bet$/i }));
    });

    await step('Clear insurance gate if present', async () => {
      await waitFor(
        () => {
          const double = canvas.queryByRole('button', { name: /^double$/i });
          const noIns = canvas.queryByRole('button', { name: /^no insurance$/i });
          const status = canvas.queryByText(/blackjack!|you win|dealer wins|push|bust/i);
          expect(double || noIns || status).toBeTruthy();
        },
        { timeout: 4000 },
      );
      const noIns = canvas.queryByRole('button', { name: /^no insurance$/i });
      if (noIns) await userEvent.click(noIns);
    });

    await step('Double when enabled, otherwise stand', async () => {
      await waitFor(
        () => {
          const double = canvas.queryByRole('button', { name: /^double$/i });
          const stand = canvas.queryByRole('button', { name: /^stand$/i });
          const status = canvas.queryByText(/blackjack!|you win|dealer wins|push|bust/i);
          expect(double || stand || status).toBeTruthy();
        },
        { timeout: 4000 },
      );

      const double = canvas.queryByRole('button', { name: /^double$/i });
      if (double && !double.hasAttribute('disabled')) {
        await userEvent.click(double);
      } else {
        const stand = canvas.queryByRole('button', { name: /^stand$/i });
        if (stand && !stand.hasAttribute('disabled')) {
          await userEvent.click(stand);
        }
      }

      await waitFor(
        () => {
          expect(canvas.getByRole('button', { name: /^bet$/i })).not.toBeDisabled();
        },
        { timeout: 6000 },
      );
    });
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /^bet$/i })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: /^hit$/i })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: /^stand$/i })).toBeDisabled();
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

/** Deterministic action-pad states (insurance / player actions / disabled). */
export const ActionPadPlayer: StoryObj<typeof ActionPad> = {
  render: () => (
    <div className="w-[22rem] rounded-2xl bg-zinc-900/70 border border-zinc-800/80 p-3">
      <ActionPad
        phase="player"
        canHit
        canStand
        canDouble
        canSplit={false}
        onHit={fn()}
        onStand={fn()}
        onDouble={fn()}
        onSplit={fn()}
        onInsuranceAccept={fn()}
        onInsuranceDecline={fn()}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /^hit$/i })).toBeEnabled();
    await expect(canvas.getByRole('button', { name: /^stand$/i })).toBeEnabled();
    await expect(canvas.getByRole('button', { name: /^double$/i })).toBeEnabled();
    await expect(canvas.getByRole('button', { name: /^split$/i })).toBeDisabled();
  },
};

export const ActionPadInsurance: StoryObj<typeof ActionPad> = {
  render: () => (
    <div className="w-[22rem] rounded-2xl bg-zinc-900/70 border border-zinc-800/80 p-3">
      <ActionPad
        phase="insurance"
        canHit={false}
        canStand={false}
        canDouble={false}
        canSplit={false}
        onHit={fn()}
        onStand={fn()}
        onDouble={fn()}
        onSplit={fn()}
        onInsuranceAccept={fn()}
        onInsuranceDecline={fn()}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /^insurance$/i })).toBeEnabled();
    await expect(canvas.getByRole('button', { name: /^no insurance$/i })).toBeEnabled();
  },
};

export const ActionPadDisabled: StoryObj<typeof ActionPad> = {
  render: () => (
    <div className="w-[22rem] rounded-2xl bg-zinc-900/70 border border-zinc-800/80 p-3">
      <ActionPad
        phase="player"
        canHit
        canStand
        canDouble
        canSplit
        disabled
        onHit={fn()}
        onStand={fn()}
        onDouble={fn()}
        onSplit={fn()}
        onInsuranceAccept={fn()}
        onInsuranceDecline={fn()}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /^hit$/i })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: /^stand$/i })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: /^double$/i })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: /^split$/i })).toBeDisabled();
  },
};

function BetBarDemo() {
  const [rawBet, setRawBet] = useState('25');
  const [bet, setBet] = useState(25);
  return (
    <div className="w-[28rem] rounded-2xl bg-zinc-900/70 border border-zinc-800/80 p-3">
      <BetBar
        bet={bet}
        balance={500}
        currencyLabel="GG"
        rawBet={rawBet}
        onRawBetChange={setRawBet}
        onBetCommit={() => {
          const parsed = Math.max(0, Math.min(500, Number(rawBet) || 0));
          setBet(parsed);
          setRawBet(String(parsed));
        }}
        onHalf={() => {
          const next = Math.round((bet / 2) * 100) / 100;
          setBet(next);
          setRawBet(String(next));
        }}
        onDouble={() => {
          const next = Math.min(500, Math.round(bet * 2 * 100) / 100);
          setBet(next);
          setRawBet(String(next));
        }}
        onPlaceBet={fn()}
      />
    </div>
  );
}

export const BetBarControls: StoryObj = {
  render: () => <BetBarDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /^bet$/i })).toBeEnabled();

    await step('Half and double adjust the amount', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /halve bet/i }));
      await expect(canvas.getByLabelText(/bet amount/i)).toHaveValue('12.5');
      await userEvent.click(canvas.getByRole('button', { name: /double bet/i }));
      await expect(canvas.getByLabelText(/bet amount/i)).toHaveValue('25');
    });
  },
};

export const SoftTotalHand: StoryObj = {
  render: () => (
    <div className="rounded-2xl bg-[#15202b] border border-zinc-800/60 p-6">
      <CardHand
        cards={[
          { rank: '9', suit: '♦', value: 9 },
          { rank: 'A', suit: '♠', value: 11 },
        ]}
        showTotal
        playerActive
        pillTone="player"
        size="lg"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('10, 20')).toBeInTheDocument();
  },
};
