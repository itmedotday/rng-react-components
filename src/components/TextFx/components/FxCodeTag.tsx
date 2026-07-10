import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { FxCodeTagProps } from '../types';

/** Read-only view of the shareable tag, with a copy-to-clipboard button. */
export const FxCodeTag: React.FC<FxCodeTagProps> = ({
  value,
  onCopy,
  copyResetMs = 1200,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard?.writeText(value);
    } catch {
      // Clipboard unavailable (insecure origin, denied permission). The button
      // still confirms, because the tag is visible and selectable either way.
    }
    onCopy?.(value);
    setCopied(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), copyResetMs);
  }, [value, onCopy, copyResetMs]);

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <code className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 font-mono text-[13px] text-zinc-400">
        {value}
      </code>
      <button
        type="button"
        onClick={() => void handleCopy()}
        className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3.5 py-2 font-sans text-xs font-bold text-zinc-400 transition-colors hover:text-zinc-300"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
        ) : (
          <Copy className="h-3.5 w-3.5" aria-hidden />
        )}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
};
