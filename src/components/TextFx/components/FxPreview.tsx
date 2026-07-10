import React from 'react';
import { FX_COLORS, FX_DEFAULT_GLOW, FX_EFFECTS, type FxPreviewProps } from '../types';

/** Inline style carrying the runtime glow colour read by `@keyframes fxGlow`. */
type GlowStyle = React.CSSProperties & { '--glow'?: string };

/**
 * Renders `text` with the chosen colour and effect.
 *
 * Presentational and stateless. Character animations are applied via inline
 * `animation` shorthand so each character can carry an index-derived stagger
 * delay; the keyframes themselves live in the package stylesheet.
 */
export const FxPreview: React.FC<FxPreviewProps> = ({
  text,
  color,
  effect,
  fontFamily,
  className = '',
}) => {
  const spec = FX_EFFECTS[effect];
  const colorDef = FX_COLORS.find((c) => c.id === color);
  const glowColor = colorDef?.hex ?? FX_DEFAULT_GLOW;

  // A lone space keeps the stage from collapsing when the message is cleared.
  const chars = [...(text || ' ')].map((ch, i) => {
    const style: React.CSSProperties = {
      display: 'inline-block',
      whiteSpace: 'pre',
    };

    const anims: string[] = [];
    if (spec.kind === 'char') {
      anims.push(
        `${spec.kf} ${spec.dur} ease-in-out infinite ${(i * spec.step).toFixed(2)}s`,
      );
    }
    if (color === 'rainbow') {
      anims.push(`fxRainbow 1.6s linear infinite ${(i * 0.09).toFixed(2)}s`);
    }
    if (anims.length) style.animation = anims.join(', ');

    if (color === 'inverted') {
      style.color = 'transparent';
      style.WebkitTextStroke = '1px #d8cdb4';
    } else if (color !== 'rainbow' && colorDef?.hex) {
      style.color = colorDef.hex;
    }

    return (
      <span key={i} style={style}>
        {ch}
      </span>
    );
  });

  const innerStyle: GlowStyle = {};
  if (spec.kind === 'inner') {
    innerStyle.animation = spec.anim;
    if (effect === 'glow') innerStyle['--glow'] = glowColor;
  }

  const wrapStyle: React.CSSProperties = {
    display: 'inline-block',
    whiteSpace: 'nowrap',
  };
  // Left unset when omitted, so the preview inherits the surrounding font.
  if (fontFamily) wrapStyle.fontFamily = fontFamily;
  if (spec.kind === 'wrap') wrapStyle.animation = spec.anim;
  if (spec.kind === 'static') wrapStyle.transform = spec.transform;

  return (
    <span className={className} style={wrapStyle} data-testid="fx-preview">
      <span style={innerStyle}>{chars}</span>
    </span>
  );
};
