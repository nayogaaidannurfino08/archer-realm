import React from 'react';
import { AlignLeft, Sparkles, Trash2, BookOpen } from 'lucide-react';
import { mockSampleMaterials } from '../../data/mockSampleMaterials';

export const PasteTextZone = ({ textValue, onChangeText, onClearText }) => {
  const wordCount = textValue.trim() ? textValue.trim().split(/\s+/).length : 0;
  const charCount = textValue.length;

  const handleSelectSample = (sample) => {
    onChangeText(sample.content);
  };

  return (
    <div className="flex flex-col space-y-3">
      {/* Sample Pill Triggers */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Isi Cepat dengan Contoh Materi TKA:</span>
        </span>
        {mockSampleMaterials.map((sample) => (
          <button
            key={sample.id}
            type="button"
            onClick={() => handleSelectSample(sample)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/25 transition-all flex items-center gap-1.5"
          >
            <BookOpen className="w-3 h-3 text-cyan-400" />
            <span>{sample.category}</span>
          </button>
        ))}
      </div>

      {/* Textarea Box */}
      <div className="relative rounded-2xl bg-[#0a1526]/80 border border-slate-700/80 focus-within:border-cyan-400 transition-colors shadow-inner overflow-hidden">
        <textarea
          rows={9}
          value={textValue}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder={`Tempelkan (paste) catatan materi TKA, ringkasan grammar, artikel bacaan bahasa Inggris, atau daftar kata di sini...\n\nContoh:\n1. Negative Inversion: "Rarely have we witnessed such resilience..."\n2. Confusion Words: Principle vs Principal, Affect vs Effect\n3. Subjunctive Mood: "The committee demanded that he be present..."`}
          className="w-full p-4 sm:p-5 bg-transparent text-slate-100 placeholder-slate-500 text-xs sm:text-sm leading-relaxed resize-y focus:outline-none font-sans"
        />

        {/* Bottom Bar inside Textarea: Stats & Clear */}
        <div className="px-4 py-2 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>{charCount} karakter</span>
            <span>•</span>
            <span>{wordCount} kata</span>
          </div>

          {textValue && (
            <button
              type="button"
              onClick={onClearText}
              className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
