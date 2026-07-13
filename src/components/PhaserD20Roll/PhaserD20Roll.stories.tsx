import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { PhaserD20Roll } from './PhaserD20Roll';
import type { PhaserD20RollHandle } from './types';

const meta: Meta<typeof PhaserD20Roll> = {
  title: 'Components/PhaserD20Roll',
  component: PhaserD20Roll,
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
          'Twenty-sided die rendered on a canvas by the Phaser game engine. Phaser loads lazily on mount; the die spins and flashes crits/fumbles inside a Phaser scene while React owns the RNG, result state, and controls.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onRollStart: { action: 'roll started' },
    onRollComplete: { action: 'roll completed' },
    onIsRollingChange: { action: 'is rolling changed' },
    rollRequest: { control: 'number' },
    animationDuration: { control: 'number' },
    size: { control: 'number' },
    rng: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof PhaserD20Roll>;

async function waitForDieReady(canvas: ReturnType<typeof within>) {
  const rollButton = canvas.getByRole('button', { name: /roll/i });
  await waitFor(() => expect(rollButton).not.toBeDisabled(), { timeout: 15_000 });
  return rollButton;
}

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('img', { name: 'Twenty-sided die' })).toBeInTheDocument();
    await waitForDieReady(canvas);
  },
};

export const NaturalTwenty: Story = {
  args: {
    animationDuration: 400,
    // floor(0.999 × 20) + 1 = 20.
    rng: () => 0.999,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const rollButton = await waitForDieReady(canvas);

    await step('Roll lands on the value chosen by the injected rng', async () => {
      await userEvent.click(rollButton);
      await expect(rollButton).toBeDisabled();
      await waitFor(
        async () => {
          const badge = canvas.getByTestId('phaser-d20-result');
          await expect(badge).toHaveTextContent('Nat 20!');
        },
        { timeout: 5_000 },
      );
      await expect(rollButton).not.toBeDisabled();
    });
  },
};

export const Fumble: Story = {
  args: {
    animationDuration: 400,
    // floor(0 × 20) + 1 = 1.
    rng: () => 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rollButton = await waitForDieReady(canvas);
    await userEvent.click(rollButton);
    await waitFor(
      async () => {
        await expect(canvas.getByTestId('phaser-d20-result')).toHaveTextContent('Fumble (1)');
      },
      { timeout: 5_000 },
    );
  },
};

export const MidRoll: Story = {
  args: {
    animationDuration: 400,
    // floor(0.5 × 20) + 1 = 11.
    rng: () => 0.5,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rollButton = await waitForDieReady(canvas);
    await userEvent.click(rollButton);
    await waitFor(
      async () => {
        await expect(canvas.getByTestId('phaser-d20-result')).toHaveTextContent('Rolled 11');
      },
      { timeout: 5_000 },
    );
  },
};

export const SmallDie: Story = {
  args: { size: 200 },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /roll/i })).toBeDisabled();
  },
};

function ExternalRollRequestDemo() {
  const [rollRequest, setRollRequest] = useState(0);
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold uppercase tracking-wide"
        onClick={() => setRollRequest((n) => n + 1)}
      >
        Roll from parent
      </button>
      <PhaserD20Roll rollRequest={rollRequest} animationDuration={600} showRollButton={false} />
    </div>
  );
}

export const ExternalRollRequest: Story = {
  render: () => <ExternalRollRequestDemo />,
};

function ImperativeRollDemo() {
  const dieRef = useRef<PhaserD20RollHandle>(null);
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold uppercase tracking-wide"
        onClick={() => dieRef.current?.roll()}
      >
        Roll via ref
      </button>
      <PhaserD20Roll ref={dieRef} animationDuration={600} showRollButton={false} />
    </div>
  );
}

export const ImperativeRoll: Story = {
  render: () => <ImperativeRollDemo />,
};
