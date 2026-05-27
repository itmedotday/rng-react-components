import React from 'react';
import { animated } from '@react-spring/web';
import { D20IcosahedronSvg } from './D20IcosahedronSvg';
import { D20_CENTER_TRIANGLE, D20_HEX_CLIP_PATH } from './d20Geometry';

export interface D20Die3DProps {
  diceSrc?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style: any;
  isRolling: boolean;
  displayValue: string;
  isCritical: boolean;
  isFumble: boolean;
}

const DEPTH_LAYERS = 8;

export const D20Die3D: React.FC<D20Die3DProps> = ({
  diceSrc,
  style,
  isRolling,
  displayValue,
  isCritical,
  isFumble,
}) => {
  const depthLayers = Array.from({ length: DEPTH_LAYERS }, (_, i) => {
    const zOffset = -5 + i;
    return (
      <div
        key={i}
        style={{
          transform: `translateZ(${zOffset}px)`,
          clipPath: D20_HEX_CLIP_PATH,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
        className="absolute inset-[10%] bg-gradient-to-b from-violet-500/80 via-violet-700/90 to-violet-950 border border-violet-600/25"
      />
    );
  });

  return (
    <div className="relative w-44 h-44 select-none cursor-default [perspective:1200px] flex items-center justify-center">
      <animated.div
        style={{
          transformStyle: 'preserve-3d',
          ...style,
        }}
        className="relative w-full h-full"
      >
        {depthLayers}

        <div
          style={{
            transform: 'translateZ(6px)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {diceSrc ? (
            <>
              <img
                src={diceSrc}
                alt=""
                draggable={false}
                className={`absolute inset-0 w-full h-full object-contain pointer-events-none
                  ${isRolling ? 'opacity-90' : 'opacity-100'}
                  ${isFumble ? 'grayscale-[0.35] brightness-75' : ''}
                `}
              />
              <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
                <defs>
                  <clipPath id="d20CenterClip">
                    <path d={D20_CENTER_TRIANGLE} />
                  </clipPath>
                </defs>
                {isRolling && (
                  <g clipPath="url(#d20CenterClip)">
                    <rect
                      x="0"
                      y="0"
                      width="200"
                      height="200"
                      fill="url(#d20-shine-gradient)"
                      className="animate-d20-shine-active"
                      opacity="0.35"
                    />
                  </g>
                )}
                <text
                  x="100"
                  y="100"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#ffffff"
                  fontSize="36"
                  fontWeight="900"
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                  paintOrder="stroke fill"
                  stroke="#0a0a0a"
                  strokeWidth="2"
                >
                  {displayValue}
                </text>
                <defs>
                  <linearGradient id="d20-shine-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="45%" stopColor="rgba(255,255,255,0.45)" />
                    <stop offset="55%" stopColor="rgba(255,255,255,0.45)" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>
            </>
          ) : (
            <D20IcosahedronSvg
              displayValue={displayValue}
              isRolling={isRolling}
              isCritical={isCritical}
              isFumble={isFumble}
              aria-label={isRolling ? 'Die rolling' : `Die showing ${displayValue}`}
            />
          )}
        </div>

        {isCritical && !isRolling && (
          <div
            style={{ transform: 'translateZ(14px)' }}
            className="absolute inset-0 rounded-full border border-amber-400/25 pointer-events-none animate-pulse"
            aria-hidden
          />
        )}
      </animated.div>

      <style>{`
        @keyframes d20ShineSweep {
          0% {
            transform: translate(-30%, -30%) rotate(45deg);
          }
          100% {
            transform: translate(30%, 30%) rotate(45deg);
          }
        }
        .animate-d20-shine-active {
          animation: d20ShineSweep 0.22s linear infinite;
        }
      `}</style>
    </div>
  );
};
