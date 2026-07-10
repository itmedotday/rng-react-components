import React from 'react';
import { TextFx } from './TextFx';
import type { TextFxConsoleProps } from './types';

/**
 * `TextFx` in a glass panel, with an optional header.
 *
 * There is no session here (no wins, no history), so `StatsHeader` does not
 * apply and `showHistory` / `showRules` are not offered.
 */
export const TextFxConsole: React.FC<TextFxConsoleProps> = ({
  showHeader = false,
  eyebrow = 'Text FX',
  title = 'Goblin text renderer',
  description = 'RuneScape-style chat colours & effects. Type, pick, and watch it move.',
  className = '',
  ...textFxProps
}) => (
  <div className={`glass-panel w-full max-w-xl rounded-3xl p-8 ${className}`}>
    {showHeader && (
      <header className="mb-6 flex w-full flex-col gap-2 border-b border-zinc-800/60 pb-5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
          {eyebrow}
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">
          {title}
        </h2>
        <p className="text-sm text-zinc-400">{description}</p>
      </header>
    )}

    <TextFx {...textFxProps} />
  </div>
);
