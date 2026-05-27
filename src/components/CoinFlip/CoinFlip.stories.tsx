import React, { useRef, useState } from 'react';
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
      values: [
        { name: 'dark', value: '#09090b' },
      ],
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

// 1. Initial State Assertions
export const Default: Story = {
  args: {
    initialPrediction: 'orange',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify Title is present
    const titleElement = canvas.getByText('COIN FLIP CONSOLE');
    await expect(titleElement).toBeInTheDocument();

    // Verify initial orange heads side is active
    const predictOrangeBtn = canvas.getByRole('button', { name: /predict orange/i });
    const predictBlueBtn = canvas.getByRole('button', { name: /predict blue/i });

    await expect(predictOrangeBtn).toBeInTheDocument();
    await expect(predictBlueBtn).toBeInTheDocument();

    // The orange button should have active styling (e.g. border-amber-500)
    await expect(predictOrangeBtn).toHaveClass('border-amber-500');
    await expect(predictBlueBtn).not.toHaveClass('border-blue-500');

    // Verify session stats are shown in header
    await expect(canvas.getByText('Win Ratio')).toBeInTheDocument();
    await expect(canvas.getByText('Win Streak')).toBeInTheDocument();
    await expect(canvas.getByText('0.00%')).toBeInTheDocument();
  },
};

// 2. Interactive Selection Testing
export const InteractiveSelection: Story = {
  args: {
    initialPrediction: 'orange',
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const predictOrangeBtn = canvas.getByRole('button', { name: /predict orange/i });
    const predictBlueBtn = canvas.getByRole('button', { name: /predict blue/i });

    await step('Verify starting state selects Orange', async () => {
      await expect(predictOrangeBtn).toHaveClass('border-amber-500');
      await expect(predictBlueBtn).not.toHaveClass('border-blue-500');
    });

    await step('Clicking Blue switches the active prediction target', async () => {
      await userEvent.click(predictBlueBtn);

      // Blue button should now have active styles, Orange should lose active styles
      await expect(predictBlueBtn).toHaveClass('border-blue-500');
      await expect(predictOrangeBtn).not.toHaveClass('border-amber-500');
    });

    await step('Clicking Orange switches it back', async () => {
      await userEvent.click(predictOrangeBtn);

      await expect(predictOrangeBtn).toHaveClass('border-amber-500');
      await expect(predictBlueBtn).not.toHaveClass('border-blue-500');
    });
  },
};

// 3. Interactive Flip Action Testing
export const FlipSimulation: Story = {
  args: {
    initialPrediction: 'orange',
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const triggerBtn = canvas.getByRole('button', { name: /flip coin/i });
    const predictOrangeBtn = canvas.getByRole('button', { name: /predict orange/i });
    const predictBlueBtn = canvas.getByRole('button', { name: /predict blue/i });

    await step('Triggering Flip disables inputs and sets FLIPPING state', async () => {
      await userEvent.click(triggerBtn);

      // Verify button switches status
      await expect(canvas.getByRole('button', { name: /flipping\.\.\./i })).toBeInTheDocument();
      await expect(triggerBtn).toBeDisabled();

      // Verify side toggles are locked
      await expect(predictOrangeBtn).toBeDisabled();
      await expect(predictBlueBtn).toBeDisabled();
    });

    await step('Waiting for 3D spin physics to complete restores inputs and logs history', async () => {
      // Let spin physics run and settle (Timeout: 1500ms to safely capture the 950ms spin delay)
      await waitFor(async () => {
        await expect(canvas.getByRole('button', { name: /flip coin/i })).toBeInTheDocument();
      }, { timeout: 2000 });

      // Verify controls are re-activated
      await expect(triggerBtn).not.toBeDisabled();
      await expect(predictOrangeBtn).not.toBeDisabled();
      await expect(predictBlueBtn).not.toBeDisabled();

      // Verify history ledger now contains the logged result
      const historyHeading = canvas.getByText(/last \d+ flips/i);
      await expect(historyHeading).toBeInTheDocument();
    });
  },
};

// 4. Disabled State
export const Disabled: Story = {
  args: {
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const triggerBtn = canvas.getByRole('button', { name: /flip coin/i });
    const predictOrangeBtn = canvas.getByRole('button', { name: /predict orange/i });
    const predictBlueBtn = canvas.getByRole('button', { name: /predict blue/i });

    await expect(triggerBtn).toBeDisabled();
    await expect(predictOrangeBtn).toBeDisabled();
    await expect(predictBlueBtn).toBeDisabled();
  },
};

// 5. Custom Animation Speed
export const FastAnimation: Story = {
  args: {
    animationDuration: 200,
  },
};

function ExternalFlipRequestDemo() {
  const [flipRequest, setFlipRequest] = useState(0);
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
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
    const externalBtn = canvas.getByRole('button', { name: /flip from parent/i });

    await step('Parent flipRequest triggers flip', async () => {
      await userEvent.click(externalBtn);
      await expect(canvas.getByRole('button', { name: /flipping\.\.\./i })).toBeInTheDocument();
      await waitFor(
        async () => {
          await expect(canvas.getByRole('button', { name: /flip coin/i })).toBeInTheDocument();
        },
        { timeout: 2000 },
      );
    });
  },
};

function ImperativeFlipDemo() {
  const coinRef = useRef<CoinFlipHandle>(null);
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
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
    const externalBtn = canvas.getByRole('button', { name: /flip via ref/i });

    await step('ref.flip() triggers flip', async () => {
      await userEvent.click(externalBtn);
      await expect(canvas.getByRole('button', { name: /flipping\.\.\./i })).toBeInTheDocument();
      await waitFor(
        async () => {
          await expect(canvas.getByRole('button', { name: /flip coin/i })).toBeInTheDocument();
        },
        { timeout: 2000 },
      );
    });
  },
};
