import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useSpring } from '@react-spring/web';
import { WheelVisual } from './WheelVisual';

type WheelVisualStoryArgs = {
  wheelRotate: number;
  pointerRotate: number;
  centerScale: number;
  centerBoxShadow: string;
  isSpinning: boolean;
  spinStatus: 'idle' | 'win' | 'loss';
  multiplierDisplay: string;
};

const WheelVisualWrapper = (args: WheelVisualStoryArgs) => {
  const wheelStyles = useSpring({ rotate: args.wheelRotate });
  const pointerStyles = useSpring({ rotate: args.pointerRotate });
  const centerStyles = useSpring({
    scale: args.centerScale,
    boxShadow: args.centerBoxShadow,
  });

  return (
    <WheelVisual
      wheelStyles={wheelStyles}
      pointerStyles={pointerStyles}
      centerStyles={centerStyles}
      isSpinning={args.isSpinning}
      spinStatus={args.spinStatus}
      multiplierDisplay={args.multiplierDisplay}
    />
  );
};

const meta: Meta<typeof WheelVisualWrapper> = {
  title: 'Components/RngWheel/Submodules/WheelVisual',
  component: WheelVisualWrapper,
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
type Story = StoryObj<typeof WheelVisualWrapper>;

export const Idle: Story = {
  args: {
    wheelRotate: 0,
    pointerRotate: 0,
    centerScale: 1,
    centerBoxShadow: '0 0 15px rgba(99, 102, 241, 0.1)',
    isSpinning: false,
    spinStatus: 'idle',
    multiplierDisplay: '0.00x',
  },
};

export const Spinning: Story = {
  args: {
    wheelRotate: 360,
    pointerRotate: -6,
    centerScale: 1,
    centerBoxShadow: '0 0 15px rgba(99, 102, 241, 0.1)',
    isSpinning: true,
    spinStatus: 'idle',
    multiplierDisplay: '4.82x',
  },
};

export const Win: Story = {
  args: {
    wheelRotate: 0,
    pointerRotate: 0,
    centerScale: 1.1,
    centerBoxShadow: '0 0 25px rgba(16, 185, 129, 0.6)',
    isSpinning: false,
    spinStatus: 'win',
    multiplierDisplay: '10.00x',
  },
};

export const Loss: Story = {
  args: {
    wheelRotate: 180,
    pointerRotate: 0,
    centerScale: 1,
    centerBoxShadow: '0 0 10px rgba(225, 29, 72, 0.4)',
    isSpinning: false,
    spinStatus: 'loss',
    multiplierDisplay: '0.00x',
  },
};
