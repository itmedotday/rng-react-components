import { useState } from 'react';
import { DiceSlider } from './components/DiceSlider/DiceSlider';
import { CoinFlipConsole } from './components/CoinFlip/CoinFlipConsole';
import { RngWheel } from './components/RngWheel/RngWheel';
import { D20RollConsole } from './components/D20Roll/D20RollConsole';
import { Roulette } from './components/Roulette/Roulette';
import { TwentyOne } from './components/TwentyOne/TwentyOne';
import { ShieldCheck, Flame, Activity, Coins, Dices, BadgeCent } from 'lucide-react';

type ActiveTab = 'dice' | 'coin' | 'wheel' | 'd20' | 'roulette' | 'twentyOne';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dice');


  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between py-12 px-4 selection:bg-indigo-500/30 selection:text-indigo-200">

      {/* Background Neon Glow Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-zinc-950 to-slate-950 pointer-events-none -z-10" />

      {/* --- Top Header Area --- */}
      <header className="w-full max-w-4xl text-center flex flex-col items-center gap-2 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-bold tracking-wider text-indigo-400 uppercase select-none">
          <ShieldCheck className="w-3.5 h-3.5" />
          Provably Fair Mechanics
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mt-3 select-none">
          RNG PROBABILITY <span className="bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent">CONSOLE</span>
        </h1>
        <p className="text-zinc-500 max-w-md text-sm md:text-base select-none">
          A high-fidelity probability suite simulating true mathematical random distributions with dynamic console physics.
        </p>
      </header>

      {/* --- Main Dashboard --- */}
      <main className="w-full max-w-4xl flex flex-col items-center gap-6 z-10">

        {/* Flagship Games Tab Selection Bar */}
        <div className="flex flex-wrap bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-1 mb-4 max-w-2xl w-full select-none shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          <button
            type="button"
            onClick={() => setActiveTab('dice')}
            className={`flex-1 min-w-[7rem] py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer
              ${activeTab === 'dice'
                ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_10px_rgba(99,102,241,0.2)]'
                : 'text-zinc-500 hover:text-zinc-400'
              }
            `}
          >
            <Activity className="w-3.5 h-3.5" />
            Dice Slider
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('coin')}
            className={`flex-1 min-w-[7rem] py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer
              ${activeTab === 'coin'
                ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_10px_rgba(99,102,241,0.2)]'
                : 'text-zinc-500 hover:text-zinc-400'
              }
            `}
          >
            <Coins className="w-3.5 h-3.5" />
            Coin Flip
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('wheel')}
            className={`flex-1 min-w-[7rem] py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer
              ${activeTab === 'wheel'
                ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_10px_rgba(99,102,241,0.2)]'
                : 'text-zinc-500 hover:text-zinc-400'
              }
            `}
          >
            <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            RNG Wheel
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('d20')}
            className={`flex-1 min-w-[7rem] py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer
              ${activeTab === 'd20'
                ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_10px_rgba(99,102,241,0.2)]'
                : 'text-zinc-500 hover:text-zinc-400'
              }
            `}
          >
            <Dices className="w-3.5 h-3.5 text-violet-400" />
            D20 Roll
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('roulette')}
            className={`flex-1 min-w-[7rem] py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer
              ${activeTab === 'roulette'
                ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_10px_rgba(99,102,241,0.2)]'
                : 'text-zinc-500 hover:text-zinc-400'
              }
            `}
          >
            Roulette
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('twentyOne')}
            className={`flex-1 min-w-[7rem] py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer
              ${activeTab === 'twentyOne'
                ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_10px_rgba(99,102,241,0.2)]'
                : 'text-zinc-500 hover:text-zinc-400'
              }
            `}
          >
            <BadgeCent className="w-3.5 h-3.5 text-emerald-400" />
            21
          </button>
        </div>

        {/* Dynamic Game Component Rendering */}
        {activeTab === 'dice' && (
          <DiceSlider showHeader showHistory />
        )}
        {activeTab === 'coin' && (
          <CoinFlipConsole showHeader showHistory showRules showPrediction />
        )}
        {activeTab === 'wheel' && (
          <RngWheel showHeader showHistory showRules />
        )}
        {activeTab === 'd20' && (
          <D20RollConsole showHeader showHistory showRules />
        )}
        {activeTab === 'roulette' && (
          <Roulette showHeader showHistory showRules />
        )}
        {activeTab === 'twentyOne' && (
          <TwentyOne showHeader showHistory showRules />
        )}
      </main>

      {/* --- Footer Area --- */}
      <footer className="w-full max-w-4xl text-center text-xs text-zinc-600 mt-12 border-t border-zinc-900 pt-6 select-none">
        RNG Probability Gaming Console &copy; 2026. Made with React, TypeScript & React Spring.
      </footer>
    </div>
  );
}

export default App;
