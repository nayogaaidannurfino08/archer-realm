import React from 'react';
import { Layers, Mic, CloudUpload, ArrowRight, Swords } from 'lucide-react';
import { mockBentoCards } from '../../data/mockBentoCards';

export const BentoCards = ({ onNavigateTab }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 lg:gap-5 mt-4 sm:mt-5">
      {mockBentoCards.map((card) => {
        // Boss card has fantasy artwork banner
        if (card.isFantasyArt) {
          return (
            <div
              key={card.id}
              onClick={() => onNavigateTab(card.targetTab)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onNavigateTab(card.targetTab)}
              className="group relative overflow-hidden rounded-2xl min-h-[160px] md:min-h-[180px] p-4 sm:p-5 md:p-6 border border-slate-700/60 transition-all duration-300 hover:border-amber-400/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] flex flex-col justify-between cursor-pointer select-none"
            >
              {/* Background Fantasy Illustration */}
              <img 
                src="/assets/boss-banner.jpg" 
                alt="Boss Comprehension Banner" 
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 filter brightness-90 group-hover:brightness-100"
              />

              {/* Gradient Dark Backdrop for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#080d17]/90 via-[#080d17]/50 to-transparent pointer-events-none" />

              {/* Top empty spacer for layout balance */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-sm">
                  <Swords className="w-3 h-3" />
                  Boss Arena
                </span>
              </div>

              {/* Content & Action Arrow */}
              <div className="relative z-10 flex items-end justify-between gap-4 mt-6">
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-white tracking-tight drop-shadow-md">
                    {card.title}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-200/90 mt-1 max-w-[280px] leading-relaxed drop-shadow">
                    {card.description}
                  </p>
                </div>

                <div className="w-9 h-9 rounded-full bg-slate-900/80 border border-slate-600/70 text-white flex items-center justify-center shrink-0 backdrop-blur-md group-hover:bg-white group-hover:text-slate-950 group-hover:translate-x-1 transition-all duration-200 shadow-md">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        }

        // Standard SaaS / Edutech Bento Cards
        return (
          <div
            key={card.id}
            onClick={() => onNavigateTab(card.targetTab)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onNavigateTab(card.targetTab)}
            className={`group relative overflow-hidden rounded-2xl min-h-[160px] md:min-h-[180px] p-4 sm:p-5 md:p-6 border bg-gradient-to-br ${card.accentColor} ${card.borderColor} transition-all duration-300 flex flex-col justify-between cursor-pointer select-none`}
          >
            {/* Top Icon Badge */}
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-2xl border transition-transform duration-300 group-hover:scale-105 ${
                card.id === 'flashcard' 
                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                  : card.id === 'speech-lab'
                  ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300'
                  : 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300'
              }`}>
                {card.id === 'flashcard' && <Layers className="w-6 h-6" />}
                {card.id === 'speech-lab' && <Mic className="w-6 h-6" />}
                {card.id === 'uploader' && <CloudUpload className="w-6 h-6" />}
              </div>
            </div>

            {/* Title, Subtitle, and Action Arrow */}
            <div className="flex items-end justify-between gap-4 mt-6">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
                  {card.title}
                </h3>
                <p className="text-xs md:text-sm text-slate-300/80 mt-1 max-w-[280px] leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-all duration-200 ${card.buttonColor}`}>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
