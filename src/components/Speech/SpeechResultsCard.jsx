import React from 'react';
import { RotateCcw, ArrowRight, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';

export const SpeechResultsCard = ({
  results,
  phoneticTips,
  onRetry,
  onNextSentence,
  isLastSentence = false,
}) => {
  if (!results) return null;

  const { fluencyScore = 0, phonemeScore = 0, wordTokens = [] } = results;

  const isGreat = fluencyScore >= 75;

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#0f1828]/95 border border-slate-800/90 shadow-xl flex flex-col space-y-5 animate-slideUp">
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <h4 className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          Hasil Analisis
          {isGreat ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
              Pelafalan Bagus!
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
              Perlu Sedikit Latihan
            </span>
          )}
        </h4>
      </div>

      {/* 2. Dual Gauge Scores (Identical to Screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Fluency Score Gauge */}
        <div className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="w-12 h-12 rounded-full border-2 border-emerald-400 flex items-center justify-center text-sm font-bold text-emerald-300 bg-emerald-500/10 shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            {fluencyScore}%
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs font-semibold text-white mb-1.5">
              <span>Fluency (Kelancaran)</span>
              <span className="text-emerald-400 text-[11px] font-mono">{fluencyScore}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                style={{ width: `${fluencyScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Phoneme Score Gauge */}
        <div className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-400 flex items-center justify-center text-sm font-bold text-indigo-300 bg-indigo-500/10 shrink-0 shadow-[0_0_12px_rgba(99,102,241,0.3)]">
            {phonemeScore}%
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs font-semibold text-white mb-1.5">
              <span>Phoneme (Kejelasan Fonem)</span>
              <span className="text-indigo-400 text-[11px] font-mono">{phonemeScore}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                style={{ width: `${phonemeScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Word-by-Word Pronunciation Breakdown */}
      <div>
        <span className="text-[11px] font-bold text-slate-400 block mb-2">
          Detail Pengucapan Kata per Kata:
        </span>
        <div className="flex flex-wrap gap-1.5 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm leading-relaxed">
          {wordTokens.map((token, index) => (
            <span
              key={index}
              className={`px-2 py-0.5 rounded-md text-xs sm:text-sm font-medium border transition-colors ${
                token.isCorrect
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}
            >
              {token.rawWord}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4 text-[10px] text-slate-500 mt-2 px-1">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Lafal Tepat
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-400" /> Kurang Terdengar / Salah
          </span>
        </div>
      </div>

      {/* 4. Phonetic & Articulation Tips */}
      {phoneticTips && (
        <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-start gap-2.5 text-xs text-indigo-200">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-indigo-100 block mb-0.5">Tips Cara Baca Simpel:</span>
            <p className="leading-relaxed text-indigo-200/90">{phoneticTips}</p>
          </div>
        </div>
      )}

      {/* 5. Control Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onRetry}
          className="w-full sm:flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-800 hover:text-white border border-slate-700/80 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Coba Ucapkan Lagi</span>
        </button>

        <button
          type="button"
          onClick={onNextSentence}
          className="w-full sm:flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
        >
          <span>{isLastSentence ? 'Selesaikan Sesi Latihan' : 'Kalimat Berikutnya'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
