import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { RouletteControls } from './RouletteControls';
import { DEFAULT_CHIP_VALUES } from '../rouletteMath';

const meta: Meta<typeof RouletteControls> = {
  title: 'Components/Roulette/Submodules/RouletteControls',
  component: RouletteControls,
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
  args: {
    chipValues: DEFAULT_CHIP_VALUES,
    chipValue: 25,
    totalAmount: 125,
    disabled: false,
    isSpinning: false,
    canPlay: true,
    onChipValueChange: fn(),
    onHalve: fn(),
    onDouble: fn(),
    onPlay: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-[280px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RouletteControls>;

export const Ready: Story = {};

export const EmptyTable: Story = {
  args: {
    totalAmount: 0,
    canPlay: false,
  },
};

export const Spinning: Story = {
  args: {
    isSpinning: true,
    canPlay: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const HighRollerChips: Story = {
  args: {
    chipValues: [1000, 5000, 10_000, 100_000, 1_000_000],
    chipValue: 10_000,
    totalAmount: 55_000,
  },
};
