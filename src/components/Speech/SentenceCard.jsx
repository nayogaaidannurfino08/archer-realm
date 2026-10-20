import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Mic } from 'lucide-react';
import { speakSentence, stopSpeaking } from '../../utils/speech';

export const SentenceCard = ({ sentenceData, liveTranscript = '', speechLang = 'en-US' }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handlePlayAudio = () => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    speakSentence(
      sentenceData.sentence,
      () => {
        setIsPlayingAudio(false);
      },
      speechLang
    );
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#0f1828]/95 border border-slate-800/90 p-4 sm:p-7 shadow-xl flex flex-col items-center text-center">
      {/* Background Subtle Radial Glow */}
      <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-80 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Badges Row */}
      <div className="flex items-center gap-2 mb-2.5 sm:mb-3 relative z-10">
        <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
          {sentenceData.category || 'Formal Expression'}
        </span>
        <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-slate-800/80 text-slate-400 border border-slate-700/60">
          {sentenceData.difficulty || 'Medium'}
        </span>
      </div>

      {/* Target Sentence (Large, bold, high contrast) */}
      <h3 className="text-base sm:text-2xl font-extrabold text-white max-w-2xl leading-snug sm:leading-relaxed tracking-tight relative z-10">
        &ldquo;{sentenceData.sentence}&rdquo;
      </h3>

      {/* REAL-TIME SPOKEN TRANSCRIPT (Appears immediately as words are detected) */}
      {liveTranscript ? (
        <div className="mt-2.5 sm:mt-3.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-cyan-950/50 border border-cyan-400/40 max-w-xl w-full text-center animate-fadeIn relative z-10 shadow-lg">
          <span className="text-[9px] sm:text-[10px] font-bold text-cyan-300 uppercase tracking-wider flex items-center justify-center gap-1.5 mb-0.5">
            <Mic className="w-3 h-3 text-cyan-400 animate-pulse" />
            Terdeteksi Real-time:
          </span>
          <p className="text-xs sm:text-sm font-semibold text-white tracking-wide italic">
            &ldquo;{liveTranscript}&rdquo;
          </p>
        </div>
      ) : null}

      {/* Audio Sample Speaker Button */}
      <div className="mt-3 sm:mt-4 relative z-10 flex items-center gap-3">
        <button
          type="button"
          onClick={handlePlayAudio}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition-all shadow-md active:scale-95 ${
            isPlayingAudio
              ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]'
              : 'bg-slate-800/70 hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 hover:border-indigo-400'
          }`}
        >
          {isPlayingAudio ? (
            <>
              <VolumeX className="w-4 h-4 animate-pulse" />
              <span>Hentikan Suara</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" />
              <span>Dengarkan Contoh (Native UK/US)</span>
            </>
          )}
        </button>
      </div>

      {/* Focus Words Pills */}
      {sentenceData.focusWords && sentenceData.focusWords.length > 0 && (
        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3.5 border-t border-slate-800/70 w-full flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs relative z-10">
          <span className="text-[11px] font-medium text-slate-500">Kata Kunci Lafal:</span>
          {sentenceData.focusWords.map((word, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 rounded-lg bg-slate-900/80 border border-slate-700/60 text-slate-300 font-mono text-[11px]"
            >
              {word}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
