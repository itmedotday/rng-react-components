import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor, fireEvent } from 'storybook/test';
import { DiceSlider } from './DiceSlider';
import type { DiceSliderHandle } from './types';

const meta: Meta<typeof DiceSlider> = {
  title: 'Components/DiceSlider',
  component: DiceSlider,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#09090b' }, // Matches slate-950/zinc-950 backdrop
      ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onRollStart: { action: 'roll started' },
    onRollComplete: { action: 'roll completed' },
    rollRequest: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof DiceSlider>;

// 1. Initial State Assertions
export const Default: Story = {
  args: {
    initialTarget: 50.00,
    initialIsRollOver: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify inputs render with correct initial values
    const targetInput = canvas.getByRole('textbox', { name: 'Roll Target' });
    const chanceInput = canvas.getByRole('textbox', { name: 'Win Chance' });

    await expect(targetInput).toHaveValue('50.00');
    await expect(chanceInput).toHaveValue('50.0000');

    // Verify slider exists and is at 50%
    const sliderThumb = canvas.getByRole('slider', { name: 'Dice Slider Thumb' });
    await expect(sliderThumb).toBeInTheDocument();
    await expect(sliderThumb).toHaveAttribute('aria-valuenow', '50');
  },
};

export const WithHeaderAndHistory: Story = {
  args: {
    initialTarget: 50.0,
    initialIsRollOver: true,
    showHeader: true,
    showHistory: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('PROBABILITY SLIDER')).toBeInTheDocument();
    await expect(canvas.getByText('Win Ratio')).toBeInTheDocument();
  },
};

// 2. Testing Real-Time Input Synchronization
export const InteractiveSync: Story = {
  args: {
    initialTarget: 50.00,
    initialIsRollOver: true,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const targetInput = canvas.getByRole('textbox', { name: 'Roll Target' }) as HTMLInputElement;
    const chanceInput = canvas.getByRole('textbox', { name: 'Win Chance' }) as HTMLInputElement;

    await step('Updating Roll Target recalculates Win Chance %', async () => {
      targetInput.focus();
      fireEvent.change(targetInput, { target: { value: '40.00' } });
      await waitFor(() => expect(targetInput).toHaveValue('40.00'));
      targetInput.blur();

      await expect(targetInput).toHaveValue('40.00');
      await expect(chanceInput).toHaveValue('60.0000');

      const sliderThumb = canvas.getByRole('slider', { name: 'Dice Slider Thumb' });
      await expect(sliderThumb).toHaveAttribute('aria-valuenow', '40');
    });

    await step('Updating Win Chance % recalculates Roll Target', async () => {
      chanceInput.focus();
      fireEvent.change(chanceInput, { target: { value: '25.0000' } });
      await waitFor(() => expect(chanceInput).toHaveValue('25.0000'));
      chanceInput.blur();

      await expect(chanceInput).toHaveValue('25.0000');
      await expect(targetInput).toHaveValue('75.00');

      const sliderThumb = canvas.getByRole('slider', { name: 'Dice Slider Thumb' });
      await expect(sliderThumb).toHaveAttribute('aria-valuenow', '75');
    });
  },
};

// 3. Testing Roll Over / Under Toggle Inversion
export const ToggleMode: Story = {
  args: {
    initialTarget: 50.00,
    initialIsRollOver: true,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const targetInput = canvas.getByRole('textbox', { name: 'Roll Target' }) as HTMLInputElement;
    const chanceInput = canvas.getByRole('textbox', { name: 'Win Chance' });
    const toggleButton = canvas.getByTitle('Switch Roll Over / Under');

    await step('Initial Roll Over targeting', async () => {
      await expect(canvas.getByText(/roll over target/i)).toBeInTheDocument();
      await expect(targetInput).toHaveValue('50.00');
      await expect(chanceInput).toHaveValue('50.0000');
    });

    await step('Inverting to Roll Under updates labels and re-evaluates formulas', async () => {
      // Click the toggle button
      await userEvent.click(toggleButton);

      await expect(canvas.getByText(/roll under target/i)).toBeInTheDocument();
      await expect(targetInput).toHaveValue('50.00');
      await expect(chanceInput).toHaveValue('50.0000'); // Under: Target 50.00 = 50.0000% chance
    });

    await step('Updating target under Roll Under behaves correctly', async () => {
      targetInput.focus();
      fireEvent.change(targetInput, { target: { value: '20.00' } });
      await waitFor(() => expect(targetInput).toHaveValue('20.00'));
      targetInput.blur();

      await expect(targetInput).toHaveValue('20.00');
      await expect(chanceInput).toHaveValue('20.0000'); // Under: Target 20.00 = 20.0000% chance
    });
  },
};

// 4. Testing Out-of-Bounds Validation & Clamping
export const ValidationClamping: Story = {
  args: {
    initialTarget: 50.00,
    initialIsRollOver: true,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const targetInput = canvas.getByRole('textbox', { name: 'Roll Target' }) as HTMLInputElement;
    const chanceInput = canvas.getByRole('textbox', { name: 'Win Chance' });

    await step('Clamping over-limit values', async () => {
      // Explicitly trigger focus to prepare browser element for active editing state
      targetInput.focus();
      fireEvent.change(targetInput, { target: { value: '150.00' } });
      await waitFor(() => expect(targetInput).toHaveValue('150.00'));
      // Call native blur to invoke the react blur validation pipeline inside the real browser
      targetInput.blur();

      // Wait for blur state recalculations to complete and update DOM
      await waitFor(() => expect(targetInput).toHaveValue('100.00'));
      await expect(chanceInput).toHaveValue('0.0000');
    });

    await step('Clamping under-limit negative values', async () => {
      targetInput.focus();
      fireEvent.change(targetInput, { target: { value: '-25.00' } });
      await waitFor(() => expect(targetInput).toHaveValue('-25.00'));
      targetInput.blur();

      // Wait for blur state recalculations to complete and update DOM
      await waitFor(() => expect(targetInput).toHaveValue('0.00'));
      await expect(chanceInput).toHaveValue('100.0000');
    });
  },
};

// 5. Testing Interactive Roll Simulation
export const RollSimulation: Story = {
  args: {
    initialTarget: 50.00,
    initialIsRollOver: true,
    showHistory: true,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const rollButton = canvas.getByRole('button', { name: 'ROLL DICE' });
    const targetInput = canvas.getByRole('textbox', { name: 'Roll Target' });
    const chanceInput = canvas.getByRole('textbox', { name: 'Win Chance' });

    await step('Triggering Roll disables interactive states and sets ROLLING state', async () => {
      await userEvent.click(rollButton);

      // Verify button goes into rolling status
      await expect(rollButton).toHaveTextContent('ROLLING...');
      await expect(rollButton).toBeDisabled();

      // Verify input fields are locked
      await expect(targetInput).toBeDisabled();
      await expect(chanceInput).toBeDisabled();
    });

    await step('Waiting for roll to complete recovers interactive state and displays outcome', async () => {
      // Wait for roll duration (approx 400ms + margin)
      await waitFor(async () => {
        await expect(rollButton).toHaveTextContent('ROLL DICE');
      }, { timeout: 1500 });

      // Verify inputs are reactivated
      await expect(targetInput).not.toBeDisabled();
      await expect(chanceInput).not.toBeDisabled();

      // Verify history ledger now contains the rolled capsule outcome item
      const ledgerList = canvas.getByRole('list');
      await expect(ledgerList).toBeInTheDocument();

      const outcomeBadge = canvas.getByTestId('outcome-badge');
      await expect(outcomeBadge).toBeInTheDocument();
    });
  },
};

// 6. Disabled State
export const Disabled: Story = {
  args: {
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rollButton = canvas.getByRole('button', { name: 'ROLL DICE' });
    const targetInput = canvas.getByRole('textbox', { name: 'Roll Target' });
    const chanceInput = canvas.getByRole('textbox', { name: 'Win Chance' });

    await expect(rollButton).toBeDisabled();
    await expect(targetInput).toBeDisabled();
    await expect(chanceInput).toBeDisabled();
  },
};

// 6b. Custom Animation Speed
export const FastAnimation: Story = {
  args: {
    initialTarget: 50.0,
    initialIsRollOver: true,
    animationDuration: 200,
  },
};

// 7. Custom Limits
export const CustomLimits: Story = {
  args: {
    minTarget: 10,
    maxTarget: 90,
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
      <DiceSlider rollRequest={rollRequest} />
    </div>
  );
}

export const ExternalRollRequest: Story = {
  render: () => <ExternalRollRequestDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const externalBtn = canvas.getByRole('button', { name: /roll from parent/i });

    await step('Parent rollRequest triggers roll', async () => {
      await userEvent.click(externalBtn);
      await expect(canvas.getByRole('button', { name: /rolling\.\.\./i })).toBeInTheDocument();
      await waitFor(
        async () => {
          await expect(canvas.getByRole('button', { name: /roll dice/i })).toBeInTheDocument();
        },
        { timeout: 2000 },
      );
    });
  },
};

function ImperativeRollDemo() {
  const sliderRef = useRef<DiceSliderHandle>(null);
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
      <button
        type="button"
        className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold uppercase tracking-wide"
        onClick={() => sliderRef.current?.roll()}
      >
        Roll via ref
      </button>
      <DiceSlider ref={sliderRef} />
    </div>
  );
}

export const ImperativeRoll: Story = {
  render: () => <ImperativeRollDemo />,
};
