import React from 'react';
import { Bell, ChevronDown, Sparkles } from 'lucide-react';

export const ArcherLogo = () => (
  <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="w-5 h-5 text-emerald-400"
    >
      {/* Stylized Archer Realm arrowhead symbol */}
      <path d="M12 2L3 14h6v8h6v-8h6L12 2z" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 3L5 13h5v7h4v-7h5L12 3z" />
    </svg>
  </div>
);

export const Navbar = ({ activeCharacter = 'verdant' }) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#080d17]/95 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left: Brand & Watermark */}
        <div className="flex items-center gap-3">
          <ArcherLogo />
          <div className="flex items-baseline gap-3">
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 font-sans">
              Archer Realm
            </span>
            <span className="hidden sm:inline-block text-xs font-normal text-slate-400 border-l border-slate-700/60 pl-3">
              Engineered by Nayoga Aidan Nurfino
            </span>
          </div>
        </div>

        {/* Right: Notifications & User Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button 
            type="button"
            aria-label="Notifikasi"
            className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#080d17]"></span>
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5 pl-2 py-1 pr-2 rounded-full bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition cursor-pointer select-none">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${
              activeCharacter === 'storm' 
                ? 'bg-gradient-to-tr from-cyan-600 to-sky-400' 
                : 'bg-gradient-to-tr from-emerald-600 to-teal-400'
            }`}>
              <span className="text-[11px]">NA</span>
            </div>
            <span className="text-xs font-semibold text-slate-200">Nayoga</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>
    </header>
  );
};
