import React from 'react';
import { Leaf, Zap } from 'lucide-react';

// Character Archer Avatar component
const CharacterAvatar = ({ activeCharacter }) => {
  const isStorm = activeCharacter === 'storm';

  return (
    <div className={`relative w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 ${
      isStorm 
        ? 'border-cyan-400/80 bg-cyan-950/60 shadow-[0_0_20px_rgba(6,182,212,0.3)]' 
        : 'border-emerald-400/80 bg-emerald-950/60 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
    }`}>
      <svg 
        viewBox="0 0 48 48" 
        className={`w-10 h-10 transition-colors ${isStorm ? 'text-cyan-300' : 'text-emerald-300'}`}
        fill="currentColor"
      >
        {/* Hooded Archer Scout Avatar Icon */}
        <path d="M24 4C14 4 10 12 10 22C10 32 15 42 24 44C33 42 38 32 38 22C38 12 34 4 24 4Z" opacity="0.25" />
        <path d="M24 8C17 8 13 14 13 22C13 30 18 38 24 40C30 38 35 30 35 22C35 14 31 8 24 8Z" fill="none" stroke="currentColor" strokeWidth="2.5" />
        {/* Face opening */}
        <circle cx="24" cy="22" r="9" fill="#0b1320" stroke="currentColor" strokeWidth="2" />
        {/* Eyes */}
        <circle cx="21" cy="21" r="1.5" fill="currentColor" />
        <circle cx="27" cy="21" r="1.5" fill="currentColor" />
        {/* Smile */}
        <path d="M21 25C22.5 26.5 25.5 26.5 27 25" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        {/* Hood leaf / crest */}
        <path d="M24 3L26 8H22L24 3Z" fill="currentColor" />
      </svg>
      
      {/* Small active badge on bottom right of avatar */}
      <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#0f172a] flex items-center justify-center ${
        isStorm ? 'bg-cyan-400' : 'bg-emerald-400'
      }`}>
        {isStorm ? <Zap className="w-2.5 h-2.5 text-slate-950 fill-current" /> : <Leaf className="w-2.5 h-2.5 text-slate-950 fill-current" />}
      </span>
    </div>
  );
};

export const ProfileCard = ({ userData, activeCharacter, onSelectCharacter }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#0f1828]/90 border border-slate-800/80 p-5 md:p-6 backdrop-blur flex flex-col justify-between shadow-lg">
      {/* Background glow accent */}
      <div 
        className={`absolute -top-16 -left-16 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${
          activeCharacter === 'storm' ? 'bg-cyan-500/10' : 'bg-emerald-500/10'
        }`} 
      />

      {/* Top Section: Avatar & Greeting */}
      <div className="flex items-center gap-4 relative z-10">
        <CharacterAvatar activeCharacter={activeCharacter} />
        <div>
          <h2 className="text-lg md:text-xl font-bold text-white tracking-tight flex items-center gap-1.5">
            {userData?.greeting || 'Halo, Nayoga 👋'}
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            {userData?.subgreeting || 'Siap menaklukkan TKA English hari ini?'}
          </p>
        </div>
      </div>

      {/* Bottom Section: Character Selector */}
      <div className="mt-5 pt-4 border-t border-slate-800/60 flex flex-wrap items-center gap-2.5 relative z-10">
        {/* Verdant Scout Button */}
        <button
          type="button"
          onClick={() => onSelectCharacter('verdant')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
            activeCharacter === 'verdant'
              ? 'bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-300'
              : 'bg-slate-800/70 text-slate-400 border border-slate-700/60 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Leaf className={`w-3.5 h-3.5 ${activeCharacter === 'verdant' ? 'fill-current' : ''}`} />
          <span>Verdant Scout</span>
        </button>

        {/* Storm Scout Button */}
        <button
          type="button"
          onClick={() => onSelectCharacter('storm')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
            activeCharacter === 'storm'
              ? 'bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:bg-cyan-300'
              : 'bg-slate-800/70 text-slate-400 border border-slate-700/60 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Zap className={`w-3.5 h-3.5 ${activeCharacter === 'storm' ? 'fill-current' : ''}`} />
          <span>Storm Scout</span>
        </button>
      </div>
    </div>
  );
};
