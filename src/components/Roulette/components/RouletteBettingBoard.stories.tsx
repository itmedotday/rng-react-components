import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { RouletteBettingBoard } from './RouletteBettingBoard';
import type { RouletteSpot, SpotStack } from '../types';
import { spotKey } from '../rouletteMath';

function stacksOf(...entries: SpotStack[]): Map<string, SpotStack> {
  return new Map(entries.map((stack) => [spotKey(stack.spot), stack]));
}

const meta: Meta<typeof RouletteBettingBoard> = {
  title: 'Components/Roulette/Submodules/RouletteBettingBoard',
  component: RouletteBettingBoard,
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'stake',
      values: [
        { name: 'stake', value: '#0f212e' },
        { name: 'dark', value: '#09090b' },
      ],
    },
  },
  tags: ['autodocs'],
  args: {
    stacks: new Map(),
    disabled: false,
    lastNumber: null,
    canUndo: false,
    onPlace: fn(),
    onUndo: fn(),
    onClear: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-3xl rounded-xl bg-[#071824] border border-[#2f4553] p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RouletteBettingBoard>;

export const Empty: Story = {};

export const WithChips: Story = {
  args: {
    stacks: stacksOf(
      { spot: { type: 'number', number: 17 }, amount: 50 },
      { spot: { type: 'color', color: 'red' }, amount: 25 },
      { spot: { type: 'parity', parity: 'even' }, amount: 10 },
      { spot: { type: 'dozen', dozen: 2 }, amount: 100 },
    ),
    canUndo: true,
    lastNumber: 17,
  },
};

export const Disabled: Story = {
  args: {
    stacks: stacksOf({ spot: { type: 'number', number: 0 }, amount: 5 }),
    disabled: true,
    canUndo: true,
  },
};

function InteractiveBoardDemo() {
  const [stacks, setStacks] = useState(() => new Map<string, SpotStack>());
  const [history, setHistory] = useState<RouletteSpot[]>([]);

  const onPlace = (spot: RouletteSpot) => {
    setStacks((prev) => {
      const next = new Map(prev);
      const key = spotKey(spot);
      const existing = next.get(key);
      next.set(key, { spot, amount: (existing?.amount ?? 0) + 25 });
      return next;
    });
    setHistory((prev) => [...prev, spot]);
  };

  const onUndo = () => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setStacks((stacksPrev) => {
        const next = new Map(stacksPrev);
        const key = spotKey(last);
        const existing = next.get(key);
        if (!existing) return next;
        const remaining = existing.amount - 25;
        if (remaining <= 0) next.delete(key);
        else next.set(key, { spot: last, amount: remaining });
        return next;
      });
      return prev.slice(0, -1);
    });
  };

  return (
    <RouletteBettingBoard
      stacks={stacks}
      onPlace={onPlace}
      onUndo={onUndo}
      onClear={() => {
        setStacks(new Map());
        setHistory([]);
      }}
      disabled={false}
      canUndo={history.length > 0}
      lastNumber={null}
    />
  );
}

export const Interactive: Story = {
  render: () => <InteractiveBoardDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Place chips on multiple spots', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Bet number 17' }));
      await userEvent.click(canvas.getByRole('button', { name: 'Bet red' }));
      await expect(canvas.getByRole('button', { name: 'Undo last chip' })).not.toBeDisabled();
    });

    await step('Undo removes the last chip', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Undo last chip' }));
      await expect(canvas.getByRole('button', { name: 'Clear all chips' })).not.toBeDisabled();
    });

    await step('Clear empties the table', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Clear all chips' }));
      await expect(canvas.getByRole('button', { name: 'Undo last chip' })).toBeDisabled();
      await expect(canvas.getByRole('button', { name: 'Clear all chips' })).toBeDisabled();
    });
  },
};
