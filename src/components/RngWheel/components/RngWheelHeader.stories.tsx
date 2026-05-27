import type { Meta, StoryObj } from '@storybook/react-vite';
import { RngWheelHeader } from './RngWheelHeader';

const meta: Meta<typeof RngWheelHeader> = {
  title: 'Components/RngWheel/Submodules/RngWheelHeader',
  component: RngWheelHeader,
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
    onReset: { action: 'reset triggered' },
  },
};

export default meta;
type Story = StoryObj<typeof RngWheelHeader>;

export const Empty: Story = {
  args: {
    stats: {
      totalPlays: 0,
      wins: 0,
      losses: 0,
      currentStreak: 0,
      maxStreak: 0,
    },
  },
};

export const WithStats: Story = {
  args: {
    stats: {
      totalPlays: 24,
      wins: 9,
      losses: 15,
      currentStreak: 0,
      maxStreak: 3,
    },
  },
};
