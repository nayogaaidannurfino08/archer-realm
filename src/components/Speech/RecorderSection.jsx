import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Loader2, Zap } from 'lucide-react';

export const RecorderSection = ({
  isRecording = false,
  isAnalyzing = false,
  onToggleRecord,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-5 sm:p-6 rounded-2xl bg-[#0f1828]/95 border border-slate-800/90 shadow-xl relative overflow-hidden">
      {/* Sound Waveforms & Central Microphone */}
      <div className="flex items-center justify-center gap-6 sm:gap-10 py-2 w-full max-w-md relative z-10">
        {/* Left Simulated Animated Soundwave */}
        <div className="flex items-center gap-1.5 h-12">
          {[12, 26, 42, 22, 34].map((height, i) => (
            <motion.div
              key={i}
              className={`w-1 sm:w-1.5 rounded-full transition-colors ${
                isRecording ? 'bg-cyan-400' : 'bg-slate-700'
              }`}
              animate={
                isRecording
                  ? {
                      height: [10, height, 14, height * 0.7, 10],
                    }
                  : { height: 10 }
              }
              transition={{
                duration: 0.5,
                repeat: isRecording ? Infinity : 0,
                delay: i * 0.08,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Big Record Microphone Button */}
        <div className="relative flex flex-col items-center">
          {/* Glowing pulse rings when recording */}
          {isRecording && (
            <div className="absolute -inset-3 rounded-full bg-rose-500/30 animate-ping pointer-events-none" />
          )}

          <button
            type="button"
            onClick={onToggleRecord}
            disabled={isAnalyzing}
            aria-label={isRecording ? 'Selesai Merekam' : 'Mulai Merekam'}
            className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-2xl active:scale-95 cursor-pointer disabled:opacity-50 ${
              isRecording
                ? 'bg-rose-500/25 border-rose-400 text-rose-300 shadow-[0_0_30px_rgba(244,63,94,0.7)]'
                : 'bg-cyan-500/15 border-cyan-400 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.4)]'
            }`}
          >
            {isAnalyzing ? (
              <Loader2 className="w-8 h-8 animate-spin text-cyan-300" />
            ) : isRecording ? (
              <Square className="w-7 h-7 fill-current" />
            ) : (
              <Mic className="w-7 h-7 sm:w-8 sm:h-8" />
            )}
          </button>
        </div>

        {/* Right Simulated Animated Soundwave */}
        <div className="flex items-center gap-1.5 h-12">
          {[34, 22, 42, 26, 12].map((height, i) => (
            <motion.div
              key={i}
              className={`w-1 sm:w-1.5 rounded-full transition-colors ${
                isRecording ? 'bg-cyan-400' : 'bg-slate-700'
              }`}
              animate={
                isRecording
                  ? {
                      height: [10, height, 14, height * 0.7, 10],
                    }
                  : { height: 10 }
              }
              transition={{
                duration: 0.5,
                repeat: isRecording ? Infinity : 0,
                delay: i * 0.08,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>

      {/* Guide Status Text (100% Manual Control) */}
      <div className="mt-3 text-center relative z-10 flex flex-col items-center">
        <p
          className={`text-xs sm:text-sm font-bold tracking-tight transition-colors ${
            isRecording
              ? 'text-rose-400'
              : isAnalyzing
              ? 'text-amber-400'
              : 'text-slate-300'
          }`}
        >
          {isAnalyzing
            ? 'Memproses analisis fonem & kelancaran...'
            : isRecording
            ? 'Sedang merekam suara... (Klik tombol mic lagi untuk selesai & nilai)'
            : 'Tap to record (Klik mikrofon untuk mulai bicara)'}
        </p>

        {isRecording && (
          <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block mr-0.5" />
            Mic tetap aktif sampai Anda menekan tombol stop
          </span>
        )}
      </div>
    </div>
  );
};
