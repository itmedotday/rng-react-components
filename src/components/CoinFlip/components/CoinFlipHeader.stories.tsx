import type { Meta, StoryObj } from '@storybook/react-vite';
import { CoinFlipHeader } from './CoinFlipHeader';

const meta: Meta<typeof CoinFlipHeader> = {
  title: 'Components/CoinFlip/Submodules/CoinFlipHeader',
  component: CoinFlipHeader,
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
type Story = StoryObj<typeof CoinFlipHeader>;

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
      totalPlays: 19,
      wins: 10,
      losses: 9,
      currentStreak: 2,
      maxStreak: 4,
    },
  },
};
