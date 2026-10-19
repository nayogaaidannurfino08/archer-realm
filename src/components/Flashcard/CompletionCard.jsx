import React from 'react';
import { Trophy, RotateCcw, ArrowLeft, Award, Sparkles, CheckCircle2 } from 'lucide-react';

export const CompletionCard = ({ stats, onRestart, onBackToDashboard }) => {
  const total = stats.totalCards || 10;
  const accuracy = Math.round((stats.firstTryCorrect / total) * 100) || 0;

  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-10 rounded-2xl bg-[#0f1828]/95 border border-emerald-500/30 shadow-2xl flex flex-col items-center text-center relative overflow-hidden animate-fadeIn">
      {/* Background celebration glow */}
      <div className="absolute -top-20 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

      {/* Trophy Badge */}
      <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-[0_0_30px_rgba(16,185,129,0.4)] mb-5 animate-bounce">
        <div className="w-full h-full rounded-full bg-[#080d17] flex items-center justify-center">
          <Trophy className="w-9 h-9 text-amber-400" />
        </div>
      </div>

      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
        <Sparkles className="w-3.5 h-3.5" />
        Duel Selesai!
      </span>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
        Luar Biasa, Nayoga!
      </h2>
      <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md leading-relaxed">
        Kamu telah menyelesaikan seluruh tumpukan kata jebakan TKA English di sesi ini.
      </p>

      {/* Summary Score Grid */}
      <div className="grid grid-cols-3 gap-3 w-full my-6">
        <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
          <span className="block text-[10px] text-slate-400 font-medium">Akurasi</span>
          <span className="text-lg sm:text-xl font-bold text-emerald-400 mt-0.5 block">
            {accuracy}%
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
          <span className="block text-[10px] text-slate-400 font-medium">Langsung Benar</span>
          <span className="text-lg sm:text-xl font-bold text-teal-300 mt-0.5 block">
            {stats.firstTryCorrect} / {total}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
          <span className="block text-[10px] text-slate-400 font-medium">Diulang</span>
          <span className="text-lg sm:text-xl font-bold text-rose-400 mt-0.5 block">
            {stats.repeatedCount}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        <button
          type="button"
          onClick={onRestart}
          className="w-full sm:flex-1 py-3 px-5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Latihan Lagi</span>
        </button>

        <button
          type="button"
          onClick={onBackToDashboard}
          className="w-full sm:flex-1 py-3 px-5 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 bg-slate-800/70 hover:bg-slate-800 hover:text-white border border-slate-700/70 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard</span>
        </button>
      </div>
    </div>
  );
};
