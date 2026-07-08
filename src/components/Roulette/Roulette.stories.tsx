import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { Roulette } from './Roulette';

const meta: Meta<typeof Roulette> = {
  title: 'Components/Roulette',
  component: Roulette,
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
type Story = StoryObj<typeof Roulette>;

export const Default: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /spin/i })).toBeInTheDocument();
  },
};

export const FullConsole: Story = {
  args: {
    showHeader: true,
    showHistory: true,
    showRules: true,
  },
};

export const SpinSimulation: Story = {
  args: { showHistory: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const spinButton = canvas.getByRole('button', { name: /spin/i });
    await userEvent.click(spinButton);
    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name: /spin/i })).toBeInTheDocument();
    }, { timeout: 2200 });
  },
};
