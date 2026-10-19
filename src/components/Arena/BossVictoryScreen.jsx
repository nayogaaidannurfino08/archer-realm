import React from 'react';
import { Trophy, Sparkles, ArrowLeft, RotateCcw, Award, Zap } from 'lucide-react';

export const BossVictoryScreen = ({ 
  xpGained = 250, 
  remainingHearts = 3, 
  totalQuizzes = 10,
  onRestart, 
  onBackToDashboard 
}) => {
  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-10 rounded-2xl bg-[#0f1828]/95 border-2 border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.25)] flex flex-col items-center text-center relative overflow-hidden animate-fadeIn select-none">
      {/* Background Celebration Glow */}
      <div className="absolute -top-20 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

      {/* Trophy Badge */}
      <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 via-emerald-400 to-teal-300 p-0.5 shadow-[0_0_35px_rgba(16,185,129,0.5)] mb-5 animate-bounce">
        <div className="w-full h-full rounded-full bg-[#080d17] flex items-center justify-center">
          <Trophy className="w-10 h-10 text-amber-400" />
        </div>
      </div>

      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
        <Sparkles className="w-3.5 h-3.5" />
        Victory! Naga Takluk
      </span>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
        Selamat, Nayoga!
      </h2>
      <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md leading-relaxed">
        Pemahaman analisis kalimat TKA-mu berhasil meruntuhkan pertahanan sang naga purba.
      </p>

      {/* Reward & Stats Pill */}
      <div className="grid grid-cols-2 gap-3 w-full my-6">
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 flex flex-col items-center">
          <span className="text-[10px] text-slate-400 font-medium">Hadiah Pengalaman</span>
          <span className="text-xl font-black text-amber-400 mt-1 flex items-center gap-1">
            <Zap className="w-4 h-4 fill-amber-400" />
            +{xpGained} XP
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 flex flex-col items-center">
          <span className="text-[10px] text-slate-400 font-medium">Sisa Nyawa</span>
          <span className="text-xl font-black text-rose-400 mt-1">
            {remainingHearts} / 3 Hati
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="w-full sm:flex-1 py-3 px-5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 cursor-pointer"
        >
          <Award className="w-4 h-4" />
          <span>Klaim Hadiah & Selesai</span>
        </button>

        <button
          type="button"
          onClick={onRestart}
          className="w-full sm:flex-1 py-3 px-5 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 bg-slate-800/70 hover:bg-slate-800 hover:text-white border border-slate-700/70 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Tantang Lagi</span>
        </button>
      </div>
    </div>
  );
};
