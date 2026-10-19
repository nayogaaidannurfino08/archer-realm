import React from 'react';
import { HeartCrack, RotateCcw, ArrowLeft, ShieldAlert } from 'lucide-react';

export const BossGameOverScreen = ({ roundReached = 1, onRestart, onBackToDashboard }) => {
  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-10 rounded-2xl bg-[#14080e]/95 border-2 border-rose-600/40 shadow-[0_0_50px_rgba(244,63,94,0.3)] flex flex-col items-center text-center relative overflow-hidden animate-fadeIn select-none">
      {/* Background Crimson Glow */}
      <div className="absolute -top-20 w-80 h-80 rounded-full bg-rose-600/15 blur-3xl pointer-events-none" />

      {/* Broken Heart Icon */}
      <div className="w-20 h-20 rounded-full bg-rose-600/20 border-2 border-rose-500/40 p-0.5 shadow-[0_0_30px_rgba(244,63,94,0.4)] mb-5 flex items-center justify-center">
        <HeartCrack className="w-10 h-10 text-rose-500 animate-pulse" />
      </div>

      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-3">
        <ShieldAlert className="w-3.5 h-3.5" />
        Game Over! 3 Hati Habis
      </span>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
        Ksatria Terhempas!
      </h2>
      <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md leading-relaxed">
        Semburan api naga menembus pertahananmu di babak {roundReached}. Jangan berkecil hati, asah kembali analisis struktur kalimatmu!
      </p>

      {/* Summary Box */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-rose-500/20 w-full my-6 text-xs text-slate-300">
        <p>
          Kegagalan adalah bahan bakar penguasaan grammar. Evaluasi kesalahanmu dan kembali hadapi naga dengan kesiapan penuh!
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        <button
          type="button"
          onClick={onRestart}
          className="w-full sm:flex-1 py-3 px-5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(244,63,94,0.4)] flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Bangkit & Ulangi Duel</span>
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
