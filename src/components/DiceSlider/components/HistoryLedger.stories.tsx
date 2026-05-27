import type { Meta, StoryObj } from '@storybook/react-vite';
import { HistoryLedger } from './HistoryLedger';

const meta: Meta<typeof HistoryLedger> = {
  title: 'Components/DiceSlider/Subcomponents/HistoryLedger',
  component: HistoryLedger,
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
type Story = StoryObj<typeof HistoryLedger>;

export const DefaultEmpty: Story = {
  args: {
    history: [],
  },
};

export const PreloadedRolls: Story = {
  args: {
    history: [
      { id: '1', outcome: 74.77, isWin: true, target: 50, isRollOver: true, timestamp: new Date() },
      { id: '2', outcome: 45.32, isWin: false, target: 50, isRollOver: true, timestamp: new Date() },
      { id: '3', outcome: 88.12, isWin: true, target: 40, isRollOver: true, timestamp: new Date() },
      { id: '4', outcome: 12.05, isWin: false, target: 30, isRollOver: false, timestamp: new Date() },
      { id: '5', outcome: 25.40, isWin: true, target: 30, isRollOver: false, timestamp: new Date() },
    ],
  },
};
