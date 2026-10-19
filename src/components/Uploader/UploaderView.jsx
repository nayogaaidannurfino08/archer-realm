import React, { useState } from 'react';
import { 
  CloudUpload, 
  Sparkles, 
  FileText, 
  AlignLeft, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Zap,
  ArrowRight
} from 'lucide-react';

import { ApiKeyBanner } from './ApiKeyBanner';
import { UploadZone } from './UploadZone';
import { PasteTextZone } from './PasteTextZone';
import { GuidanceCard } from './GuidanceCard';
import { GeneratedPreview } from './GeneratedPreview';

import { 
  parseMaterialWithGemini, 
  parseMaterialWithMock, 
  hasGeminiApiKey 
} from '../../services/geminiApi';
import { 
  syncFlashcardsToSupabase, 
  syncBossQuizzesToSupabase 
} from '../../services/supabaseClient';
import { playSuccessSound, playErrorSound } from '../../utils/audio';

export const UploaderView = ({ onNavigateTab }) => {
  // Input Method: 'file' | 'text'
  const [activeTab, setActiveTab] = useState('file');

  // Input States
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState('');

  // Processing & Results
  const [isParsing, setIsParsing] = useState(false);
  const [progressStep, setProgressStep] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [parsedResult, setParsedResult] = useState(null);

  // Force re-render of key banner if updated
  const [, setKeyRefresh] = useState(0);

  const isFormValid = activeTab === 'file' ? Boolean(selectedFile) : pastedText.trim().length >= 10;

  // Handle parsing action
  const handleStartParsing = async (forceMock = false) => {
    if (!isFormValid || isParsing) return;

    setErrorMessage(null);
    setIsParsing(true);
    setProgressStep('Membaca dan memverifikasi materi input...');

    try {
      const isKeyAvailable = hasGeminiApiKey();

      // If user forces mock OR no key is configured, run demo mock
      if (forceMock || !isKeyAvailable) {
        setProgressStep('Menjalankan Gemini 1.5 Flash Parser (Demo Mode)...');
        const mockResult = await parseMaterialWithMock({
          textContent: pastedText,
          file: selectedFile,
        });
        setProgressStep('Menyimpan ke Supabase & LocalStorage...');
        await Promise.all([
          syncFlashcardsToSupabase(mockResult.flashcards),
          syncBossQuizzesToSupabase(mockResult.bossQuizzes),
        ]);
        setParsedResult(mockResult);
        playSuccessSound();
        setIsParsing(false);
        return;
      }

      // Live Gemini 1.5 Flash Call
      setProgressStep('Mengirim materi ke Google Gemini 1.5 Flash...');
      const result = await parseMaterialWithGemini({
        textContent: activeTab === 'text' ? pastedText : '',
        file: activeTab === 'file' ? selectedFile : null,
      });

      setProgressStep('Menyinkronkan hasil ke Supabase Cloud...');
      await Promise.all([
        syncFlashcardsToSupabase(result.flashcards),
        syncBossQuizzesToSupabase(result.bossQuizzes),
      ]);

      setParsedResult(result);
      playSuccessSound();
    } catch (err) {
      console.error('Parsing error:', err);
      playErrorSound();
      setErrorMessage(
        err.message || 'Terjadi kesalahan saat memproses materi dengan Gemini. Periksa kembali API Key dan format dokumen Anda.'
      );
    } finally {
      setIsParsing(false);
      setProgressStep('');
    }
  };

  const handleReset = () => {
    setParsedResult(null);
    setErrorMessage(null);
    setSelectedFile(null);
    setPastedText('');
  };

  return (
    <div className="w-full flex flex-col space-y-6 animate-fadeIn pb-12">
      {/* 1. Header Modul */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
            <CloudUpload className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Upload Materi TKA
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Powered by Google Gemini Free Tier
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Ekstraksi otomatis dokumen/catatan menjadi Flashcard Duel (Confusion Words) & Boss Arena Battles.
            </p>
          </div>
        </div>

        {/* Mobile-only badge */}
        <div className="sm:hidden flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Powered by Gemini 1.5 Flash</span>
        </div>
      </div>

      {/* 2. API Key Configuration & Status Banner */}
      <ApiKeyBanner onKeyChange={() => setKeyRefresh((prev) => prev + 1)} />

      {/* 3. Result Preview Area (When Available) */}
      {parsedResult ? (
        <GeneratedPreview 
          parsedResult={parsedResult} 
          onNavigateTab={onNavigateTab}
          onReset={handleReset}
        />
      ) : (
        /* Upload & Form Section */
        <div className="flex flex-col space-y-5">
          {/* Input Method Switcher Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('file')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'file'
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Drag & Drop File (PDF / Gambar)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'text'
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800'
                }`}
              >
                <AlignLeft className="w-4 h-4" />
                <span>Paste Teks Materi Langsung</span>
              </button>
            </div>
          </div>

          {/* Active Tab Panel */}
          {activeTab === 'file' ? (
            <UploadZone
              selectedFile={selectedFile}
              onSelectFile={(file) => setSelectedFile(file)}
              onRemoveFile={() => setSelectedFile(null)}
            />
          ) : (
            <PasteTextZone
              textValue={pastedText}
              onChangeText={(txt) => setPastedText(txt)}
              onClearText={() => setPastedText('')}
            />
          )}

          {/* Action Trigger Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="text-xs text-slate-400">
              {activeTab === 'file' && !selectedFile && (
                <span>* Pilih atau tarik file PDF / Gambar dokumen materi TKA untuk diproses.</span>
              )}
              {activeTab === 'text' && pastedText.trim().length < 10 && (
                <span>* Tempelkan minimal 1-2 kalimat atau klik tombol contoh materi di atas.</span>
              )}
              {isFormValid && (
                <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  Materi siap diolah dengan AI.
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Optional Demo Mode Button for Instant Evaluation */}
              <button
                type="button"
                onClick={() => handleStartParsing(true)}
                disabled={isParsing || !isFormValid}
                className="px-3.5 py-3 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all disabled:opacity-40"
              >
                Mode Demo (Cepat)
              </button>

              {/* Primary Generate Button */}
              <button
                type="button"
                onClick={() => handleStartParsing(false)}
                disabled={!isFormValid || isParsing}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-xs sm:text-sm tracking-wide transition-all shadow-xl active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  isParsing
                    ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50'
                    : 'bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 text-slate-950 hover:brightness-110 shadow-[0_0_25px_rgba(6,182,212,0.4)]'
                }`}
              >
                {isParsing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{progressStep || 'Memproses Materi...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analisis & Generate Soal</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <strong className="block font-bold">Gagal Menganalisis Materi:</strong>
                <p className="mt-0.5 text-xs text-rose-200/90 leading-relaxed">{errorMessage}</p>
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleStartParsing(true)}
                    className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-[11px] font-bold text-white transition-all"
                  >
                    Coba Mode Demo (Tanpa API Key)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Guidance Cards */}
          <div className="pt-4 border-t border-slate-800/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <span>Panduan Ekstraksi Materi</span>
            </h3>
            <GuidanceCard />
          </div>
        </div>
      )}
    </div>
  );
};
