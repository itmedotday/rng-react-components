import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { CoinFlip } from './CoinFlip';
import type { CoinFlipHandle } from './types';

const meta: Meta<typeof CoinFlip> = {
  title: 'Components/CoinFlip',
  component: CoinFlip,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#09090b' }],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onFlipStart: { action: 'flip started' },
    onFlipComplete: { action: 'flip completed' },
    onIsFlippingChange: { action: 'is flipping changed' },
    flipRequest: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof CoinFlip>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /flip coin/i })).toBeInTheDocument();
  },
};

export const FlipSimulation: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const coinBtn = canvas.getByRole('button', { name: /flip coin/i });

    await step('Clicking coin triggers flip animation', async () => {
      await userEvent.click(coinBtn);
      await expect(coinBtn).toBeDisabled();
      await waitFor(
        async () => {
          await expect(coinBtn).not.toBeDisabled();
        },
        { timeout: 2000 },
      );
    });
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /flip coin/i })).toBeDisabled();
  },
};

export const FastAnimation: Story = {
  args: { animationDuration: 200 },
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
      <CoinFlip flipRequest={flipRequest} />
    </div>
  );
}

export const ExternalFlipRequest: Story = {
  render: () => <ExternalFlipRequestDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('Parent flipRequest triggers flip', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /flip from parent/i }));
      await expect(canvas.getByRole('button', { name: /flip coin/i })).toBeDisabled();
      await waitFor(
        async () => {
          await expect(canvas.getByRole('button', { name: /flip coin/i })).not.toBeDisabled();
        },
        { timeout: 2000 },
      );
    });
  },
};

function ImperativeFlipDemo() {
  const coinRef = useRef<CoinFlipHandle>(null);
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold uppercase tracking-wide"
        onClick={() => coinRef.current?.flip()}
      >
        Flip via ref
      </button>
      <CoinFlip ref={coinRef} />
    </div>
  );
}

export const ImperativeFlip: Story = {
  render: () => <ImperativeFlipDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('ref.flip() triggers flip', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /flip via ref/i }));
      await expect(canvas.getByRole('button', { name: /flip coin/i })).toBeDisabled();
      await waitFor(
        async () => {
          await expect(canvas.getByRole('button', { name: /flip coin/i })).not.toBeDisabled();
        },
        { timeout: 2000 },
      );
    });
  },
};
