import React from 'react';
import { Flame, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

export const BossExplanationModal = ({ quiz, onDismiss }) => {
  if (!quiz) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080d17]/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl bg-[#1b0d15]/95 border-2 border-rose-500/50 p-6 sm:p-7 shadow-[0_0_50px_rgba(244,63,94,0.35)] relative overflow-hidden flex flex-col space-y-4 text-slate-100 animate-slideUp">
        {/* Glow Accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 fill-current animate-pulse" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Serangan Balik Naga!
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                -1 Hati
              </span>
            </h3>
            <p className="text-xs text-rose-300/80 mt-0.5">
              Analisis struktur kalimat belum tepat. Simak evaluasinya berikut:
            </p>
          </div>
        </div>

        {/* 3 Review Points */}
        <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-rose-500/25 text-xs text-slate-200">
          {/* Error Found */}
          <div>
            <span className="text-[11px] font-bold text-rose-300 block mb-1">
              &bull; Letak Kesalahan:
            </span>
            <p className="text-slate-300 pl-3 leading-relaxed">
              {quiz.explanation?.errorFound}
            </p>
          </div>

          {/* Grammar Rule */}
          <div>
            <span className="text-[11px] font-bold text-amber-300 block mb-1">
              &bull; Kaidah Tata Bahasa:
            </span>
            <p className="text-slate-300 pl-3 leading-relaxed">
              {quiz.explanation?.rule}
            </p>
          </div>

          {/* Correct Sentence */}
          <div>
            <span className="text-[11px] font-bold text-emerald-300 block mb-1">
              &bull; Kalimat yang Benar:
            </span>
            <p className="text-emerald-200 font-medium italic pl-3 leading-relaxed bg-emerald-950/30 p-2 rounded-lg border border-emerald-500/20">
              &ldquo;{quiz.explanation?.correctSentence}&rdquo;
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onDismiss}
          className="w-full py-3 px-5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 active:scale-[0.99] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Bangkit & Lanjutkan Duel</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
