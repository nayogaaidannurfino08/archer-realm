import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Mic, Activity, ArrowLeft, AlertCircle, Award, RotateCcw } from 'lucide-react';

import { mockSpeechSentences } from '../../data/mockSpeechSentences';
import { SentenceCard } from './SentenceCard';
import { RecorderSection } from './RecorderSection';
import { SpeechResultsCard } from './SpeechResultsCard';

import { 
  createSpeechRecognition, 
  isSpeechRecognitionSupported, 
  evaluatePronunciation 
} from '../../utils/speech';
import { playSuccessSound, playVictoryFanfare } from '../../utils/audio';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from '../../utils/storage';

export const SpeechLabView = ({ onBackToDashboard }) => {
  const sentences = useMemo(() => [...mockSpeechSentences], []);
  const totalSentences = sentences.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [results, setResults] = useState(null);
  const [micError, setMicError] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

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

    const recognition = createSpeechRecognition();
    if (!recognition) return;

    // Explicit configurations: continuous listening with real-time stream
    recognition.lang = 'en-US';
    recognition.continuous = true; // DO NOT auto-stop; stay active until user stops
    recognition.interimResults = true; // Stream words in real-time as spoken
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsRecording(true);
      setIsAnalyzing(false);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      // Standard Web Speech API parsing: separates finalized results from interim stream
      for (let i = 0; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript + ' ';
        } else {
          interimTranscript += item[0].transcript;
        }
      }

      finalTranscriptRef.current = finalTranscript.trim();
      const currentLive = (finalTranscript + interimTranscript).trim();
      latestSpokenRef.current = currentLive;
      setLiveTranscript(currentLive);
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

      const transcriptToAnalyze = (latestSpokenRef.current || finalTranscriptRef.current).trim();

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
                const parts = vocabMetric.value.split('/');
                const currentCount = parseInt(parts[0], 10) || 842;
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
      {/* 1. Header Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToDashboard}
            aria-label="Kembali ke Dashboard"
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Speech Lab
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                AI Coach
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Latih pengucapanmu dengan kontrol rekam manual penuh.
            </p>
          </div>
        </div>

        {/* Right Badge: TKA English with Sound Waves */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">TKA English</span>
          <span className="text-slate-400 font-mono text-[11px]">
            {currentIndex + 1}/{totalSentences}
          </span>
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

      {/* 4. Completion Screen or Active Practice */}
      {isCompleted ? (
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
    </div>
  );
};
