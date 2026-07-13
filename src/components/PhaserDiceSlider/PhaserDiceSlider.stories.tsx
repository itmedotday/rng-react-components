import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { PhaserDiceSlider } from './PhaserDiceSlider';
import type { PhaserDiceSliderHandle } from './types';

const meta: Meta<typeof PhaserDiceSlider> = {
  title: 'Components/PhaserDiceSlider',
  component: PhaserDiceSlider,
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
          'Stake-style probability slider whose track, zones, and outcome badge are rendered on a canvas by the Phaser game engine. Phaser loads lazily on mount; the target and win-chance inputs stay in the DOM for precise entry and accessibility.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onRollStart: { action: 'roll started' },
    onRollComplete: { action: 'roll completed' },
    onIsRollingChange: { action: 'is rolling changed' },
    rollRequest: { control: 'number' },
    initialTarget: { control: 'number' },
    animationDuration: { control: 'number' },
    width: { control: 'number' },
    rng: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof PhaserDiceSlider>;

async function waitForSliderReady(canvas: ReturnType<typeof within>) {
  const rollButton = canvas.getByRole('button', { name: /roll dice/i });
  await waitFor(() => expect(rollButton).not.toBeDisabled(), { timeout: 15_000 });
  return rollButton;
}

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('img', { name: 'Probability slider track' }),
    ).toBeInTheDocument();
    await waitForSliderReady(canvas);
  },
};

export const DeterministicWin: Story = {
  args: {
    animationDuration: 400,
    // 75.00 beats the default roll-over target of 50.
    rng: () => 0.75,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const rollButton = await waitForSliderReady(canvas);

    await step('Roll resolves to the outcome chosen by the injected rng', async () => {
      await userEvent.click(rollButton);
      await waitFor(
        async () => {
          const badge = canvas.getByTestId('phaser-diceslider-result');
          await expect(badge).toHaveTextContent('75.00 — Win');
        },
        { timeout: 5_000 },
      );
      await expect(rollButton).not.toBeDisabled();
    });
  },
};

export const DeterministicLoss: Story = {
  args: {
    animationDuration: 400,
    // 20.00 misses the default roll-over target of 50.
    rng: () => 0.2,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rollButton = await waitForSliderReady(canvas);
    await userEvent.click(rollButton);
    await waitFor(
      async () => {
        await expect(canvas.getByTestId('phaser-diceslider-result')).toHaveTextContent(
          '20.00 — Loss',
        );
      },
      { timeout: 5_000 },
    );
  },
};

export const RollUnder: Story = {
  args: {
    animationDuration: 400,
    initialIsRollOver: false,
    // 20.00 is under the target of 50, so roll-under wins.
    rng: () => 0.2,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rollButton = await waitForSliderReady(canvas);
    await expect(canvas.getByText(/roll under target/i)).toBeInTheDocument();
    await userEvent.click(rollButton);
    await waitFor(
      async () => {
        await expect(canvas.getByTestId('phaser-diceslider-result')).toHaveTextContent(
          '20.00 — Win',
        );
      },
      { timeout: 5_000 },
    );
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /roll dice/i })).toBeDisabled();
  },
};

function ExternalRollRequestDemo() {
  const [rollRequest, setRollRequest] = useState(0);
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
      <button
        type="button"
        className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold uppercase tracking-wide"
        onClick={() => setRollRequest((n) => n + 1)}
      >
        Roll from parent
      </button>
      <PhaserDiceSlider rollRequest={rollRequest} showControls={false} />
    </div>
  );
}

export const ExternalRollRequest: Story = {
  render: () => <ExternalRollRequestDemo />,
};

function ImperativeRollDemo() {
  const sliderRef = useRef<PhaserDiceSliderHandle>(null);
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
      <button
        type="button"
        className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold uppercase tracking-wide"
        onClick={() => sliderRef.current?.roll()}
      >
        Roll via ref
      </button>
      <PhaserDiceSlider ref={sliderRef} showControls={false} />
    </div>
  );
}

export const ImperativeRoll: Story = {
  render: () => <ImperativeRollDemo />,
};
