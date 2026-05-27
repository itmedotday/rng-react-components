import React, { useId } from 'react';
import {
  D20_CENTER_TRIANGLE,
  D20_FACET_PATHS,
  D20_GRADIENT_STOPS,
  D20_TEXT_ANCHOR,
  D20_VIEWBOX,
  type D20FacetGradientKey,
} from './d20Geometry';

export interface D20IcosahedronSvgProps {
  displayValue: string;
  isRolling: boolean;
  isCritical: boolean;
  isFumble: boolean;
  className?: string;
  'aria-label'?: string;
}

export const D20IcosahedronSvg: React.FC<D20IcosahedronSvgProps> = ({
  displayValue,
  isRolling,
  isCritical,
  isFumble,
  className = '',
  'aria-label': ariaLabel,
}) => {
  const uid = useId().replace(/:/g, '');
  const gradId = (key: D20FacetGradientKey) => `d20-${uid}-g-${key}`;
  const clipId = `d20-${uid}-center-clip`;
  const filterId = `d20-${uid}-text-shadow`;

  const textFill = isRolling
    ? '#e9d5ff'
    : isCritical
      ? '#fcd34d'
      : isFumble
        ? '#a1a1aa'
        : '#ffffff';

  const centerStroke = isCritical ? '#fbbf24' : isFumble ? '#71717a' : '#c4b5fd';

  return (
    <svg
      viewBox={`0 0 ${D20_VIEWBOX.width} ${D20_VIEWBOX.height}`}
      className={`w-full h-full pointer-events-none drop-shadow-[0_8px_28px_rgba(124,58,237,0.35)] ${className}`}
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      aria-live="polite"
      role={ariaLabel ? 'img' : undefined}
    >
      <defs>
        {(Object.keys(D20_GRADIENT_STOPS) as D20FacetGradientKey[]).map((key) => (
          <linearGradient key={key} id={gradId(key)} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop stopColor={D20_GRADIENT_STOPS[key].stops[0]} />
            <stop offset="1" stopColor={D20_GRADIENT_STOPS[key].stops[1]} />
          </linearGradient>
        ))}
        <clipPath id={clipId}>
          <path d={D20_CENTER_TRIANGLE} />
        </clipPath>
        <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.85" />
        </filter>
      </defs>

      <g className={isFumble ? 'opacity-75' : undefined}>
        {D20_FACET_PATHS.map((facet) => (
          <path
            key={facet.id}
            d={facet.d}
            fill={`url(#${gradId(facet.gradient)})`}
            stroke="#5b21b6"
            strokeWidth={facet.id === 'center' ? 1.5 : 1.2}
            strokeLinejoin="round"
          />
        ))}
      </g>

      <path
        d={D20_CENTER_TRIANGLE}
        fill="none"
        stroke={centerStroke}
        strokeWidth={isCritical ? 2 : 1.5}
        strokeLinejoin="round"
      />

      {isRolling && (
        <g clipPath={`url(#${clipId})`}>
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
        x={D20_TEXT_ANCHOR.x}
        y={D20_TEXT_ANCHOR.y}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={textFill}
        fontSize="36"
        fontWeight="900"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
        paintOrder="stroke fill"
        stroke="#0a0a0a"
        strokeWidth="2"
        filter={`url(#${filterId})`}
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
  );
};
