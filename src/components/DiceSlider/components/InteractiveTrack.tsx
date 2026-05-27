import React from 'react';
import { animated } from '@react-spring/web';

export interface InteractiveTrackProps {
  rollTarget: number;
  isRollOver: boolean;
  isRolling: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
  trackRef: React.RefObject<HTMLDivElement | null>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  thumbStyles: any; // React Spring animated style config
  children?: React.ReactNode; // Houses the outcome badge
}

export const InteractiveTrack: React.FC<InteractiveTrackProps> = ({
  rollTarget,
  isRollOver,
  isRolling,
  onMouseDown,
  onTouchStart,
  trackRef,
  thumbStyles,
  children,
}) => {
  const trackGradientStyle = {
    background: isRollOver
      ? `linear-gradient(to right, #E11D48 0%, #E11D48 ${rollTarget}%, #10B981 ${rollTarget}%, #10B981 100%)`
      : `linear-gradient(to right, #10B981 0%, #10B981 ${rollTarget}%, #E11D48 ${rollTarget}%, #E11D48 100%)`
  };

  return (
    <div className="w-full relative px-6 py-12 bg-zinc-950/40 border border-zinc-900/80 rounded-2xl mb-8 flex flex-col justify-center min-h-[220px]">
      
      {/* Tick labels */}
      <div className="w-full flex justify-between text-zinc-500 text-sm font-black px-1 mb-4 select-none">
        <span>0</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span>100</span>
      </div>

      {/* Interactive custom track */}
      <div
        ref={trackRef}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        style={trackGradientStyle}
        className={`h-4 w-full rounded-full cursor-pointer relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] group transition-all duration-300
          ${isRolling ? 'opacity-80 cursor-not-allowed pointer-events-none' : ''}
        `}
      >
        {/* Track backdrop shadow */}
        <div className="absolute inset-0 rounded-full bg-black/10 blur-[1px] pointer-events-none" />

        {/* Dynamic thumb handle */}
        <animated.div
          style={{
            left: `${rollTarget}%`,
            transform: 'translateX(-50%)',
            ...thumbStyles
          }}
          role="slider"
          aria-valuenow={rollTarget}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Dice Slider Thumb"
          className="absolute top-1/2 -translate-y-1/2 w-8 h-10 bg-indigo-500 border-2 border-indigo-400 rounded-lg cursor-grab active:cursor-grabbing flex flex-col justify-center items-center gap-0.5 select-none"
        >
          {/* Ridges */}
          <div className="w-0.5 h-4 bg-indigo-200/60 rounded-full" />
          <div className="w-0.5 h-4 bg-indigo-200/60 rounded-full" />
          <div className="w-0.5 h-4 bg-indigo-200/60 rounded-full" />
        </animated.div>

        {children}
      </div>
    </div>
  );
};
