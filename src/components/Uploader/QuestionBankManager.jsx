import React, { useState, useEffect, useCallback } from 'react';
import { 
  Database, 
  Trash2, 
  RotateCcw, 
  Layers, 
  Swords, 
  Mic,
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { 
  fetchQuestionBankSummary, 
  deleteCategoryFromSupabase, 
  resetAllQuestionBanks 
} from '../../services/supabaseClient';
import { playSuccessSound, playErrorSound } from '../../utils/audio';

export const QuestionBankManager = ({ onDataChanged }) => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [isResetting, setIsResetting] = useState(false);
  const [confirmDeleteCat, setConfirmDeleteCat] = useState(null);
  const [confirmResetAll, setConfirmResetAll] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    try {
      const summary = await fetchQuestionBankSummary();
      setCategories(summary);
    } catch (err) {
      console.error('Failed fetching summary:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const handleDeleteCategory = async (catName) => {
    setDeletingCategory(catName);
    try {
      await deleteCategoryFromSupabase(catName);
      playSuccessSound();
      setActionMessage({ type: 'success', text: `Bab "${catName}" berhasil dihapus dari database & storage.` });
      setConfirmDeleteCat(null);
      await loadSummary();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      playErrorSound();
      setActionMessage({ type: 'error', text: `Gagal menghapus bab: ${err.message}` });
    } finally {
      setDeletingCategory(null);
    }
  };

  const handleResetAll = async () => {
    setIsResetting(true);
    try {
      await resetAllQuestionBanks();
      playSuccessSound();
      setActionMessage({ type: 'success', text: 'Seluruh bank soal kustom berhasil dikosongkan.' });
      setConfirmResetAll(false);
      await loadSummary();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      playErrorSound();
      setActionMessage({ type: 'error', text: `Gagal mereset bank soal: ${err.message}` });
    } finally {
      setIsResetting(false);
    }
  };

  const totalQuestionsAll = categories.reduce((acc, c) => acc + c.totalCount, 0);

  return (
    <div className="w-full rounded-2xl bg-[#0f1828]/95 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Kelola Bank Soal
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {categories.length} Bab • {totalQuestionsAll} Soal
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Pantau bab tersimpan di Supabase & LocalStorage, atau hapus bab spesifik.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadSummary}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {categories.length > 0 && (
            <button
              type="button"
              onClick={() => setConfirmResetAll(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Semua</span>
            </button>
          )}
        </div>
      </div>

      {/* Alert Messages */}
      {actionMessage && (
        <div className={`p-3.5 rounded-xl text-xs flex items-center justify-between gap-2 animate-fadeIn ${
          actionMessage.type === 'success' 
            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{actionMessage.text}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setActionMessage(null)}
            className="text-[11px] font-bold underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Confirmation Modal for Reset All */}
      {confirmResetAll && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-200 text-xs sm:text-sm space-y-3 animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-white font-bold">Konfirmasi Kosongkan Semua Bank Soal?</strong>
              <p className="text-xs text-rose-300/90 mt-0.5">
                Tindakan ini akan menghapus permanen seluruh soal Flashcard dan Boss Arena dari Supabase dan LocalStorage.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setConfirmResetAll(false)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleResetAll}
              disabled={isResetting}
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              {isResetting && <RefreshCw className="w-3 h-3 animate-spin" />}
              <span>Ya, Kosongkan Semua</span>
            </button>
          </div>
        </div>
      )}

      {/* Categories List */}
      {isLoading ? (
        <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
          <span>Memuat daftar bank soal...</span>
        </div>
      ) : categories.length === 0 ? (
        <div className="py-8 px-4 rounded-xl border border-dashed border-slate-800 text-center space-y-2">
          <FolderOpen className="w-8 h-8 text-slate-600 mx-auto" />
          <h4 className="text-xs sm:text-sm font-bold text-slate-300">Belum Ada Bab yang Tersimpan</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Gunakan tab upload di atas untuk menambahkan materi TKA baru. Data baru akan otomatis terdaftar di sini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categories.map((catItem) => (
            <div
              key={catItem.category}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight break-words">
                    {catItem.category}
                  </h4>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                      <Layers className="w-3 h-3" />
                      {catItem.flashcardsCount} Flashcards
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/25">
                      <Swords className="w-3 h-3" />
                      {catItem.bossQuizzesCount} Boss Quizzes
                    </span>
                    {catItem.speechCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                        <Mic className="w-3 h-3" />
                        {catItem.speechCount} Speech Lab
                      </span>
                    )}
                  </div>
                </div>

                {confirmDeleteCat !== catItem.category ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteCat(catItem.category)}
                    className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition shrink-0"
                    title={`Hapus bab ${catItem.category}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : null}
              </div>

              {/* Inline Delete Confirmation */}
              {confirmDeleteCat === catItem.category && (
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 animate-fadeIn">
                  <span className="text-[11px] text-rose-300 font-medium">Hapus bab ini?</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteCat(null)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(catItem.category)}
                      disabled={deletingCategory === catItem.category}
                      className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold transition flex items-center gap-1"
                    >
                      {deletingCategory === catItem.category && <RefreshCw className="w-2.5 h-2.5 animate-spin" />}
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
