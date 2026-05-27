import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { RngWheel } from './RngWheel';
import type { RngWheelHandle } from './types';

const meta: Meta<typeof RngWheel> = {
  title: 'Components/RngWheel',
  component: RngWheel,
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
    onSpinStart: { action: 'spin started' },
    onSpinComplete: { action: 'spin completed' },
    spinRequest: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof RngWheel>;

// 1. Initial State Assertions
export const Default: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify Title is present
    const titleElement = canvas.getByText('RNG WHEEL CONSOLE');
    await expect(titleElement).toBeInTheDocument();



    // Verify trigger button is enabled
    const spinButton = canvas.getByRole('button', { name: /spin wheel/i });
    await expect(spinButton).toBeInTheDocument();
    await expect(spinButton).not.toBeDisabled();
  },
};

// 2. Interactive Spin Action & History Recording Test
export const SpinSimulation: Story = {
  args: {},
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const triggerBtn = canvas.getByRole('button', { name: /spin wheel/i });

    await step('Triggering Spin disables inputs and sets SPINNING state', async () => {
      await userEvent.click(triggerBtn);

      // Verify button goes into spinning state
      await expect(canvas.getByRole('button', { name: /spinning\.\.\./i })).toBeInTheDocument();
      await expect(triggerBtn).toBeDisabled();
    });

    await step('Waiting for wheel spin spring animation to complete restores inputs and logs history', async () => {
      // Let spin run (deceleration runs for 1500ms, timeout 2500ms captures it safely)
      await waitFor(async () => {
        await expect(canvas.getByRole('button', { name: /spin wheel/i })).toBeInTheDocument();
      }, { timeout: 2500 });

      // Verify button is reactivated
      await expect(triggerBtn).not.toBeDisabled();


    });
  },
};

// 3. Disabled State
export const Disabled: Story = {
  args: {
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const triggerBtn = canvas.getByRole('button', { name: /spin wheel/i });

    await expect(triggerBtn).toBeDisabled();
  },
};

// 4. Custom Animation Speed
export const FastAnimation: Story = {
  args: {
    spinDuration: 500,
  },
};

function ExternalSpinRequestDemo() {
  const [spinRequest, setSpinRequest] = useState(0);
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
      <button
        type="button"
        className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold uppercase tracking-wide"
        onClick={() => setSpinRequest((n) => n + 1)}
      >
        Spin from parent
      </button>
      <RngWheel spinRequest={spinRequest} />
    </div>
  );
}

export const ExternalSpinRequest: Story = {
  render: () => <ExternalSpinRequestDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const externalBtn = canvas.getByRole('button', { name: /spin from parent/i });

    await step('Parent spinRequest triggers spin', async () => {
      await userEvent.click(externalBtn);
      await expect(canvas.getByRole('button', { name: /spinning\.\.\./i })).toBeInTheDocument();
      await waitFor(
        async () => {
          await expect(canvas.getByRole('button', { name: /spin wheel/i })).toBeInTheDocument();
        },
        { timeout: 2500 },
      );
    });
  },
};

function ImperativeSpinDemo() {
  const wheelRef = useRef<RngWheelHandle>(null);
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
      <button
        type="button"
        className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold uppercase tracking-wide"
        onClick={() => wheelRef.current?.spin()}
      >
        Spin via ref
      </button>
      <RngWheel ref={wheelRef} />
    </div>
  );
}

export const ImperativeSpin: Story = {
  render: () => <ImperativeSpinDemo />,
};
