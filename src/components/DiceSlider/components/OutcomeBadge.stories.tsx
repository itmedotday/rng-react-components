import type { Meta, StoryObj } from '@storybook/react-vite';
import { OutcomeBadge } from './OutcomeBadge';

const meta: Meta<typeof OutcomeBadge> = {
  title: 'Components/DiceSlider/Subcomponents/OutcomeBadge',
  component: OutcomeBadge,
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
type Story = StoryObj<typeof OutcomeBadge>;

export const RollingActive: Story = {
  args: {
    style: { position: 'relative', top: '0px', left: '0px', transform: 'none' },
    isRolling: true,
    cyclingNumber: '47.88',
    rollOutcome: null,
    rollStatus: 'idle',
  },
};

export const WinOutcome: Story = {
  args: {
    style: { position: 'relative', top: '0px', left: '0px', transform: 'none' },
    isRolling: false,
    cyclingNumber: '74.77',
    rollOutcome: 74.77,
    rollStatus: 'win',
  },
};

export const LossOutcome: Story = {
  args: {
    style: { position: 'relative', top: '0px', left: '0px', transform: 'none' },
    isRolling: false,
    cyclingNumber: '23.45',
    rollOutcome: 23.45,
    rollStatus: 'loss',
  },
};
