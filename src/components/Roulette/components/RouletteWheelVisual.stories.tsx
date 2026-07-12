import type { Meta, StoryObj } from '@storybook/react-vite';
import { RouletteWheelVisual } from './RouletteWheelVisual';
import type { RouletteSpinResult } from '../types';

function makeResult(
  partial: Pick<RouletteSpinResult, 'number' | 'color' | 'isWin' | 'profit'>,
): RouletteSpinResult {
  return {
    id: 'story-result',
    timestamp: new Date(),
    prediction: partial.color,
    bet: { type: 'color', color: partial.color === 'green' ? 'red' : partial.color },
    totalWagered: 25,
    totalReturned: partial.isWin ? 50 : 0,
    settlements: [],
    ...partial,
  };
}

const meta: Meta<typeof RouletteWheelVisual> = {
  title: 'Components/Roulette/Submodules/RouletteWheelVisual',
  component: RouletteWheelVisual,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'stake',
      values: [
        { name: 'stake', value: '#0f212e' },
        { name: 'dark', value: '#09090b' },
      ],
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[340px] rounded-xl bg-[#071824] border border-[#2f4553] p-2">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RouletteWheelVisual>;

export const IdleWithBall: Story = {
  args: {
    isSpinning: false,
    targetNumber: null,
    result: null,
    spinStatus: 'idle',
    spinDuration: 2400,
  },
};

export const Spinning: Story = {
  args: {
    isSpinning: true,
    targetNumber: 17,
    result: null,
    spinStatus: 'idle',
    spinDuration: 4000,
  },
};

export const LandedWin: Story = {
  args: {
    isSpinning: false,
    targetNumber: null,
    spinStatus: 'win',
    spinDuration: 2400,
    result: makeResult({
      number: 17,
      color: 'black',
      isWin: true,
      profit: 25,
    }),
  },
};

export const LandedLoss: Story = {
  args: {
    isSpinning: false,
    targetNumber: null,
    spinStatus: 'loss',
    spinDuration: 2400,
    result: makeResult({
      number: 0,
      color: 'green',
      isWin: false,
      profit: -25,
    }),
  },
};

export const LandedRed: Story = {
  args: {
    isSpinning: false,
    targetNumber: null,
    spinStatus: 'win',
    spinDuration: 2400,
    result: makeResult({
      number: 32,
      color: 'red',
      isWin: true,
      profit: 875,
    }),
  },
};
