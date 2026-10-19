import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  Swords, 
  CheckCircle2, 
  Save, 
  ArrowRight, 
  Lightbulb, 
  AlertCircle,
  HelpCircle,
  Play
} from 'lucide-react';
import { setStoredItem, getStoredItem, STORAGE_KEYS } from '../../utils/storage';
import { playSuccessSound } from '../../utils/audio';
import { 
  syncFlashcardsToSupabase, 
  syncBossQuizzesToSupabase, 
  isSupabaseConfigured 
} from '../../services/supabaseClient';

export const GeneratedPreview = ({ 
  parsedResult, 
  onNavigateTab,
  onReset 
}) => {
  const [activeSubTab, setActiveSubTab] = useState('flashcards'); // 'flashcards' | 'quizzes'
  const [isSaved, setIsSaved] = useState(false);
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  if (!parsedResult) return null;

  const { flashcards = [], bossQuizzes = [] } = parsedResult;

  const handleSaveToApp = async () => {
    // Sync to Supabase (with automatic LocalStorage fallback)
    const fcResult = await syncFlashcardsToSupabase(flashcards);
    const bqResult = await syncBossQuizzesToSupabase(bossQuizzes);

    if (fcResult?.synced || bqResult?.synced) {
      setIsCloudSynced(true);
    }

    // Update vocabulary count in stats
    const stats = getStoredItem(STORAGE_KEYS.STATS, null);
    if (stats && stats.metrics) {
      const vocabMetric = stats.metrics.find((m) => m.id === 'vocabulary');
      if (vocabMetric) {
        const parts = vocabMetric.value.split('/');
        const parsedCount = parseInt(parts[0], 10);
        const currentCount = isNaN(parsedCount) ? 0 : parsedCount;
        const totalCount = parseInt(parts[1], 10) || 1200;
        vocabMetric.value = `${Math.min(currentCount + flashcards.length, totalCount)} / ${totalCount}`;
        setStoredItem(STORAGE_KEYS.STATS, stats);
      }
    }

    setIsSaved(true);
    playSuccessSound();
  };

  return (
    <div className="flex flex-col space-y-4 animate-slideUp">
      {/* Success Notification Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900/90 to-cyan-950/60 border border-emerald-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Materi Berhasil Diparsing oleh Gemini!
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                AI Generated
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Ditemukan <span className="text-emerald-400 font-bold">{flashcards.length} Flashcards</span> (Confusion Words) dan <span className="text-cyan-400 font-bold">{bossQuizzes.length} Boss Quizzes</span> (Grammar Analysis).
            </p>
          </div>
        </div>

        {/* Save & Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={handleSaveToApp}
            disabled={isSaved}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 ${
              isSaved
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
            }`}
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{isCloudSynced ? 'Tersimpan di Cloud Supabase' : 'Tersimpan di Bank Soal'}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan ke Bank Soal</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all"
          >
            Upload Lagi
          </button>
        </div>
      </div>

      {/* Sub Tabs Switcher */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('flashcards')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeSubTab === 'flashcards'
                ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Flashcards ({flashcards.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('quizzes')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeSubTab === 'quizzes'
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>Boss Quizzes ({bossQuizzes.length})</span>
          </button>
        </div>

        {/* Quick Navigate Shortcut */}
        {onNavigateTab && (
          <button
            type="button"
            onClick={() => {
              if (!isSaved) handleSaveToApp();
              onNavigateTab(activeSubTab === 'flashcards' ? 'flashcard' : 'boss_arena');
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>Mulai Mainkan {activeSubTab === 'flashcards' ? 'Duel' : 'Arena'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 1. FLASHCARDS PREVIEW LIST */}
      {activeSubTab === 'flashcards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {flashcards.map((fc, index) => (
            <div
              key={fc.id || index}
              className="p-4 sm:p-5 rounded-2xl bg-[#0f1828]/95 border border-slate-800/90 shadow-lg flex flex-col justify-between space-y-3"
            >
              <div>
                {/* Header: Word A vs Word B */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800/70">
                  <div className="flex items-center gap-2 font-mono font-bold text-sm sm:text-base text-white">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {fc.wordA}
                    </span>
                    <span className="text-slate-500 text-xs">vs</span>
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {fc.wordB}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    Kunci: Opsi {fc.correctChoice} ({fc.correctChoice === 'A' ? fc.wordA : fc.wordB})
                  </span>
                </div>

                {/* Subtitle / Context Pembeda */}
                {fc.subtitle && (
                  <p className="text-xs text-slate-400 italic mt-2">
                    &ldquo;{fc.subtitle}&rdquo;
                  </p>
                )}

                {/* Fill-in-the-blank Question */}
                <div className="mt-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed">
                  <span className="font-semibold text-cyan-400">Soal Rumpang: </span>
                  {fc.contextQuestion}
                </div>

                {/* Quick Tips */}
                {fc.quickTips && (
                  <div className="mt-2 text-[11px] text-amber-300 flex items-start gap-1.5 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                    <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                    <span><strong>Trik Kilat:</strong> {fc.quickTips}</span>
                  </div>
                )}
              </div>

              {/* In-depth Explanation Box */}
              {fc.explanation && (
                <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-800/60 bg-slate-950/40 p-2.5 rounded-lg">
                  {fc.explanation.keyRule && (
                    <p>
                      <strong className="text-emerald-400">Rumus:</strong> {fc.explanation.keyRule}
                    </p>
                  )}
                  {fc.explanation.whyWrong && (
                    <p>
                      <strong className="text-rose-400">Kenapa Opsi Lain Salah:</strong> {fc.explanation.whyWrong}
                    </p>
                  )}
                  {fc.explanation.example && (
                    <p>
                      <strong className="text-slate-300">Contoh Lain:</strong> {fc.explanation.example}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 2. BOSS QUIZZES PREVIEW LIST */}
      {activeSubTab === 'quizzes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {bossQuizzes.map((bq, index) => {
            const correctOpt = bq.options?.find((o) => o.isCorrect);
            const isTrueCorrect = correctOpt?.text === 'True' || correctOpt?.label === 'A';

            return (
              <div
                key={bq.id || index}
                className="p-4 sm:p-5 rounded-2xl bg-[#0f1828]/95 border border-slate-800/90 shadow-lg flex flex-col justify-between space-y-3"
              >
                <div>
                  {/* Category & Status */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/70">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      {bq.category || 'TKA Comprehension'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                      Jawaban Benar: <strong className="text-white">{correctOpt ? correctOpt.text : 'True'}</strong>
                    </span>
                  </div>

                  {/* Target Sentence */}
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm text-white font-medium leading-relaxed">
                    &ldquo;{bq.sentence}&rdquo;
                  </div>

                  {/* True / False Indicator */}
                  <div className="mt-3 flex items-center gap-2">
                    <div
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold text-center border ${
                        isTrueCorrect
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                          : 'bg-slate-900/60 border-slate-800 text-slate-500'
                      }`}
                    >
                      A: True {isTrueCorrect && '✓'}
                    </div>
                    <div
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold text-center border ${
                        !isTrueCorrect
                          ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                          : 'bg-slate-900/60 border-slate-800 text-slate-500'
                      }`}
                    >
                      B: False {!isTrueCorrect && '✓'}
                    </div>
                  </div>
                </div>

                {/* Explanation Details */}
                {bq.explanation && (
                  <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-800/60 bg-slate-950/40 p-2.5 rounded-lg">
                    {bq.explanation.rule && (
                      <p>
                        <strong className="text-cyan-400">Aturan Grammar:</strong> {bq.explanation.rule}
                      </p>
                    )}
                    {bq.explanation.errorFound && (
                      <p>
                        <strong className="text-amber-400">Analisis Kesalahan:</strong> {bq.explanation.errorFound}
                      </p>
                    )}
                    {bq.explanation.correctSentence && (
                      <p>
                        <strong className="text-emerald-400">Kalimat Tepat:</strong> {bq.explanation.correctSentence}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
