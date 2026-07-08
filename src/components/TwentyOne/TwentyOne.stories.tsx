import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { TwentyOne } from './TwentyOne';

const meta: Meta<typeof TwentyOne> = {
  title: 'Components/TwentyOne',
  component: TwentyOne,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#09090b' }],
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TwentyOne>;

export const Default: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /deal 21/i })).toBeInTheDocument();
  },
};

export const FullConsole: Story = {
  args: {
    showHeader: true,
    showHistory: true,
    showRules: true,
  },
};

export const DealSimulation: Story = {
  args: { showHistory: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dealButton = canvas.getByRole('button', { name: /deal 21/i });
    await userEvent.click(dealButton);
    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name: /deal 21/i })).toBeInTheDocument();
    }, { timeout: 2000 });
  },
};
