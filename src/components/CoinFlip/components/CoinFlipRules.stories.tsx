import type { Meta, StoryObj } from '@storybook/react-vite';
import { CoinFlipRules } from './CoinFlipRules';

const meta: Meta<typeof CoinFlipRules> = {
  title: 'Components/CoinFlip/Submodules/CoinFlipRules',
  component: CoinFlipRules,
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
type Story = StoryObj<typeof CoinFlipRules>;

export const Default: Story = {};
