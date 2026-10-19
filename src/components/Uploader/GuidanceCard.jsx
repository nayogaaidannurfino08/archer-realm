import React from 'react';
import { Info, HelpCircle, Layers, Swords, BookOpen, Check } from 'lucide-react';

export const GuidanceCard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
      {/* 1. Materi yang Direkomendasikan */}
      <div className="p-4 rounded-2xl bg-[#0c1424]/80 border border-slate-800/80 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2 text-cyan-400">
            <BookOpen className="w-4 h-4 shrink-0" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Format Materi Ideal
            </h4>
          </div>
          <ul className="text-xs text-slate-400 space-y-1.5 leading-relaxed">
            <li className="flex items-start gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
              <span>Lembar soal latihan & kisi-kisi grammar TKA.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
              <span>Artikel berita atau jurnal ilmiah bahasa Inggris formal.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
              <span>Daftar kata membingungkan / sering tertukar.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 2. Output Flashcard Duel */}
      <div className="p-4 rounded-2xl bg-[#0c1424]/80 border border-slate-800/80 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2 text-indigo-400">
            <Layers className="w-4 h-4 shrink-0" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Output: Flashcard Duel
            </h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-2">
            AI akan mengekstrak pasangan kata jebakan (Confusion Words), menyusun soal rumpang, serta rumus pembeda kilat.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-indigo-300 font-medium">
            <Check className="w-3.5 h-3.5 text-indigo-400" />
            <span>Format Swipe Kiri vs Kanan</span>
          </div>
        </div>
      </div>

      {/* 3. Output Boss Arena */}
      <div className="p-4 rounded-2xl bg-[#0c1424]/80 border border-slate-800/80 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2 text-emerald-400">
            <Swords className="w-4 h-4 shrink-0" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Output: Boss Arena
            </h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-2">
            AI menyusun soal analisis pemahaman kalimat True/False untuk melatih ketelitian struktur grammar tingkat tinggi.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-medium">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Format Battle 2D Kuis Konsep</span>
          </div>
        </div>
      </div>
    </div>
  );
};
