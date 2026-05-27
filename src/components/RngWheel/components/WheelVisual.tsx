import React from 'react';
import { animated } from '@react-spring/web';

export interface WheelVisualProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wheelStyles: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pointerStyles: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  centerStyles: any;
  isSpinning: boolean;
  spinStatus: 'idle' | 'win' | 'loss';
  multiplierDisplay: string;
  winChance: number;
}

export const WheelVisual: React.FC<WheelVisualProps> = ({
  wheelStyles,
  centerStyles,
  isSpinning,
  spinStatus,
  winChance,
}) => {
  // Constants for SVG drawing
  const r = 100;
  const cx = 140;
  const cy = 140;
  const strokeWidth = 20;
  const C = 2 * Math.PI * r; // Circumference ~ 628.318

  return (
    <div className="w-full relative px-6 py-10 bg-zinc-950/40 border border-zinc-900/80 rounded-2xl mb-8 flex flex-col items-center justify-center min-h-[340px]">
      {/* Dynamic Glow Background */}
      <div
        className={`absolute w-64 h-64 rounded-full blur-[50px] opacity-20 transition-all duration-500 pointer-events-none -z-10
          ${isSpinning ? 'bg-indigo-500 animate-pulse' : ''}
          ${!isSpinning && spinStatus === 'win' ? 'bg-emerald-500 blur-[60px] opacity-25' : ''}
          ${!isSpinning && spinStatus === 'loss' ? 'bg-rose-500 opacity-15' : ''}
        `}
      />

      {/* The Wheel SVG Container */}
      <div className="relative w-[280px] h-[280px]">
        {/* Pointer/Indicator Needle (Top, 12 o'clock) — wiggles during spin */}
        <div className="absolute top-[4px] left-[140px] -translate-x-1/2 z-30 pointer-events-none filter drop-shadow-[0_2px_8px_rgba(239,68,68,0.5)]">
          <svg width="20" height="34" viewBox="0 0 20 34" fill="none">
            <path
              d="M 10 33 C 4 25, 1 19, 1 10 A 9 9 0 0 1 19 10 C 19 19, 16 25, 10 33 Z"
              fill="var(--color-brand-red)"
            />
            <circle cx="10" cy="10" r="3.5" fill="white" />
          </svg>
        </div>

        {/* Static Center Panel (The Multiplier display, non-rotating) */}
        <animated.div
          className="absolute top-[80px] left-[80px] w-[120px] h-[120px] rounded-full z-20 select-none bg-zinc-900 border-2 border-zinc-800"
          style={{
            scale: centerStyles.scale,
            boxShadow: centerStyles.boxShadow,
          }}
        />

        {/* Rotating Outer Wheel Ring */}
        <animated.svg
          width="280"
          height="280"
          viewBox="0 0 280 280"
          className="absolute inset-0 z-10 drop-shadow-[0_0_12px_rgba(0,0,0,0.6)]"
          style={{
            transform: wheelStyles.rotate.to((rValue: number) => `rotate(${rValue}deg)`),
          }}
        >
          {/* Outer track border glow */}
          <circle cx={cx} cy={cy} r={r + strokeWidth / 2 + 2} fill="none" stroke="rgba(39, 39, 42, 0.4)" strokeWidth={1} />
          <circle cx={cx} cy={cy} r={r - strokeWidth / 2 - 2} fill="none" stroke="rgba(39, 39, 42, 0.4)" strokeWidth={1} />

          {/* Gray-Blue base track ring (representing the 90% loss region) */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#1e2d3d"
            strokeWidth={strokeWidth}
          />

          {/* Glowing active green segment (representing exactly winChance% of the circle) */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#10b981"
            strokeWidth={strokeWidth}
            strokeDasharray={`${(winChance / 100) * C} ${((100 - winChance) / 100) * C}`}
            strokeLinecap="butt"
            transform={`rotate(${-90 - ((winChance / 100) * 360) / 2} ${cx} ${cy})`}
            className="drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]"
          />
        </animated.svg>

        {/* Dynamic Landing Outcome Badge — centered over the wheel */}
        {!isSpinning && spinStatus !== 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <div
              className={`px-4 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-wider shadow-md
                ${spinStatus === 'win'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                  : 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                }
              `}
            >
              {spinStatus === 'win' ? 'WINNER!' : 'MISSED!'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
