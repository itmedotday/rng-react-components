import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { PhaserCoinFlip } from './PhaserCoinFlip';
import type { PhaserCoinFlipHandle } from './types';

const meta: Meta<typeof PhaserCoinFlip> = {
  title: 'Components/PhaserCoinFlip',
  component: PhaserCoinFlip,
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
          'Coin flip rendered on a canvas by the Phaser game engine. Phaser loads lazily on mount; the coin toss animates inside a Phaser scene while React owns the RNG, result state, and controls.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onFlipStart: { action: 'flip started' },
    onFlipComplete: { action: 'flip completed' },
    onIsFlippingChange: { action: 'is flipping changed' },
    flipRequest: { control: 'number' },
    animationDuration: { control: 'number' },
    size: { control: 'number' },
    rng: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof PhaserCoinFlip>;

async function waitForCoinReady(canvas: ReturnType<typeof within>) {
  const flipButton = canvas.getByRole('button', { name: /flip/i });
  await waitFor(() => expect(flipButton).not.toBeDisabled(), { timeout: 15_000 });
  return flipButton;
}

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('img', { name: 'Coin' })).toBeInTheDocument();
    await waitForCoinReady(canvas);
  },
};

export const DeterministicOrange: Story = {
  args: {
    animationDuration: 400,
    // rng below 0.5 always lands orange.
    rng: () => 0.1,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const flipButton = await waitForCoinReady(canvas);

    await step('Flip lands on the side chosen by the injected rng', async () => {
      await userEvent.click(flipButton);
      await expect(flipButton).toBeDisabled();
      await waitFor(
        async () => {
          const badge = canvas.getByTestId('phaser-coinflip-result');
          await expect(badge).toHaveTextContent(/orange/i);
        },
        { timeout: 5_000 },
      );
      await expect(flipButton).not.toBeDisabled();
    });
  },
};

export const DeterministicBlue: Story = {
  args: {
    animationDuration: 400,
    rng: () => 0.9,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const flipButton = await waitForCoinReady(canvas);
    await userEvent.click(flipButton);
    await waitFor(
      async () => {
        await expect(canvas.getByTestId('phaser-coinflip-result')).toHaveTextContent(/blue/i);
      },
      { timeout: 5_000 },
    );
  },
};

export const FastFlip: Story = {
  args: { animationDuration: 400 },
};

export const SmallCoin: Story = {
  args: { size: 200 },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /flip/i })).toBeDisabled();
  },
};

function ExternalFlipRequestDemo() {
  const [flipRequest, setFlipRequest] = useState(0);
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold uppercase tracking-wide"
        onClick={() => setFlipRequest((n) => n + 1)}
      >
        Flip from parent
      </button>
      <PhaserCoinFlip flipRequest={flipRequest} animationDuration={600} showFlipButton={false} />
    </div>
  );
}

export const ExternalFlipRequest: Story = {
  render: () => <ExternalFlipRequestDemo />,
};

function ImperativeFlipDemo() {
  const coinRef = useRef<PhaserCoinFlipHandle>(null);
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold uppercase tracking-wide"
        onClick={() => coinRef.current?.flip()}
      >
        Flip via ref
      </button>
      <PhaserCoinFlip ref={coinRef} animationDuration={600} showFlipButton={false} />
    </div>
  );
}

export const ImperativeFlip: Story = {
  render: () => <ImperativeFlipDemo />,
};
