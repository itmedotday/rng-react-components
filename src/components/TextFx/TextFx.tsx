import React, { useCallback, useId, useMemo, useState } from 'react';
import { FxChipRow } from './components/FxChipRow';
import { FxCodeTag } from './components/FxCodeTag';
import { FxPreview } from './components/FxPreview';
import {
  buildFxTag,
  FX_COLORS,
  FX_EFFECT_IDS,
  type FxColorId,
  type FxEffectId,
  type TextFxProps,
} from './types';

const COLOR_IDS = FX_COLORS.map((c) => c.id);

const RAINBOW_SWATCH =
  'linear-gradient(90deg,#e34b4b,#ee8d2c,#ecc24e,#46a832,#46c8d2,#3f6fd6,#b455c8)';

/** Decorative dot preceding each colour chip; the chip's text carries the meaning. */
function ColorSwatch({ id }: { id: FxColorId }) {
  const def = FX_COLORS.find((c) => c.id === id);

  const style: React.CSSProperties =
    id === 'rainbow'
      ? { backgroundImage: RAINBOW_SWATCH }
      : id === 'inverted'
        ? { background: 'transparent', border: '1.5px solid #d8cdb4' }
        : { background: def?.hex ?? undefined };

  return (
    <span
      aria-hidden
      className="h-3.5 w-3.5 shrink-0 rounded-full"
      style={style}
    />
  );
}

/**
 * RuneScape-style chat text renderer: pick a colour and an effect, watch it
 * move, copy the resulting tag.
 *
 * Each of `value`, `color`, and `effect` is independently controlled or
 * uncontrolled. Requires `@itme.day/rng-react-components/style.css` for the
 * keyframes. No font is bundled -- pass `fontFamily` to supply a pixel face.
 */
export const TextFx: React.FC<TextFxProps> = ({
  value,
  defaultValue = 'Nat 20!',
  onChange,
  color,
  defaultColor = 'rainbow',
  onColorChange,
  effect,
  defaultEffect = 'wave',
  onEffectChange,
  maxLength = 24,
  onCopy,
  fontFamily,
  className = '',
}) => {
  const inputId = useId();

  const [textState, setTextState] = useState(defaultValue);
  const [colorState, setColorState] = useState<FxColorId>(defaultColor);
  const [effectState, setEffectState] = useState<FxEffectId>(defaultEffect);

  const text = value ?? textState;
  const activeColor = color ?? colorState;
  const activeEffect = effect ?? effectState;

  const handleText = useCallback(
    (next: string) => {
      const clamped = next.slice(0, maxLength);
      if (value === undefined) setTextState(clamped);
      onChange?.(clamped);
    },
    [value, maxLength, onChange],
  );

  const handleColor = useCallback(
    (next: FxColorId) => {
      if (color === undefined) setColorState(next);
      onColorChange?.(next);
    },
    [color, onColorChange],
  );

  const handleEffect = useCallback(
    (next: FxEffectId) => {
      if (effect === undefined) setEffectState(next);
      onEffectChange?.(next);
    },
    [effect, onEffectChange],
  );

  const codeTag = useMemo(
    () => buildFxTag(text, activeColor, activeEffect),
    [text, activeColor, activeEffect],
  );

  return (
    <div className={`flex flex-col gap-0 ${className}`}>
      <div className="fx-stage flex min-h-[150px] items-center justify-center overflow-hidden px-5 py-11">
        <div className="max-w-full text-[44px] leading-tight text-white">
          <FxPreview
            text={text}
            color={activeColor}
            effect={activeEffect}
            fontFamily={fontFamily}
          />
        </div>
      </div>

      <FxCodeTag value={codeTag} onCopy={onCopy} className="mb-6 mt-3.5" />

      <label
        htmlFor={inputId}
        className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-zinc-500"
      >
        Message
      </label>
      <input
        id={inputId}
        value={text}
        maxLength={maxLength}
        onChange={(e) => handleText(e.target.value)}
        placeholder="Type a message…"
        className="mb-5 h-11 w-full rounded-[10px] border border-zinc-800 bg-[rgba(10,10,12,0.6)] px-3.5 font-sans text-[15px] text-zinc-50 outline-none ring-indigo-500 focus:ring-1"
      />

      <FxChipRow
        label="Colour"
        variant="gobby"
        options={COLOR_IDS}
        value={activeColor}
        onSelect={handleColor}
        renderSwatch={(id) => <ColorSwatch id={id} />}
        className="mb-5"
      />

      <FxChipRow
        label="Effect"
        variant="rng"
        options={FX_EFFECT_IDS}
        value={activeEffect}
        onSelect={handleEffect}
      />
    </div>
  );
};
