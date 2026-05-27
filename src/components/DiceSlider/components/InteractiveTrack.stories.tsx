import type { Meta, StoryObj } from '@storybook/react-vite';
import { InteractiveTrack } from './InteractiveTrack';
import React from 'react';

// Dummy trackRef to satisfy strict TS typings in stories
const mockTrackRef = React.createRef<HTMLDivElement>();

const meta: Meta<typeof InteractiveTrack> = {
  title: 'Components/DiceSlider/Subcomponents/InteractiveTrack',
  component: InteractiveTrack,
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#09090b' }],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    trackRef: {
      table: {
        disable: true,
      },
      control: false,
    },
  },
  render: (args) => <InteractiveTrack {...args} trackRef={mockTrackRef} />,
};

export default meta;
type Story = StoryObj<typeof InteractiveTrack>;

export const RollOverFifty: Story = {
  args: {
    rollTarget: 50.00,
    isRollOver: true,
    isRolling: false,
    onMouseDown: () => {},
    onTouchStart: () => {},
    thumbStyles: { scale: 1.0, boxShadow: '0 0 10px rgba(99, 102, 241, 0.3)' },
  },
};

export const RollUnderThirtyFive: Story = {
  args: {
    rollTarget: 35.00,
    isRollOver: false,
    isRolling: false,
    onMouseDown: () => {},
    onTouchStart: () => {},
    thumbStyles: { scale: 1.0, boxShadow: '0 0 10px rgba(99, 102, 241, 0.3)' },
  },
};

export const ActiveRollingState: Story = {
  args: {
    rollTarget: 75.00,
    isRollOver: true,
    isRolling: true,
    onMouseDown: () => {},
    onTouchStart: () => {},
    thumbStyles: { scale: 1.0, opacity: 0.8 },
  },
};


// --- Interactive Drag Test Wrapper Subcomponent ---
const InteractiveTrackWrapper = () => {
  const [rollTarget, setRollTarget] = React.useState(50.00);
  const [isDragging, setIsDragging] = React.useState(false);
  const trackRef = React.useRef<HTMLDivElement>(null);

  const updateFromCoordinates = (clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const rawPct = (relativeX / rect.width) * 100;
    const clampedPct = Math.max(0, Math.min(100, rawPct));
    setRollTarget(parseFloat(clampedPct.toFixed(2)));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateFromCoordinates(e.clientX);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      updateFromCoordinates(moveEvent.clientX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateFromCoordinates(e.touches[0].clientX);

    const handleTouchMove = (moveEvent: TouchEvent) => {
      updateFromCoordinates(moveEvent.touches[0].clientX);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
  };

  return (
    <div className="w-full max-w-xl mx-auto glass-panel p-6 rounded-2xl bg-zinc-950/20">
      <InteractiveTrack
        rollTarget={rollTarget}
        isRollOver={true}
        isRolling={false}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        trackRef={trackRef}
        thumbStyles={{
          scale: isDragging ? 1.25 : 1.0,
          boxShadow: isDragging 
            ? '0 0 20px rgba(99, 102, 241, 0.8), inset 0 0 8px rgba(255, 255, 255, 0.4)' 
            : '0 0 10px rgba(99, 102, 241, 0.3), inset 0 0 4px rgba(255, 255, 255, 0.2)',
        }}
      />
      <div className="text-zinc-500 text-xs font-black tracking-wide text-center uppercase select-none">
        Target Value: <span className="text-indigo-400 font-mono text-sm">{rollTarget.toFixed(2)}</span>
      </div>
    </div>
  );
};

export const InteractiveDragTest: Story = {
  render: () => <InteractiveTrackWrapper />,
};
