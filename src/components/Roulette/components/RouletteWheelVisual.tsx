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
const BALL_LANDED_R = 135;
const BALL_SIZE = 5;
const TWO_PI = Math.PI * 2;

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

/** Local pocket center on an unrotated wheel (radians, 0 = 3 o'clock). */
function pocketLocalAngle(pocketIndex: number): number {
  return (pocketIndex / NUM_SLOTS) * TWO_PI - Math.PI / 2;
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

function pocketIndexFor(number: number): number {
  const idx = WHEEL_SEQUENCE.indexOf(number as (typeof WHEEL_SEQUENCE)[number]);
  return idx >= 0 ? idx : 0;
}

export interface RouletteWheelVisualProps {
  isSpinning: boolean;
  /** Known at spin start so the ball can ease into the correct pocket. */
  targetNumber?: number | null;
  result: RouletteSpinResult | null;
  spinStatus: 'idle' | 'win' | 'loss';
  spinDuration?: number;
}

export const RouletteWheelVisual: React.FC<RouletteWheelVisualProps> = ({
  isSpinning,
  targetNumber = null,
  result,
  spinStatus,
  spinDuration = 2400,
}) => {
  const ballAngleRef = useRef(-Math.PI / 2);
  const wheelAngleRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const ballGroupRef = useRef<SVGGElement | null>(null);
  const wheelGroupRef = useRef<SVGGElement | null>(null);
  const [outcomeVisible, setOutcomeVisible] = useState(false);

  const applyTransforms = (ballAngle: number, wheelAngle: number, orbitR: number) => {
    if (wheelGroupRef.current) {
      wheelGroupRef.current.setAttribute(
        'transform',
        `rotate(${toDeg(wheelAngle)} ${CX} ${CY})`,
      );
    }
    if (ballGroupRef.current) {
      ballGroupRef.current.setAttribute(
        'transform',
        `rotate(${toDeg(ballAngle)} ${CX} ${CY})`,
      );
      const ball = ballGroupRef.current.querySelector('[data-ball]');
      const shine = ballGroupRef.current.querySelector('[data-shine]');
      const glow = ballGroupRef.current.querySelector('[data-glow]');
      if (ball) {
        ball.setAttribute('cx', String(CX + orbitR));
        ball.setAttribute('cy', String(CY));
      }
      if (shine) {
        shine.setAttribute('cx', String(CX + orbitR - 1.5));
        shine.setAttribute('cy', String(CY - 1.5));
      }
      if (glow) {
        glow.setAttribute('cx', String(CX + orbitR));
        glow.setAttribute('cy', String(CY));
      }
    }
  };

  useEffect(() => {
    applyTransforms(ballAngleRef.current, wheelAngleRef.current, BALL_ORBIT_R);
  }, []);

  useEffect(() => {
    if (!isSpinning || targetNumber === null || targetNumber === undefined) return;

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    // Keep outcome badge hidden while a new animation is in progress.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOutcomeVisible(false);

    const localPocket = pocketLocalAngle(pocketIndexFor(targetNumber));
    const startBall = ballAngleRef.current;
    const startWheel = wheelAngleRef.current;
    const reduced = prefersReducedMotion();
    const duration = reduced ? Math.min(320, spinDuration) : spinDuration;
    const wheelRevs = reduced ? 0.4 : 3.15;
    const ballRevs = reduced ? 0.75 : 6.4;

    // Wheel spins clockwise (angle increases). Ball travels farther (mostly CCW feel).
    const endWheel = startWheel + wheelRevs * TWO_PI;
    // Ball must finish in the winning pocket in world space.
    let endBall = endWheel + localPocket;
    while (startBall - endBall < ballRevs * TWO_PI) {
      endBall -= TWO_PI;
    }

    const t0 = performance.now();

    function frame(now: number) {
      const raw = Math.min(1, (now - t0) / duration);
      const t = easeOutCubic(raw);
      const ballAngle = startBall + (endBall - startBall) * t;
      const wheelAngle = startWheel + (endWheel - startWheel) * t;
      const drop = reduced ? 0 : (BALL_ORBIT_R - BALL_LANDED_R) * Math.max(0, (t - 0.78) / 0.22);
      const orbit = BALL_ORBIT_R - drop;

      ballAngleRef.current = ballAngle;
      wheelAngleRef.current = wheelAngle;
      applyTransforms(ballAngle, wheelAngle, orbit);

      if (raw < 1) {
        rafIdRef.current = requestAnimationFrame(frame);
      } else {
        ballAngleRef.current = endBall;
        wheelAngleRef.current = endWheel;
        applyTransforms(endBall, endWheel, BALL_LANDED_R);
        rafIdRef.current = null;
      }
    }

    rafIdRef.current = requestAnimationFrame(frame);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isSpinning, targetNumber, spinDuration]);

  useEffect(() => {
    if (isSpinning || !result) {
      if (!result) {
        // Clear stale outcome text whenever upstream result is reset.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setOutcomeVisible(false);
      }
      return;
    }

    const localPocket = pocketLocalAngle(pocketIndexFor(result.number));
    const ballAngle = wheelAngleRef.current + localPocket;
    ballAngleRef.current = ballAngle;
    applyTransforms(ballAngle, wheelAngleRef.current, BALL_LANDED_R);
    setOutcomeVisible(true);
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
        className={`absolute w-48 h-48 sm:w-64 sm:h-64 rounded-full blur-[60px] pointer-events-none transition-opacity duration-500
          ${isSpinning ? 'bg-amber-500/35 opacity-100 roulette-glow-spin' : 'opacity-40'}
          ${!isSpinning && spinStatus === 'win' ? 'bg-emerald-500 opacity-30' : ''}
          ${!isSpinning && spinStatus === 'loss' ? 'bg-rose-600 opacity-15' : ''}
          ${!isSpinning && spinStatus === 'idle' ? 'bg-amber-900/40' : ''}
        `}
      />

      <svg
        viewBox="0 0 300 300"
        className={`w-full max-w-[220px] sm:max-w-[280px] md:max-w-[320px] drop-shadow-[0_0_24px_rgba(0,0,0,0.85)] transition-transform duration-500 ease-out
          ${isSpinning ? 'scale-[1.03]' : 'scale-100'}
        `}
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

        <g ref={wheelGroupRef}>
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
                  className="roulette-landed-pulse"
                  d={ringSegmentPath(CX, CY, INNER_R, OUTER_R, startDeg, endDeg)}
                  fill="rgba(251,191,36,0.3)"
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
        </g>

        <g ref={ballGroupRef}>
          {!isSpinning && result !== null && (
            <circle
              data-glow
              cx={CX + BALL_LANDED_R}
              cy={CY}
              r={BALL_SIZE + 4}
              fill="rgba(255,255,255,0.12)"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1"
            />
          )}
          <circle
            data-ball
            cx={CX + BALL_ORBIT_R}
            cy={CY}
            r={BALL_SIZE}
            fill="#f8fafc"
            stroke="#d1d5db"
            strokeWidth="0.5"
            style={{ filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.9))' }}
          />
          <circle
            data-shine
            cx={CX + BALL_ORBIT_R - 1.5}
            cy={CY - 1.5}
            r={1.5}
            fill="rgba(255,255,255,0.75)"
          />
        </g>
      </svg>

      {outcomeVisible && !isSpinning && spinStatus !== 'idle' && result && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 roulette-outcome-in">
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
