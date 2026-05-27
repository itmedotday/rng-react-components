import type { Meta, StoryObj } from '@storybook/react-vite';
import { CoinHistory } from './CoinHistory';

const meta: Meta<typeof CoinHistory> = {
  title: 'Components/CoinFlip/Submodules/CoinHistory',
  component: CoinHistory,
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
type Story = StoryObj<typeof CoinHistory>;

export const Empty: Story = {
  args: {
    history: [],
  },
};

export const WithResults: Story = {
  args: {
    history: [
      {
        id: '1',
        landed: 'orange',
        prediction: 'orange',
        isWin: true,
        timestamp: new Date(),
      },
      {
        id: '2',
        landed: 'blue',
        prediction: 'orange',
        isWin: false,
        timestamp: new Date(),
      },
      {
        id: '3',
        landed: 'blue',
        prediction: 'blue',
        isWin: true,
        timestamp: new Date(),
      },
      {
        id: '4',
        landed: 'orange',
        prediction: 'blue',
        isWin: false,
        timestamp: new Date(),
      },
    ],
  },
};
