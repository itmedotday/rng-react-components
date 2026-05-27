import React from 'react';
import { animated } from '@react-spring/web';


export interface Coin3DProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style: any; // Animated react-spring styles containing rotateY, scale, and rotateX
  isRolling: boolean;
}

export const Coin3D: React.FC<Coin3DProps> = ({ style, isRolling }) => {
  // Helper to generate the golden-orange depth layers to build a realistic 3D edge
  const edgeLayers = Array.from({ length: 9 }, (_, i) => {
    const zOffset = -4 + i; // Spanning from -4px to +4px
    return (
      <div
        key={i}
        style={{
          transform: `translateZ(${zOffset}px)`,
        }}
        className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 border border-amber-600/30"
      />
    );
  });

  return (
    <div className="relative w-40 h-40 select-none cursor-default [perspective:1200px] flex items-center justify-center">
      {/* 3D Coin Inner Wrapper */}
      <animated.div
        style={{
          transformStyle: 'preserve-3d',
          ...style,
        }}
        className="relative w-full h-full select-none"
      >
        {/* Render 3D edge depth spacer layers */}
        {edgeLayers}

        {/* --- FRONT FACE: ORANGE (Heads / "O") --- */}
        <div
          style={{
            transform: 'translateZ(4px)',
            backfaceVisibility: 'hidden',
          }}
          className="absolute inset-0 rounded-full bg-zinc-950 border-[12px] border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2),inset_0_0_15px_rgba(245,158,11,0.3)] flex items-center justify-center overflow-hidden"
        >
          {/* Inner cutout ring decoration matching Image 1 */}
          <div className="w-16 h-16 rounded-full bg-zinc-950 border-4 border-amber-600/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]" />

          {/* Dynamic Metallic Shine Overlay */}
          <div
            className={`absolute -inset-y-1/2 -left-1/2 w-[200%] bg-gradient-to-r from-transparent via-white/20 to-transparent transform rotate-45 pointer-events-none
              ${isRolling ? 'animate-shine-active' : 'opacity-10'}
            `}
            style={{
              transition: 'opacity 0.3s ease',
            }}
          />
        </div>

        {/* --- BACK FACE: BLUE (Tails / "Diamond") --- */}
        <div
          style={{
            transform: 'rotateY(180deg) translateZ(4px)',
            backfaceVisibility: 'hidden',
          }}
          className="absolute inset-0 rounded-full bg-zinc-950 border-[12px] border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2),inset_0_0_15px_rgba(59,130,246,0.3)] flex items-center justify-center overflow-hidden"
        >
          {/* Central Diamond Cutout decoration matching Image 2 */}
          <div className="w-12 h-12 rotate-45 rounded bg-zinc-950 border-4 border-blue-600/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]" />

          {/* Dynamic Metallic Shine Overlay */}
          <div
            className={`absolute -inset-y-1/2 -left-1/2 w-[200%] bg-gradient-to-r from-transparent via-white/20 to-transparent transform rotate-45 pointer-events-none
              ${isRolling ? 'animate-shine-active' : 'opacity-10'}
            `}
            style={{
              transition: 'opacity 0.3s ease',
            }}
          />
        </div>
      </animated.div>

      {/* Embedded slide-in / spin CSS animations for the metallic sheen */}
      <style>{`
        @keyframes shineSweep {
          0% {
            transform: translate(-30%, -30%) rotate(45deg);
          }
          100% {
            transform: translate(30%, 30%) rotate(45deg);
          }
        }
        .animate-shine-active {
          animation: shineSweep 0.25s linear infinite;
        }
      `}</style>
    </div>
  );
};
