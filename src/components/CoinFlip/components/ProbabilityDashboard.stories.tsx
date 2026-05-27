import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProbabilityDashboard } from './ProbabilityDashboard';

const meta: Meta<typeof ProbabilityDashboard> = {
  title: 'Components/CoinFlip/Submodules/ProbabilityDashboard',
  component: ProbabilityDashboard,
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
};

export default meta;
type Story = StoryObj<typeof ProbabilityDashboard>;

export const Default: Story = {
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

export const WithSessionStats: Story = {
  args: {
    stats: {
      totalPlays: 10,
      wins: 7,
      losses: 3,
      currentStreak: 2,
      maxStreak: 4,
    },
  },
};
