import { CircleDollarSign } from 'lucide-react';

export interface BetBarProps {
  bet: number;
  balance: number;
  currencyLabel?: string;
  disabled?: boolean;
  rawBet: string;
  onRawBetChange: (value: string) => void;
  onBetCommit: () => void;
  onHalf: () => void;
  onDouble: () => void;
  onPlaceBet: () => void;
  placeLabel?: string;
}

export function BetBar({
  bet,
  balance,
  currencyLabel = 'GG',
  disabled = false,
  rawBet,
  onRawBetChange,
  onBetCommit,
  onHalf,
  onDouble,
  onPlaceBet,
  placeLabel = 'Bet',
}: BetBarProps) {
  const balanceText = Number.isInteger(balance)
    ? balance.toFixed(0)
    : balance.toFixed(2);
  const canBet = !disabled && bet > 0 && bet <= balance;

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
        <span>Bet Amount</span>
        <span className="font-mono text-zinc-300 tabular-nums transition-colors duration-200">
          {balanceText} {currencyLabel}
        </span>
      </div>
      <div className="flex items-stretch gap-2 w-full">
        <div
          className={`flex-1 flex items-center rounded-xl border bg-zinc-950/60 overflow-hidden transition-[border-color,opacity] duration-200
            ${disabled ? 'border-zinc-800 opacity-70' : 'border-zinc-700 focus-within:border-rose-500/80'}
          `}
        >
          <input
            type="text"
            inputMode="decimal"
            disabled={disabled}
            value={rawBet}
            onChange={(e) => onRawBetChange(e.target.value)}
            onBlur={onBetCommit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onBetCommit();
                if (canBet) onPlaceBet();
              }
            }}
            aria-label="Bet amount"
            className="flex-1 min-w-0 bg-transparent px-3 py-3 text-base font-black font-mono text-white outline-none disabled:cursor-not-allowed tabular-nums"
          />
          <span className="pr-2 text-sky-400" aria-hidden="true">
            <CircleDollarSign className="w-5 h-5" />
          </span>
        </div>

        <div className="flex rounded-xl border border-zinc-700 bg-zinc-900/80 overflow-hidden">
          <button
            type="button"
            disabled={disabled || bet <= 0}
            onClick={onHalf}
            className="px-3 text-xs font-black text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:bg-zinc-800"
            aria-label="Halve bet"
          >
            ½
          </button>
          <div className="w-px bg-zinc-700" />
          <button
            type="button"
            disabled={disabled}
            onClick={onDouble}
            className="px-3 text-xs font-black text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:bg-zinc-800"
            aria-label="Double bet"
          >
            2x
          </button>
        </div>

        <button
          type="button"
          disabled={!canBet}
          onClick={onPlaceBet}
          className={`min-w-[5.5rem] px-5 rounded-xl font-black text-base tracking-wide transition-[background-color,transform,box-shadow,color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2332]
            ${
              !canBet
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-400 text-white active:scale-[0.98] cursor-pointer twentyone-bet-ready'
            }
          `}
        >
          {placeLabel}
        </button>
      </div>
    </div>
  );
}
