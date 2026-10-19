import React from 'react';
import { Lightbulb, BookCheck, RotateCcw } from 'lucide-react';

export const SideNote = ({ card, stats }) => {
  if (!card) return null;

  return (
    <div className="flex flex-col space-y-4">
      {/* Dynamic Rule & Tips Box */}
      <div className="p-5 rounded-2xl bg-[#0f1828]/90 border border-slate-800/90 shadow-xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-3">
          <Lightbulb className="w-4 h-4 shrink-0" />
          <span>Ingat!</span>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed relative z-10">
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <span className="font-semibold text-white block mb-0.5">
              {card.wordA}
            </span>
            <p className="text-slate-400 text-[11px]">
              {card.quickTips?.tipA || `${card.wordA} (Opsi A)`}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <span className="font-semibold text-white block mb-0.5">
              {card.wordB}
            </span>
            <p className="text-slate-400 text-[11px]">
              {card.quickTips?.tipB || `${card.wordB} (Opsi B)`}
            </p>
          </div>
        </div>
      </div>

      {/* Mini Session Tracker */}
      <div className="p-4 rounded-2xl bg-[#0f1828]/70 border border-slate-800/80 text-xs text-slate-400">
        <h4 className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
          Progres Sesi Ini
        </h4>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
            <BookCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <div>
              <span className="block text-[10px] text-emerald-400/80">Langsung Benar</span>
              <span className="font-bold text-xs text-white">{stats.firstTryCorrect}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
            <RotateCcw className="w-4 h-4 shrink-0 text-rose-400" />
            <div>
              <span className="block text-[10px] text-rose-400/80">Diulang</span>
              <span className="font-bold text-xs text-white">{stats.repeatedCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
