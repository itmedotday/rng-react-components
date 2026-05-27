import type { Meta, StoryObj } from '@storybook/react-vite';
import { ControlInputs } from './ControlInputs';

const meta: Meta<typeof ControlInputs> = {
  title: 'Components/DiceSlider/Subcomponents/ControlInputs',
  component: ControlInputs,
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#09090b' }],
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ControlInputs>;

export const DefaultRollOver: Story = {
  args: {
    isRollOver: true,
    isRolling: false,
    rawTarget: '50.00',
    rawChance: '50.0000',
    onTargetChange: () => {},
    onTargetBlur: () => {},
    onChanceChange: () => {},
    onChanceBlur: () => {},
    onToggleMode: () => {},
    onRollTrigger: () => {},
  },
};

export const DefaultRollUnder: Story = {
  args: {
    isRollOver: false,
    isRolling: false,
    rawTarget: '40.00',
    rawChance: '40.0000',
    onTargetChange: () => {},
    onTargetBlur: () => {},
    onChanceChange: () => {},
    onChanceBlur: () => {},
    onToggleMode: () => {},
    onRollTrigger: () => {},
  },
};

export const DisabledRollingState: Story = {
  args: {
    isRollOver: true,
    isRolling: true,
    rawTarget: '50.00',
    rawChance: '50.0000',
    onTargetChange: () => {},
    onTargetBlur: () => {},
    onChanceChange: () => {},
    onChanceBlur: () => {},
    onToggleMode: () => {},
    onRollTrigger: () => {},
  },
};
