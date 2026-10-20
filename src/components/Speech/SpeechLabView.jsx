import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Mic, Activity, ArrowLeft, AlertCircle, Award, RotateCcw, Plus, Sparkles, Globe, Filter } from 'lucide-react';

import { mockSpeechSentences } from '../../data/mockSpeechSentences';
import { SentenceCard } from './SentenceCard';
import { RecorderSection } from './RecorderSection';
import { SpeechResultsCard } from './SpeechResultsCard';

import { 
  createSpeechRecognition, 
  isSpeechRecognitionSupported, 
  evaluatePronunciation,
  extractCleanTranscript,
  deriveSpeechSentences
} from '../../utils/speech';
import { playSuccessSound, playVictoryFanfare } from '../../utils/audio';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from '../../utils/storage';
import { shuffleArray } from '../../utils/shuffle';
import { fetchCustomFlashcards, fetchCustomBossQuizzes } from '../../services/supabaseClient';

export const SpeechLabView = ({ onBackToDashboard, onNavigateTab }) => {
  // Helper to load combined master sentences (Custom + Auto-derived from Uploaded Flashcards & Boss Quizzes)
  const getCombinedMasterSentences = () => {
    let stored = getStoredItem(STORAGE_KEYS.CUSTOM_SPEECH_SENTENCES, []);

    // Auto-derive if stored is empty but user has uploaded flashcards or boss quizzes
    if (!stored || stored.length === 0) {
      const storedFc = getStoredItem(STORAGE_KEYS.CUSTOM_FLASHCARDS, []);
      const storedBq = getStoredItem(STORAGE_KEYS.CUSTOM_BOSS_QUIZZES, []);
      if ((storedFc && storedFc.length > 0) || (storedBq && storedBq.length > 0)) {
        stored = deriveSpeechSentences(storedFc, storedBq);
        if (stored.length > 0) {
          setStoredItem(STORAGE_KEYS.CUSTOM_SPEECH_SENTENCES, stored);
        }
      }
    }

    let combined = Array.isArray(stored) ? [...stored] : [];
    if (mockSpeechSentences && mockSpeechSentences.length > 0) {
      combined = [...combined, ...mockSpeechSentences.filter((m) => !combined.some((c) => c.id === m.id))];
    }
    return combined;
  };

  const [allSentences, setAllSentences] = useState(getCombinedMasterSentences);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Extract distinct categories from all sentences
  const categories = useMemo(() => {
    const cats = new Set();
    allSentences.forEach((s) => {
      const cat = (s.category || '').trim();
      if (cat) cats.add(cat);
    });
    return Array.from(cats);
  }, [allSentences]);

  // Active filtered sentences
  const [sentences, setSentences] = useState(() => {
    const master = getCombinedMasterSentences();
    return shuffleArray(master);
  });
  const totalSentences = sentences.length;

  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    setSelectedCategory(newCat);
    let filtered = allSentences;
    if (newCat !== 'ALL') {
      filtered = allSentences.filter((s) => (s.category || '').toLowerCase() === newCat.toLowerCase());
    }
    const shuffled = shuffleArray(filtered);
    setSentences(shuffled);
    setCurrentIndex(0);
    setResults(null);
    setLiveTranscript('');
    setMicError(null);
    setIsCompleted(false);
  };

  // Sync from Supabase Cloud on mount (enables cross-device sync between Laptop and HP)
  useEffect(() => {
    let isMounted = true;
    Promise.all([fetchCustomFlashcards(), fetchCustomBossQuizzes()]).then(
      ([remoteFc, remoteBq]) => {
        if (!isMounted) return;
        if ((remoteFc && remoteFc.length > 0) || (remoteBq && remoteBq.length > 0)) {
          // Derive speech sentences from cloud-synced flashcards & boss quizzes
          const cloudDerived = deriveSpeechSentences(remoteFc, remoteBq);
          const localStored = getStoredItem(STORAGE_KEYS.CUSTOM_SPEECH_SENTENCES, []);

          // Merge unique sentences (cloud derived + any local inputs)
          const merged = [
            ...cloudDerived,
            ...localStored.filter(
              (l) => !cloudDerived.some((c) => c.sentence.toLowerCase() === l.sentence.toLowerCase())
            ),
          ];

          setStoredItem(STORAGE_KEYS.CUSTOM_SPEECH_SENTENCES, merged);
          setAllSentences(merged);

          setSentences((prev) => {
            // If currently empty or fewer items than cloud data, update with shuffled merged list
            if (prev.length === 0 || prev.length < merged.length) {
              const filtered =
                selectedCategory === 'ALL'
                  ? merged
                  : merged.filter(
                      (s) => (s.category || '').toLowerCase() === selectedCategory.toLowerCase()
                    );
              return shuffleArray(filtered);
            }
            return prev;
          });
        }
      }
    );
    return () => {
      isMounted = false;
    };
  }, []); // Run strictly ONCE on mount!

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [speechLang, setSpeechLang] = useState('en-US'); // 'en-US' | 'en-GB' | 'id-ID'
  const [results, setResults] = useState(null);
  const [micError, setMicError] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Custom sentence input state
  const [customInput, setCustomInput] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Recognition instance & transcript ref
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const latestSpokenRef = useRef('');

  const currentSentence = sentences[currentIndex] || null;
  const isSupported = isSpeechRecognitionSupported();

  // Stop recording cleanly on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, []);

  // Handle adding custom sentence to practice immediately
  const handleAddCustomSentence = (e) => {
    if (e) e.preventDefault();
    const text = customInput.trim();
    if (!text) return;
    const words = text.split(/\s+/).map((w) => w.replace(/[^a-zA-Z]/g, '')).filter((w) => w.length > 3);
    const newObj = {
      id: `custom-speech-${Date.now()}`,
      sentence: text,
      category: selectedCategory !== 'ALL' ? selectedCategory : 'Latihan Kustom',
      difficulty: 'Pribadi',
      focusWords: words.slice(0, 4),
      phoneticTips: 'Lafalkan kata dengan artikulasi jelas dan ritme natural.',
    };
    const updated = [newObj, ...allSentences];
    setAllSentences(updated);
    setStoredItem(STORAGE_KEYS.CUSTOM_SPEECH_SENTENCES, updated);
    setSentences([newObj, ...sentences]);
    setCustomInput('');
    setCurrentIndex(0);
    setResults(null);
    setLiveTranscript('');
    setIsCompleted(false);
    setShowAddModal(false);
  };

  // Pure Manual Toggle: 1st Click = Start, 2nd Click = Stop & Score
  const handleToggleRecord = () => {
    if (!isSupported) {
      setMicError('Browser Anda belum mendukung Web Speech API. Kami menyarankan Google Chrome atau Microsoft Edge untuk modul Speech Lab.');
      return;
    }

    if (isRecording) {
      // USER CLICKED STOP: Manually stop recording and immediately calculate score
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
      return;
    }

    // USER CLICKED START: Initialize and begin listening indefinitely until stopped
    setMicError(null);
    setResults(null);
    setLiveTranscript('');
    finalTranscriptRef.current = '';
    latestSpokenRef.current = '';

    const recognition = createSpeechRecognition(speechLang);
    if (!recognition) return;

    // Explicit configurations: continuous listening with real-time stream
    recognition.lang = speechLang;
    recognition.continuous = true; // DO NOT auto-stop; stay active until user stops
    recognition.interimResults = true; // Stream words in real-time as spoken
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsRecording(true);
      setIsAnalyzing(false);
    };

    recognition.onresult = (event) => {
      // Mobile-friendly non-duplicating transcript processor
      const cleanStream = extractCleanTranscript(event.results);
      finalTranscriptRef.current = cleanStream;
      latestSpokenRef.current = cleanStream;
      setLiveTranscript(cleanStream);
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      setIsRecording(false);
      setIsAnalyzing(false);

      if (event.error === 'not-allowed') {
        setMicError('Akses mikrofon ditolak. Mohon izinkan izin mikrofon di pengaturan browser Anda.');
      } else if (event.error === 'no-speech') {
        setMicError('Tidak ada suara yang terdeteksi. Silakan coba bicara lebih dekat ke mikrofon.');
      } else {
        setMicError(`Gangguan input audio: ${event.error}. Silakan klik untuk mencoba lagi.`);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);

      const transcriptToAnalyze = (latestSpokenRef.current || finalTranscriptRef.current || '').trim();

      if (transcriptToAnalyze && currentSentence) {
        // Fast processing (< 300ms)
        setIsAnalyzing(true);

        setTimeout(() => {
          const evalResult = evaluatePronunciation(currentSentence.sentence, transcriptToAnalyze);
          setResults(evalResult);
          setIsAnalyzing(false);

          if (evalResult.fluencyScore >= 75) {
            playSuccessSound();

            // Update stats in LocalStorage
            const currentStats = getStoredItem(STORAGE_KEYS.STATS, null);
            if (currentStats && currentStats.metrics) {
              const vocabMetric = currentStats.metrics.find((m) => m.id === 'vocabulary');
              if (vocabMetric) {
                const parts = (vocabMetric.value || '0/1200').split('/');
                const parsedCount = parseInt(parts[0], 10);
                const currentCount = isNaN(parsedCount) ? 0 : parsedCount;
                const totalCount = parseInt(parts[1], 10) || 1200;
                vocabMetric.value = `${Math.min(currentCount + 1, totalCount)} / ${totalCount}`;
                setStoredItem(STORAGE_KEYS.STATS, currentStats);
              }
            }
          }
        }, 220);
      } else if (!transcriptToAnalyze) {
        setMicError('Belum ada suara yang tertangkap. Silakan klik mic, baca kalimatnya, lalu klik mic lagi untuk menilai.');
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn('Recognition start failed:', e);
      setMicError('Gagal mengaktifkan mikrofon. Pastikan tidak ada aplikasi lain yang sedang mengunci mic.');
    }
  };

  // Action: Retry same sentence
  const handleRetry = () => {
    setResults(null);
    setLiveTranscript('');
    setMicError(null);
    handleToggleRecord();
  };

  // Action: Next Sentence
  const handleNextSentence = () => {
    setResults(null);
    setLiveTranscript('');
    setMicError(null);

    if (currentIndex < totalSentences - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      playVictoryFanfare();
      setIsCompleted(true);
    }
  };

  // Action: Restart all sentences
  const handleRestart = () => {
    setCurrentIndex(0);
    setResults(null);
    setLiveTranscript('');
    setMicError(null);
    setIsCompleted(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col space-y-4 sm:space-y-5 animate-fadeIn select-none">
      {/* 1. Header Navigation & Filter Controls (Fully Mobile-Friendly) */}
      <div className="flex flex-col gap-2.5 pb-3 border-b border-slate-800/80">
        {/* Row 1: Back Button, Title & Progress Badge */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onBackToDashboard}
              aria-label="Kembali ke Dashboard"
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 transition shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Speech Lab
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  AI Coach
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-1">
                Latih pengucapanmu dengan kontrol rekam manual penuh.
              </p>
            </div>
          </div>

          {/* Progress Counter Badge */}
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow shrink-0">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">TKA English</span>
            <span className="text-slate-300 font-mono text-[11px]">
              {totalSentences === 0 ? '0/0' : `${currentIndex + 1}/${totalSentences}`}
            </span>
          </div>
        </div>

        {/* Row 2: Chapter Dropdown, Accent Selector & Add Custom Sentence Button */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap pt-0.5">
          {/* Chapter / Category Filter Dropdown (Always visible on mobile & desktop) */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs shadow-sm flex-1 sm:flex-none">
            <Filter className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              aria-label="Pilih Bab Latihan"
              className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer pr-1 w-full sm:max-w-[190px] truncate"
            >
              <option value="ALL" className="bg-slate-900 text-white">Semua Bab (Campur)</option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900 text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Accent / Speech Recognition Language Selector */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs shadow-sm shrink-0">
            <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <select
              value={speechLang}
              onChange={(e) => setSpeechLang(e.target.value)}
              aria-label="Pilih Aksen Bahasa"
              className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="en-US" className="bg-slate-900 text-white">English (US)</option>
              <option value="en-GB" className="bg-slate-900 text-white">English (UK)</option>
              <option value="id-ID" className="bg-slate-900 text-white">Indonesia</option>
            </select>
          </div>

          {/* Add Custom Sentence Button */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold transition cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Input Kalimat</span>
          </button>
        </div>
      </div>

      {/* 2. Fallback Notice if Web Speech API is not supported */}
      {!isSupported && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Dukungan Web Speech API:</span>
            <p className="leading-relaxed text-amber-200/90">
              Peramban ini belum mengaktifkan SpeechRecognition. Anda tetap dapat menekan tombol &ldquo;Dengarkan Contoh&rdquo; untuk melatih telinga dengan pengucapan asli, atau buka di browser Chrome/Edge untuk fitur rekam suara langsung.
            </p>
          </div>
        </div>
      )}

      {/* 3. Mic Permission Error Alert */}
      {micError && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300 animate-slideUp">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="flex-1">{micError}</span>
        </div>
      )}

      {/* 4. Empty State, Completion Screen, or Active Practice */}
      {totalSentences === 0 ? (
        <div className="p-6 sm:p-10 rounded-2xl bg-[#0f1828]/95 border border-slate-800 text-center flex flex-col items-center justify-center space-y-4 shadow-xl">
          <div className="p-3.5 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <Mic className="w-8 h-8" />
          </div>
          <div className="max-w-md">
            <h3 className="text-lg font-bold text-white tracking-tight">Speech Lab Siap Digunakan</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Data kalimat bawaan telah dikosongkan. Ketik atau tempelkan kalimat bahasa Inggris yang ingin Anda latih pengucapannya:
            </p>
          </div>
          <form onSubmit={handleAddCustomSentence} className="w-full max-w-lg space-y-3 pt-2">
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Contoh: The government should invest more in renewable energy sources."
              rows={3}
              className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-400"
            />
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => (onNavigateTab ? onNavigateTab('uploader') : onBackToDashboard())}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
              >
                Buka Menu Uploader
              </button>
              <button
                type="submit"
                disabled={!customInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 text-white font-bold text-xs sm:text-sm transition shadow-lg active:scale-95 cursor-pointer"
              >
                Mulai Latih Kalimat Ini
              </button>
            </div>
          </form>
        </div>
      ) : isCompleted ? (
        <div className="p-8 sm:p-10 rounded-2xl bg-[#0f1828]/95 border border-indigo-500/30 text-center flex flex-col items-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Sesi Speech Lab Selesai!
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
            Kamu telah melatih 10 kalimat formal berstandar TKA. Artikulasi dan kefasihan bicaramu semakin mendekati standar native!
          </p>
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={handleRestart}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 transition flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ulangi Latihan</span>
            </button>
            <button
              type="button"
              onClick={onBackToDashboard}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-indigo-400 hover:bg-indigo-300 transition"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      ) : (
        currentSentence && (
          <div className="flex flex-col space-y-4 sm:space-y-5">
            {/* Target Sentence Card (With Real-Time Spoken Words right underneath) */}
            <SentenceCard
              sentenceData={currentSentence}
              liveTranscript={liveTranscript}
              speechLang={speechLang}
            />

            {/* Visualizer & Quick Record Section (100% Manual Toggle) */}
            <RecorderSection
              isRecording={isRecording}
              isAnalyzing={isAnalyzing}
              onToggleRecord={handleToggleRecord}
            />

            {/* Detailed Pronunciation Analysis Results (Dual Score Gauges) */}
            {results && (
              <SpeechResultsCard
                results={results}
                phoneticTips={currentSentence.phoneticTips}
                onRetry={handleRetry}
                onNextSentence={handleNextSentence}
                isLastSentence={currentIndex >= totalSentences - 1}
              />
            )}
          </div>
        )
      )}

      {/* Modal Input Kalimat Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-[#0f1828] border border-slate-700 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Mic className="w-4 h-4 text-indigo-400" />
                Input Kalimat Latihan Baru
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Ketik kalimat bahasa Inggris yang ingin kamu latih..."
              rows={3}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-400"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAddCustomSentence}
                disabled={!customInput.trim()}
                className="px-5 py-2 rounded-xl bg-indigo-500 text-white font-bold text-xs hover:bg-indigo-400 disabled:opacity-40 cursor-pointer"
              >
                Mulai Latih
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
