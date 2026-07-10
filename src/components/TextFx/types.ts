import type { ReactNode } from 'react';
import type { ConsoleLayoutOptions } from '../../lib/layoutOptions';

/** Chat colour applied to the rendered message. */
export type FxColorId =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'cyan'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'brown'
  | 'grey'
  | 'white'
  | 'inverted'
  | 'rainbow';

/** Motion applied to the rendered message. */
export type FxEffectId =
  | 'none'
  | 'wave'
  | 'wave2'
  | 'wave3'
  | 'shake'
  | 'shake2'
  | 'glow'
  | 'flash'
  | 'scroll'
  | 'scroll2'
  | 'slide'
  | 'slide2'
  | 'mirror';

/**
 * How an effect attaches to the DOM.
 *
 * - `char`   one animation per character, staggered by `step` seconds
 * - `inner`  a single animation on the span wrapping all characters
 * - `wrap`   a single animation on the outermost span
 * - `static` a non-animated transform on the outermost span
 */
export type FxSpec =
  | { kind: 'none' }
  | { kind: 'char'; kf: string; dur: string; step: number }
  | { kind: 'inner'; anim: string }
  | { kind: 'wrap'; anim: string }
  | { kind: 'static'; transform: string };

/**
 * Suggested preview font stack.
 *
 * No font is bundled with this package: the effect is a pixel/bitmap chat face,
 * and shipping one would mean redistributing a third-party font. `TextFx`
 * therefore inherits the surrounding font by default. Pass `fontFamily` (or a
 * `className`) to supply your own -- any pixel face reads well here.
 *
 * This constant is only a convenience for consumers that self-host a face named
 * "Goblin UF"; it is not applied unless you pass it.
 */
export const SUGGESTED_FONT_STACK = `'Goblin UF', 'RuneScape UF', ui-monospace, monospace`;

export interface FxColorDef {
  id: FxColorId;
  /** Solid swatch colour, or `null` for the procedural `inverted`/`rainbow` treatments. */
  hex: string | null;
}

/** Palette, in display order. */
export const FX_COLORS: readonly FxColorDef[] = [
  { id: 'red', hex: '#d83c3c' },
  { id: 'orange', hex: '#ee8d2c' },
  { id: 'yellow', hex: '#ecc24e' },
  { id: 'green', hex: '#46a832' },
  { id: 'cyan', hex: '#46c8d2' },
  { id: 'blue', hex: '#3f6fd6' },
  { id: 'purple', hex: '#b455c8' },
  { id: 'pink', hex: '#e986b4' },
  { id: 'brown', hex: '#8a6a46' },
  { id: 'grey', hex: '#9b9b9b' },
  { id: 'white', hex: '#ffffff' },
  { id: 'inverted', hex: null },
  { id: 'rainbow', hex: null },
] as const;

/** Effect table, in display order. Keyframe names resolve against `style.css`. */
export const FX_EFFECTS: Record<FxEffectId, FxSpec> = {
  none: { kind: 'none' },
  wave: { kind: 'char', kf: 'fxWave', dur: '1s', step: 0.07 },
  wave2: { kind: 'char', kf: 'fxWave2', dur: '1s', step: 0.07 },
  wave3: { kind: 'char', kf: 'fxWave3', dur: '1s', step: 0.07 },
  shake: { kind: 'char', kf: 'fxShake', dur: '0.35s', step: 0.03 },
  shake2: { kind: 'char', kf: 'fxShake2', dur: '0.28s', step: 0.02 },
  glow: { kind: 'inner', anim: 'fxGlow 1.3s ease-in-out infinite' },
  flash: { kind: 'inner', anim: 'fxFlash 0.7s steps(1) infinite' },
  scroll: { kind: 'wrap', anim: 'fxScrollL 4s linear infinite' },
  scroll2: { kind: 'wrap', anim: 'fxScrollR 4s linear infinite' },
  slide: { kind: 'wrap', anim: 'fxSlideD 2.6s ease-in-out infinite' },
  slide2: { kind: 'wrap', anim: 'fxSlideU 2.6s ease-in-out infinite' },
  mirror: { kind: 'static', transform: 'scaleX(-1)' },
};

/** Ordered effect ids, for rendering the picker. */
export const FX_EFFECT_IDS = Object.keys(FX_EFFECTS) as readonly FxEffectId[];

/** Fallback glow colour for palettes with no solid hex (`inverted`, `rainbow`). */
export const FX_DEFAULT_GLOW = '#ffe27a';

export interface FxPreviewProps {
  /** Message to render. Renders a single space when empty, preserving height. */
  text: string;
  color: FxColorId;
  effect: FxEffectId;
  /** Preview font stack. Inherits from the surrounding text when omitted. */
  fontFamily?: string;
  className?: string;
}

export interface FxCodeTagProps {
  /** Precomputed `effect:color:text` tag. */
  value: string;
  /** Fired after the tag is successfully written to the clipboard. */
  onCopy?: (value: string) => void;
  /** Milliseconds before the button reverts from "Copied" to "Copy". Default 1200. */
  copyResetMs?: number;
  className?: string;
}

export interface FxChipRowProps<Id extends string> {
  /** Group label, also the accessible name of the chip group. */
  label: string;
  options: readonly Id[];
  value: Id;
  onSelect: (id: Id) => void;
  /** Chip styling. `gobby` is olive, `rng` is indigo. Default `rng`. */
  variant?: 'gobby' | 'rng';
  /** Optional decorative leading swatch, rendered inside each chip. */
  renderSwatch?: (id: Id) => ReactNode;
  className?: string;
}

export interface TextFxProps {
  /** Controlled message. Omit for uncontrolled. */
  value?: string;
  /** Initial message when uncontrolled. Default `"Nat 20!"`. */
  defaultValue?: string;
  onChange?: (value: string) => void;

  /** Controlled colour. Omit for uncontrolled. */
  color?: FxColorId;
  /** Initial colour when uncontrolled. Default `"rainbow"`. */
  defaultColor?: FxColorId;
  onColorChange?: (color: FxColorId) => void;

  /** Controlled effect. Omit for uncontrolled. */
  effect?: FxEffectId;
  /** Initial effect when uncontrolled. Default `"wave"`. */
  defaultEffect?: FxEffectId;
  onEffectChange?: (effect: FxEffectId) => void;

  /** Maximum message length. Default 24. */
  maxLength?: number;
  /** Fired when the code tag is copied to the clipboard. */
  onCopy?: (value: string) => void;
  /**
   * Font stack for the preview text. Inherits from the surrounding text when
   * omitted -- no font is bundled. A pixel/bitmap face suits the effect best.
   */
  fontFamily?: string;
  className?: string;
}

export interface TextFxConsoleProps
  extends TextFxProps,
    Pick<ConsoleLayoutOptions, 'showHeader'> {
  /** Header eyebrow. Default `"Text FX"`. */
  eyebrow?: string;
  /** Header title. Default `"Goblin text renderer"`. */
  title?: string;
  /** Header tagline. */
  description?: string;
}

/** Builds the shareable `effect:color:text` tag. `none` omits the effect segment. */
export function buildFxTag(text: string, color: FxColorId, effect: FxEffectId): string {
  return `${effect !== 'none' ? `${effect}:` : ''}${color}:${text}`;
}
