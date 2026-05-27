import type { Meta, StoryObj } from '@storybook/react-vite';
import { PredictionSelector } from './PredictionSelector';

const meta: Meta<typeof PredictionSelector> = {
  title: 'Components/CoinFlip/Submodules/PredictionSelector',
  component: PredictionSelector,
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
    onSelect: { action: 'prediction selected' },
  },
};

export default meta;
type Story = StoryObj<typeof PredictionSelector>;

export const PredictOrange: Story = {
  args: {
    prediction: 'orange',
    disabled: false,
  },
};

export const PredictBlue: Story = {
  args: {
    prediction: 'blue',
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    prediction: 'orange',
    disabled: true,
  },
};
