import React, { useEffect, useRef, useState } from 'react';
import type { RouletteSpinResult } from '../types';
import { RED_NUMBERS, WHEEL_SEQUENCE } from '../rouletteMath';

const NUM_SLOTS = 37;
const CX = 150;
const CY = 150;
const OUTER_R = 132;
const INNER_R = 80;
const TEXT_R = 108;
const BALL_ORBIT_R = 141;
const BALL_SIZE = 5;

function segmentFill(n: number): string {
  if (n === 0) return '#147b3a';
  return RED_NUMBERS.has(n) ? '#c41e1e' : '#1a1a1a';
}

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
  const ballAngleRef = useRef<number>(-Math.PI / 2);
  const rafIdRef = useRef<number | null>(null);
  const [ballPos, setBallPos] = useState(() => posFromAngle(-Math.PI / 2));

  useEffect(() => {
    if (!isSpinning) return;

    let speed = 0.12;

    function frame() {
      speed = Math.max(speed * 0.9998, 0.03);
      ballAngleRef.current -= speed;
      setBallPos(posFromAngle(ballAngleRef.current));
      rafIdRef.current = requestAnimationFrame(frame);
    }

    rafIdRef.current = requestAnimationFrame(frame);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isSpinning]);

  useEffect(() => {
    if (isSpinning || result === null) return;

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    const idx = WHEEL_SEQUENCE.indexOf(result.number as (typeof WHEEL_SEQUENCE)[number]);
    const angle = pocketAngle(idx >= 0 ? idx : 0);
    ballAngleRef.current = angle;

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
    <div className="relative w-full flex flex-col items-center justify-center py-3 sm:py-5">
      <div
        className={`absolute w-48 h-48 sm:w-64 sm:h-64 rounded-full blur-[60px] opacity-20 transition-all duration-500 pointer-events-none
          ${isSpinning ? 'bg-amber-500 animate-pulse' : ''}
          ${!isSpinning && spinStatus === 'win' ? 'bg-emerald-500 opacity-25' : ''}
          ${!isSpinning && spinStatus === 'loss' ? 'bg-rose-600 opacity-10' : ''}
        `}
      />

      <svg
        viewBox="0 0 300 300"
        className="w-full max-w-[220px] sm:max-w-[280px] md:max-w-[320px] drop-shadow-[0_0_24px_rgba(0,0,0,0.85)]"
        aria-hidden="true"
      >
        <circle cx={CX} cy={CY} r={OUTER_R + 12} fill="#1a1005" stroke="#8a6a2a" strokeWidth="2" />
        <circle cx={CX} cy={CY} r={OUTER_R + 6} fill="none" stroke="#3d2c00" strokeWidth="4" />

        <circle
          cx={CX}
          cy={CY}
          r={BALL_ORBIT_R + 2}
          fill="none"
          stroke="#2a2a2a"
          strokeWidth="10"
        />

        {segments.map(({ num, startDeg, endDeg, tx, ty, midDeg, fill, isLanded }) => (
          <g key={num}>
            <path
              d={ringSegmentPath(CX, CY, INNER_R, OUTER_R, startDeg, endDeg)}
              fill={fill}
              stroke="#000"
              strokeWidth="0.5"
            />
            {isLanded && (
              <path
                d={ringSegmentPath(CX, CY, INNER_R, OUTER_R, startDeg, endDeg)}
                fill="rgba(251,191,36,0.28)"
                stroke="#fbbf24"
                strokeWidth="1.5"
              />
            )}
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

        <circle cx={CX} cy={CY} r={INNER_R - 2} fill="#0a0a0a" stroke="#2a2a2a" strokeWidth="1" />

        {/* Gold four-prong spindle */}
        {[0, 90, 180, 270].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <line
              key={deg}
              x1={CX + 14 * Math.cos(rad)}
              y1={CY + 14 * Math.sin(rad)}
              x2={CX + 48 * Math.cos(rad)}
              y2={CY + 48 * Math.sin(rad)}
              stroke="#c9a227"
              strokeWidth="5"
              strokeLinecap="round"
            />
          );
        })}
        <circle cx={CX} cy={CY} r={22} fill="#1a1a1a" stroke="#c9a227" strokeWidth="2" />
        <circle cx={CX} cy={CY} r={10} fill="#d4af37" stroke="#8a6a2a" strokeWidth="1" />
        <circle cx={CX} cy={CY} r={3.5} fill="#f5e6a3" />

        {/* Ball always on the wheel */}
        {!isSpinning && result !== null && (
          <circle
            cx={ballPos.x}
            cy={ballPos.y}
            r={BALL_SIZE + 4}
            fill="rgba(255,255,255,0.12)"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1"
          />
        )}
        <circle
          cx={ballPos.x}
          cy={ballPos.y}
          r={BALL_SIZE}
          fill="#f8fafc"
          stroke="#d1d5db"
          strokeWidth="0.5"
          style={{ filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.9))' }}
        />
        <circle
          cx={ballPos.x - 1.5}
          cy={ballPos.y - 1.5}
          r={1.5}
          fill="rgba(255,255,255,0.75)"
        />
      </svg>

      {!isSpinning && spinStatus !== 'idle' && result && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <span
            className={`px-3 py-1 rounded-md border text-xs font-black uppercase tracking-wider
              ${result.color === 'red' ? 'bg-red-500/20 border-red-500/50 text-red-400' : ''}
              ${result.color === 'black' ? 'bg-zinc-700/30 border-zinc-500/50 text-zinc-100' : ''}
              ${result.color === 'green' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : ''}
            `}
          >
            #{result.number} {result.color}
          </span>
          <span
            className={`px-3 py-1 rounded-md border text-xs font-black uppercase tracking-wider
              ${spinStatus === 'win' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-rose-500/20 border-rose-500/50 text-rose-400'}
            `}
          >
            {spinStatus === 'win' ? `+${result.profit}` : `${result.profit}`}
          </span>
        </div>
      )}
    </div>
  );
};
