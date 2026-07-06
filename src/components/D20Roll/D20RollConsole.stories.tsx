import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { D20RollConsole } from './D20RollConsole';
import type { D20RollConsoleHandle } from './types';

const meta: Meta<typeof D20RollConsole> = {
  title: 'Components/D20RollConsole',
  component: D20RollConsole,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#09090b' }],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onRollStart: { action: 'roll started' },
    onRollComplete: { action: 'roll completed' },
    onIsRollingChange: { action: 'is rolling changed' },
    rollRequest: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof D20RollConsole>;

export const Default: Story = {
  args: { initialTarget: 11 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('Difficulty Class')).toHaveValue('11');
    await expect(canvas.getByLabelText('Win Chance')).toHaveValue('50.00');
    await expect(canvas.getByRole('button', { name: /roll d20/i })).toBeInTheDocument();
  },
};

export const FullConsole: Story = {
  args: {
    initialTarget: 11,
    showHeader: true,
    showHistory: true,
    showRules: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('D20 ROLL CONSOLE')).toBeInTheDocument();
    await expect(canvas.getByText('Win Ratio')).toBeInTheDocument();
    await expect(canvas.getByText('0.00%')).toBeInTheDocument();
  },
};

export const DcChange: Story = {
  args: { initialTarget: 11 },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const dcInput = canvas.getByLabelText('Difficulty Class');

    await step('Changing DC updates win chance', async () => {
      await userEvent.clear(dcInput);
      await userEvent.type(dcInput, '15');
      await userEvent.tab();
      await expect(dcInput).toHaveValue('15');
      await expect(canvas.getByLabelText('Win Chance')).toHaveValue('30.00');
    });
  },
};

export const RollSimulation: Story = {
  args: { initialTarget: 11, showHistory: true },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const rollBtn = canvas.getByRole('button', { name: /roll d20/i });

    await step('Roll logs history when showHistory is enabled', async () => {
      await userEvent.click(rollBtn);
      await waitFor(
        async () => {
          await expect(rollBtn).not.toBeDisabled();
        },
        { timeout: 2000 },
      );
      await expect(canvas.getByText(/last 1 rolls/i)).toBeInTheDocument();
    });
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /roll d20/i })).toBeDisabled();
    await expect(canvas.getByLabelText('Difficulty Class')).toBeDisabled();
  },
};

export const FastAnimation: Story = {
  args: { initialTarget: 11, animationDuration: 200 },
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
      <D20RollConsole rollRequest={rollRequest} />
    </div>
  );
}

export const ExternalRollRequest: Story = {
  render: () => <ExternalRollRequestDemo />,
};

function ImperativeRollDemo() {
  const d20Ref = useRef<D20RollConsoleHandle>(null);
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
      <button
        type="button"
        className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold uppercase tracking-wide"
        onClick={() => d20Ref.current?.roll()}
      >
        Roll via ref
      </button>
      <D20RollConsole ref={d20Ref} />
    </div>
  );
}

export const ImperativeRoll: Story = {
  render: () => <ImperativeRollDemo />,
};
