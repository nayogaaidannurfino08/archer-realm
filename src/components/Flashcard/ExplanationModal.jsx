import React from 'react';
import { AlertCircle, X, Check, BookOpen } from 'lucide-react';

export const ExplanationModal = ({ card, onDismiss }) => {
  if (!card) return null;

  return (
    <div className="fixed inset-x-4 bottom-20 sm:bottom-8 sm:right-8 sm:left-auto sm:max-w-md z-50 animate-slideUp">
      <div className="rounded-2xl bg-[#23121d]/95 backdrop-blur-md border border-rose-500/40 p-5 shadow-[0_10px_35px_rgba(244,63,94,0.35)] text-slate-100 flex flex-col space-y-3.5 relative overflow-hidden">
        {/* Subtle background red glow */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight">
                Wah, salah geser!
              </h4>
              <p className="text-[11px] text-rose-300/80">
                Coba lagi, pelajari dulu penjelasannya ya.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Review Points */}
        <div className="space-y-2 text-xs text-slate-200 bg-slate-900/50 p-3.5 rounded-xl border border-rose-500/20 relative z-10">
          {/* Key Rule / Pembeda */}
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
            <p className="text-[11px] leading-relaxed">
              <strong className="text-rose-200">Kunci: </strong>
              {card.explanation?.keyRule}
            </p>
          </div>

          {/* Kenapa salah pada konteks */}
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
            <p className="text-[11px] leading-relaxed">
              <strong className="text-amber-200">Alasan: </strong>
              {card.explanation?.whyWrong}
            </p>
          </div>

          {/* Contoh kalimat */}
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
            <p className="text-[11px] leading-relaxed">
              <strong className="text-emerald-300">Contoh: </strong>
              {card.explanation?.example}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onDismiss}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer relative z-10"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Mengerti</span>
        </button>
      </div>
    </div>
  );
};
