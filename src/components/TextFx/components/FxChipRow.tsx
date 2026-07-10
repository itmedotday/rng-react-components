import type { FxChipRowProps } from '../types';

const CHIP_BASE =
  'inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 font-sans text-xs font-semibold capitalize transition-all duration-150';

const CHIP_OFF = 'border border-zinc-800 bg-zinc-900/50 text-zinc-400';

const CHIP_ON = {
  gobby: 'border border-[rgba(132,155,73,0.6)] bg-[rgba(132,155,73,0.14)] text-[#c4d68a]',
  rng: 'border border-[rgba(99,102,241,0.45)] bg-[rgba(79,70,229,0.2)] text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.18)]',
} as const;

/** `rng` chips are squarer and heavier than the pill-shaped `gobby` chips. */
const VARIANT_SHAPE = {
  gobby: '',
  rng: 'rounded-[10px] font-bold',
} as const;

/**
 * A labelled row of single-select toggle chips.
 *
 * Selection state is exposed via `aria-pressed`, and the row is a labelled
 * group so the "Colour"/"Effect" heading reaches assistive tech.
 */
export function FxChipRow<Id extends string>({
  label,
  options,
  value,
  onSelect,
  variant = 'rng',
  renderSwatch,
  className = '',
}: FxChipRowProps<Id>) {
  return (
    <div className={className}>
      <div className="mb-2.5 text-[11px] font-bold uppercase tracking-wide text-zinc-500">
        {label}
      </div>
      <div role="group" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((id) => {
          const on = id === value;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={on}
              title={id}
              onClick={() => onSelect(id)}
              className={`${CHIP_BASE} ${VARIANT_SHAPE[variant]} ${on ? CHIP_ON[variant] : CHIP_OFF}`}
            >
              {renderSwatch?.(id)}
              {id}
            </button>
          );
        })}
      </div>
    </div>
  );
}
