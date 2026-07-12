import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { PhaserRoulette } from './PhaserRoulette';
import type { PhaserRouletteHandle } from './types';

const meta: Meta<typeof PhaserRoulette> = {
  title: 'Components/PhaserRoulette',
  component: PhaserRoulette,
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
          'European roulette wheel rendered on a canvas by the Phaser game engine. Phaser loads lazily on mount; the wheel and ball animate inside a Phaser scene while React owns the RNG, result state, and controls.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onSpinStart: { action: 'spin started' },
    onSpinComplete: { action: 'spin completed' },
    onIsSpinningChange: { action: 'is spinning changed' },
    spinRequest: { control: 'number' },
    spinDuration: { control: 'number' },
    size: { control: 'number' },
    rng: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof PhaserRoulette>;

async function waitForWheelReady(canvas: ReturnType<typeof within>) {
  const spinButton = canvas.getByRole('button', { name: /spin/i });
  await waitFor(() => expect(spinButton).not.toBeDisabled(), { timeout: 15_000 });
  return spinButton;
}

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('img', { name: 'Roulette wheel' })).toBeInTheDocument();
    await waitForWheelReady(canvas);
  },
};

export const DeterministicSpin: Story = {
  args: {
    spinDuration: 400,
    // floor(0.03 × 37) = pocket 1 → number 32 (red) on the European wheel.
    rng: () => 0.03,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const spinButton = await waitForWheelReady(canvas);

    await step('Spin lands on the pocket chosen by the injected rng', async () => {
      await userEvent.click(spinButton);
      await expect(spinButton).toBeDisabled();
      await waitFor(
        async () => {
          const badge = canvas.getByTestId('phaser-roulette-result');
          await expect(badge).toHaveTextContent('#32 red');
        },
        { timeout: 5_000 },
      );
      await expect(spinButton).not.toBeDisabled();
    });
  },
};

export const GreenZero: Story = {
  args: {
    spinDuration: 400,
    rng: () => 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const spinButton = await waitForWheelReady(canvas);
    await userEvent.click(spinButton);
    await waitFor(
      async () => {
        await expect(canvas.getByTestId('phaser-roulette-result')).toHaveTextContent('#0 green');
      },
      { timeout: 5_000 },
    );
  },
};

export const FastSpin: Story = {
  args: { spinDuration: 600 },
};

export const SmallWheel: Story = {
  args: { size: 260 },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /spin/i })).toBeDisabled();
  },
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
      <PhaserRoulette spinRequest={spinRequest} spinDuration={600} showSpinButton={false} />
    </div>
  );
}

export const ExternalSpinRequest: Story = {
  render: () => <ExternalSpinRequestDemo />,
};

function ImperativeSpinDemo() {
  const rouletteRef = useRef<PhaserRouletteHandle>(null);
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold uppercase tracking-wide"
        onClick={() => rouletteRef.current?.spin()}
      >
        Spin via ref
      </button>
      <PhaserRoulette ref={rouletteRef} spinDuration={600} showSpinButton={false} />
    </div>
  );
}

export const ImperativeSpin: Story = {
  render: () => <ImperativeSpinDemo />,
};
