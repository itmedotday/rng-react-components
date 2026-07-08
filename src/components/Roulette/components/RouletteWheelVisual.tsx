import React, { useEffect, useRef, useState } from 'react';
import type { RouletteSpinResult } from '../types';

/** Standard European single-zero roulette wheel sequence (clockwise from top). */
const WHEEL_SEQUENCE = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36,
  11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9,
  22, 18, 29, 7, 28, 12, 35, 3, 26,
];

const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

const NUM_SLOTS = 37;
const CX = 150;
const CY = 150;
/** Outer radius of the numbered ring */
const OUTER_R = 132;
/** Inner radius of the numbered ring */
const INNER_R = 80;
/** Radius at which the number text is centred */
const TEXT_R = 108;
/** Radius of the ball's circular orbit path */
const BALL_ORBIT_R = 141;
/** Radius of the ball circle itself */
const BALL_SIZE = 5;

function segmentFill(n: number): string {
  if (n === 0) return '#16a34a';
  return RED_NUMBERS.has(n) ? '#b91c1c' : '#111827';
}

/**
 * Returns the SVG arc-path string for a ring segment between two radii and
 * two angles (in degrees, measured from the positive-x axis).
 */
function ringSegmentPath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startDeg: number,
  endDeg: number,
): string {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const s = toRad(startDeg);
  const e = toRad(endDeg);

  const x1 = cx + outerR * Math.cos(s);
  const y1 = cy + outerR * Math.sin(s);
  const x2 = cx + outerR * Math.cos(e);
  const y2 = cy + outerR * Math.sin(e);
  const x3 = cx + innerR * Math.cos(e);
  const y3 = cy + innerR * Math.sin(e);
  const x4 = cx + innerR * Math.cos(s);
  const y4 = cy + innerR * Math.sin(s);

  return [
    `M ${x1} ${y1}`,
    `A ${outerR} ${outerR} 0 0 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${innerR} ${innerR} 0 0 0 ${x4} ${y4}`,
    'Z',
  ].join(' ');
}

function pocketAngle(pocketIndex: number): number {
  return (pocketIndex / NUM_SLOTS) * 2 * Math.PI - Math.PI / 2;
}

function posFromAngle(angle: number) {
  return {
    x: CX + BALL_ORBIT_R * Math.cos(angle),
    y: CY + BALL_ORBIT_R * Math.sin(angle),
  };
}

export interface RouletteWheelVisualProps {
  isSpinning: boolean;
  result: RouletteSpinResult | null;
  spinStatus: 'idle' | 'win' | 'loss';
}

export const RouletteWheelVisual: React.FC<RouletteWheelVisualProps> = ({
  isSpinning,
  result,
  spinStatus,
}) => {
  const ballAngleRef = useRef<number>(-Math.PI / 2); // start at top (12 o'clock)
  const rafIdRef = useRef<number | null>(null);
  const [ballPos, setBallPos] = useState(() => posFromAngle(-Math.PI / 2));

  // Ball is visible as soon as the wheel has been spun at least once
  const ballVisible = isSpinning || result !== null;

  // Animate ball while spinning — setState only inside rAF callback (not in effect body)
  useEffect(() => {
    if (!isSpinning) return;

    let speed = 0.12; // radians per frame (~7.2°/frame at 60fps)

    function frame() {
      // Very gradual decel so the ball is still moving when the spin resolves
      speed = Math.max(speed * 0.9998, 0.03);
      ballAngleRef.current -= speed; // counter-clockwise orbit
      setBallPos(posFromAngle(ballAngleRef.current));
      rafIdRef.current = requestAnimationFrame(frame);
    }

    // Start loop via rAF — setState is only ever called from within the callback
    rafIdRef.current = requestAnimationFrame(frame);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isSpinning]);

  // Snap ball to the landed pocket once the spin resolves
  useEffect(() => {
    if (isSpinning || result === null) return;

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    const idx = WHEEL_SEQUENCE.indexOf(result.number);
    const angle = pocketAngle(idx);
    ballAngleRef.current = angle;

    // Wrap in rAF so setState is called from a subscription callback, not synchronously
    rafIdRef.current = requestAnimationFrame(() => {
      setBallPos(posFromAngle(angle));
      rafIdRef.current = null;
    });

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isSpinning, result]);

  // Build segment data
  const segments = WHEEL_SEQUENCE.map((num, i) => {
    const segDeg = 360 / NUM_SLOTS;
    const startDeg = i * segDeg - 90;
    const endDeg = (i + 1) * segDeg - 90;
    const midDeg = startDeg + segDeg / 2;
    const midRad = (midDeg * Math.PI) / 180;
    const tx = CX + TEXT_R * Math.cos(midRad);
    const ty = CY + TEXT_R * Math.sin(midRad);
    const isLanded = !isSpinning && result !== null && num === result.number;

    return { num, startDeg, endDeg, tx, ty, midDeg, fill: segmentFill(num), isLanded };
  });

  return (
    <div className="w-full relative px-6 py-6 bg-zinc-950/40 border border-zinc-900/80 rounded-2xl mb-4 flex flex-col items-center justify-center min-h-[320px]">
      {/* Ambient glow */}
      <div
        className={`absolute w-64 h-64 rounded-full blur-[60px] opacity-15 transition-all duration-500 pointer-events-none -z-10
          ${isSpinning ? 'bg-red-500 animate-pulse' : ''}
          ${!isSpinning && spinStatus === 'win' ? 'bg-emerald-500 opacity-20' : ''}
          ${!isSpinning && spinStatus === 'loss' ? 'bg-rose-600 opacity-10' : ''}
        `}
      />

      <svg
        width="300"
        height="300"
        viewBox="0 0 300 300"
        className="drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]"
        aria-hidden="true"
      >
        {/* Outer backing ring */}
        <circle cx={CX} cy={CY} r={OUTER_R + 10} fill="#1a1005" stroke="#3d2c00" strokeWidth="1.5" />

        {/* Ball track groove */}
        <circle
          cx={CX}
          cy={CY}
          r={BALL_ORBIT_R + 2}
          fill="none"
          stroke="#2a2a2a"
          strokeWidth="9"
        />

        {/* Number segments */}
        {segments.map(({ num, startDeg, endDeg, tx, ty, midDeg, fill, isLanded }) => (
          <g key={num}>
            <path
              d={ringSegmentPath(CX, CY, INNER_R, OUTER_R, startDeg, endDeg)}
              fill={fill}
              stroke="#000"
              strokeWidth="0.5"
            />
            {/* Gold highlight border on landed segment */}
            {isLanded && (
              <path
                d={ringSegmentPath(CX, CY, INNER_R, OUTER_R, startDeg, endDeg)}
                fill="rgba(251,191,36,0.25)"
                stroke="#fbbf24"
                strokeWidth="1.5"
              />
            )}
            {/* Number text — rotated to align radially */}
            <text
              x={tx}
              y={ty}
              textAnchor="middle"
              dominantBaseline="central"
              transform={`rotate(${midDeg + 90} ${tx} ${ty})`}
              fill="white"
              fontSize={num === 0 ? '7' : '6.5'}
              fontWeight="bold"
              fontFamily="monospace"
            >
              {num}
            </text>
          </g>
        ))}

        {/* Inner hub background */}
        <circle cx={CX} cy={CY} r={INNER_R - 2} fill="#0f0f0f" stroke="#2a2a2a" strokeWidth="1" />

        {/* Hub decorative spokes */}
        {[0, 60, 120, 180, 240, 300].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <line
              key={deg}
              x1={CX + (INNER_R - 4) * Math.cos(rad)}
              y1={CY + (INNER_R - 4) * Math.sin(rad)}
              x2={CX + 22 * Math.cos(rad)}
              y2={CY + 22 * Math.sin(rad)}
              stroke="#2a2a2a"
              strokeWidth="2"
            />
          );
        })}
        <circle cx={CX} cy={CY} r={18} fill="#1a1a1a" stroke="#333" strokeWidth="1" />
        <circle cx={CX} cy={CY} r={7} fill="#3d3d3d" />

        {/* Spinning ball */}
        {ballVisible && (
          <>
            {/* Subtle glow ring around ball when landed */}
            {!isSpinning && result !== null && (
              <circle
                cx={ballPos.x}
                cy={ballPos.y}
                r={BALL_SIZE + 4}
                fill="rgba(255,255,255,0.1)"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1"
              />
            )}
            <circle
              cx={ballPos.x}
              cy={ballPos.y}
              r={BALL_SIZE}
              fill="white"
              stroke="#d1d5db"
              strokeWidth="0.5"
              style={{ filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.9))' }}
            />
            {/* Ball shine */}
            <circle
              cx={ballPos.x - 1.5}
              cy={ballPos.y - 1.5}
              r={1.5}
              fill="rgba(255,255,255,0.7)"
            />
          </>
        )}
      </svg>

      {/* Outcome badge overlaid below wheel */}
      {!isSpinning && spinStatus !== 'idle' && result && (
        <div className="mt-2 flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full border text-xs font-black uppercase tracking-wider
              ${result.color === 'red' ? 'bg-red-500/20 border-red-500/50 text-red-400' : ''}
              ${result.color === 'black' ? 'bg-zinc-700/30 border-zinc-500/50 text-zinc-100' : ''}
              ${result.color === 'green' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : ''}
            `}
          >
            #{result.number} {result.color}
          </span>
          <span
            className={`px-3 py-1 rounded-full border text-xs font-black uppercase tracking-wider
              ${spinStatus === 'win' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-rose-500/20 border-rose-500/50 text-rose-400'}
            `}
          >
            {spinStatus === 'win' ? 'WIN!' : 'MISS'}
          </span>
        </div>
      )}
    </div>
  );
};
