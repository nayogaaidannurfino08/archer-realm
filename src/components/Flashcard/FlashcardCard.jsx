import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

export const FlashcardCard = ({ 
  card, 
  onSwipe, // (direction: 'left' | 'right') => void
  disabled = false,
  isExiting = false,
  exitDirection = null,
}) => {
  const x = useMotionValue(0);

  // Transform drag distance into rotation (-15 deg to +15 deg)
  const rotate = useTransform(x, [-250, 0, 250], [-14, 0, 14]);

  // Transform drag distance into color tint opacity
  const rightOpacity = useTransform(x, [10, 120], [0, 0.4]);
  const leftOpacity = useTransform(x, [-10, -120], [0, 0.4]);

  const handleDragEnd = (event, info) => {
    if (disabled) return;
    const swipeThreshold = 90;
    const velocityThreshold = 400;

    if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      onSwipe('right');
    } else if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      onSwipe('left');
    }
  };

  if (!card) return null;

  return (
    <div className="relative w-full max-w-md h-[400px] flex items-center justify-center select-none">
      {/* Background Layer 2 (Deepest) */}
      <div className="absolute top-4 w-[85%] h-[340px] rounded-2xl bg-[#0d1728]/70 border border-slate-800/70 shadow-lg -z-20 transform -translate-y-1 scale-95 opacity-50" />

      {/* Background Layer 1 (Middle) */}
      <div className="absolute top-7 w-[92%] h-[350px] rounded-2xl bg-[#111e33]/80 border border-slate-700/60 shadow-xl -z-10 transform scale-[0.98] opacity-75" />

      {/* Main Active Swipeable Card */}
      <motion.div
        drag={disabled ? false : 'x'}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        style={{ x, rotate }}
        animate={
          isExiting 
            ? { 
                x: exitDirection === 'right' ? 450 : -450, 
                opacity: 0,
                rotate: exitDirection === 'right' ? 20 : -20,
                transition: { duration: 0.28, ease: 'easeOut' }
              } 
            : { x: 0, opacity: 1, rotate: 0 }
        }
        whileTap={{ cursor: 'grabbing' }}
        className="w-full h-[375px] rounded-2xl bg-[#131f33] border border-slate-700/80 p-6 sm:p-7 shadow-2xl flex flex-col justify-between cursor-grab active:cursor-grabbing relative overflow-hidden backdrop-blur-md"
      >
        {/* Dynamic Drag Tint Overlays */}
        {/* Green tint for dragging right */}
        <motion.div 
          style={{ opacity: rightOpacity }}
          className="absolute inset-0 bg-emerald-500/25 border-2 border-emerald-400 rounded-2xl pointer-events-none transition-opacity" 
        />
        {/* Red tint for dragging left */}
        <motion.div 
          style={{ opacity: leftOpacity }}
          className="absolute inset-0 bg-rose-500/25 border-2 border-rose-400 rounded-2xl pointer-events-none transition-opacity" 
        />

        {/* Top: Category Badge */}
        <div className="flex items-center justify-center relative z-10">
          <span className="px-3.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800/90 text-slate-300 border border-slate-700 shadow-sm">
            {card.category || 'Confusion Words'}
          </span>
        </div>

        {/* Center: Words in Duel (Large & Contrasted) */}
        <div className="flex flex-col items-center justify-center my-auto py-2 relative z-10 text-center">
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">
              {card.wordA}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-400 my-1 uppercase tracking-widest">
              vs
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">
              {card.wordB}
            </span>
          </div>

          {/* Context Sentence with Blank */}
          {card.contextQuestion && (
            <div className="mt-4 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 max-w-sm">
              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed italic">
                &ldquo;{card.contextQuestion}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Bottom Context Subtitle & Choice Pill Helpers */}
        <div className="pt-3 border-t border-slate-700/60 flex flex-col items-center relative z-10 text-center">
          <div className="flex items-center justify-between w-full text-[10px] sm:text-[11px] font-semibold text-slate-400 mb-1.5 px-1">
            <span className="text-rose-400/90 flex items-center gap-1">
              &larr; Opsi A: {card.wordA}
            </span>
            <span className="text-emerald-400/90 flex items-center gap-1">
              Opsi B: {card.wordB} &rarr;
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate max-w-[280px]">
            {card.subtitle}
          </p>
        </div>
      </motion.div>
    </div>
  );
};
