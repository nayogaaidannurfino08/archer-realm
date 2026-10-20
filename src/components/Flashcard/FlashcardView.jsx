import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Check, X, Sparkles, Layers, Filter } from 'lucide-react';

import { mockFlashcards } from '../../data/mockFlashcards';
import { FlashcardCard } from './FlashcardCard';
import { SideNote } from './SideNote';
import { ExplanationModal } from './ExplanationModal';
import { CompletionCard } from './CompletionCard';

import { playSuccessSound, playErrorSound } from '../../utils/audio';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from '../../utils/storage';
import { shuffleArray } from '../../utils/shuffle';
import { fetchCustomFlashcards } from '../../services/supabaseClient';

export const FlashcardView = ({ onBackToDashboard, onNavigateTab }) => {
  // Helper to load combined master cards
  const getCombinedMasterCards = useCallback((customList = null) => {
    const customCards = customList || getStoredItem(STORAGE_KEYS.CUSTOM_FLASHCARDS, []);
    let combined = [...mockFlashcards];
    if (customCards && customCards.length > 0) {
      const uniqueCustom = customCards.filter((c) => !mockFlashcards.some((m) => m.id === c.id));
      combined = [...uniqueCustom, ...mockFlashcards];
    }
    return combined;
  }, []);

  // Master allCards state
  const [allCards, setAllCards] = useState(getCombinedMasterCards);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Extract distinct categories
  const categories = useMemo(() => {
    const cats = new Set();
    allCards.forEach((c) => {
      const cat = (c.category || '').trim();
      if (cat) cats.add(cat);
    });
    return Array.from(cats);
  }, [allCards]);

  // Deck Queue State: filtered and dynamically Fisher-Yates randomized
  const [deck, setDeck] = useState(() => shuffleArray(getCombinedMasterCards()));
  const [totalCardsCount, setTotalCardsCount] = useState(() => deck.length);

  // Helper to apply category filter and fresh Fisher-Yates shuffle
  const applyFilterAndShuffle = useCallback((cat, cards = allCards) => {
    let filtered = cards;
    if (cat !== 'ALL') {
      filtered = cards.filter((c) => (c.category || '').toLowerCase() === cat.toLowerCase());
    }
    const shuffled = shuffleArray(filtered);
    setDeck(shuffled);
    setTotalCardsCount(shuffled.length);
    setMissedCardIds(new Set());
    setSessionStats({
      firstTryCorrect: 0,
      repeatedCount: 0,
      completedCards: 0,
      totalCards: shuffled.length,
    });
    setShowExplanation(false);
    setWrongCardData(null);
  }, [allCards]);

  // Sync from Supabase on mount with local mock fallback
  useEffect(() => {
    let isMounted = true;
    fetchCustomFlashcards().then((remoteCards) => {
      if (isMounted && remoteCards && remoteCards.length > 0) {
        const freshCombined = getCombinedMasterCards(remoteCards);
        setAllCards(freshCombined);
        applyFilterAndShuffle(selectedCategory, freshCombined);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [getCombinedMasterCards, applyFilterAndShuffle, selectedCategory]);

  // Handle Category Filter Change
  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    setSelectedCategory(newCat);
    applyFilterAndShuffle(newCat, allCards);
  };

  // Active Card & Animation State
  const [isExiting, setIsExiting] = useState(false);
  const [exitDirection, setExitDirection] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [wrongCardData, setWrongCardData] = useState(null);

  // Session Stats State
  const [sessionStats, setSessionStats] = useState({
    firstTryCorrect: 0,
    repeatedCount: 0,
    completedCards: 0,
    totalCards: deck.length,
  });

  // Track cards that were missed in this session to distinguish first-try correct
  const [missedCardIds, setMissedCardIds] = useState(new Set());

  const currentCard = deck[0] || null;
  const isDeckCompleted = deck.length === 0;

  // Handle Answer / Swipe Logic
  const handleAnswer = useCallback((direction) => {
    if (!currentCard || isExiting || showExplanation) return;

    // Direction 'left' corresponds to Choice A, 'right' corresponds to Choice B
    const chosenOption = direction === 'left' ? 'A' : 'B';
    const isCorrect = chosenOption === currentCard.correctChoice;

    setIsExiting(true);
    setExitDirection(direction);

    setTimeout(() => {
      if (isCorrect) {
        // Correct Answer
        playSuccessSound();

        const wasMissedBefore = missedCardIds.has(currentCard.id);
        setSessionStats((prev) => ({
          ...prev,
          firstTryCorrect: wasMissedBefore ? prev.firstTryCorrect : prev.firstTryCorrect + 1,
          completedCards: prev.completedCards + 1,
        }));

        // Update LocalStorage Stats (increment vocabulary mastered)
        const currentStats = getStoredItem(STORAGE_KEYS.STATS, null);
        if (currentStats && currentStats.metrics) {
          const vocabMetric = currentStats.metrics.find((m) => m.id === 'vocabulary');
          if (vocabMetric) {
            const parts = (vocabMetric.value || '0 / 1200').split('/');
            const parsedCount = parseInt(parts[0], 10);
            const currentCount = isNaN(parsedCount) ? 0 : parsedCount;
            const totalCount = parseInt(parts[1], 10) || 1200;
            vocabMetric.value = `${Math.min(currentCount + 1, totalCount)} / ${totalCount}`;
            setStoredItem(STORAGE_KEYS.STATS, currentStats);
          }
        }

        // Remove card from active deck
        setDeck((prevDeck) => prevDeck.slice(1));
      } else {
        // Wrong Answer
        playErrorSound();

        setMissedCardIds((prev) => new Set(prev).add(currentCard.id));
        setSessionStats((prev) => ({
          ...prev,
          repeatedCount: prev.repeatedCount + 1,
        }));

        // Store card data for explanation modal
        setWrongCardData(currentCard);
        setShowExplanation(true);

        // Put the card at the end of the queue so user gets to master it
        setDeck((prevDeck) => {
          const [failedCard, ...rest] = prevDeck;
          return [...rest, failedCard];
        });
      }

      setIsExiting(false);
      setExitDirection(null);
    }, 280);
  }, [currentCard, isExiting, showExplanation, missedCardIds]);

  // Close Explanation Modal
  const handleDismissExplanation = () => {
    setShowExplanation(false);
    setWrongCardData(null);
  };

  // Keyboard Shortcuts Support
  useEffect(() => {
    const handleKeyDown = (e) => {
      // If explanation is open, Enter or Escape closes it
      if (showExplanation) {
        if (e.key === 'Enter' || e.key === 'Escape') {
          e.preventDefault();
          handleDismissExplanation();
        }
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleAnswer('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handleAnswer('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAnswer, showExplanation]);

  // Restart Deck (Dynamic Re-shuffle with active category filter)
  const handleRestart = () => {
    applyFilterAndShuffle(selectedCategory, allCards);
  };

  // Calculate Progress Percent
  const progressPercent = totalCardsCount > 0 
    ? Math.min(100, Math.round((sessionStats.completedCards / totalCardsCount) * 100))
    : 0;

  return (
    <div className="w-full flex flex-col space-y-5 animate-fadeIn select-none">
      {/* 1. Header Navigation, Chapter Filter & Progress Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={onBackToDashboard}
            aria-label="Kembali ke Dashboard"
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-amber-400 hover:text-amber-300 transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Flashcard Duel
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                TKA Mode
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Swipe kanan jika jawaban benar, kiri jika salah.
            </p>
          </div>
        </div>

        {/* Right Section: Chapter Filter Dropdown & Progress Bar */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 w-full md:w-auto">
          {/* Chapter Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-xl px-2.5 py-1.5 shadow-sm text-xs">
            <Filter className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              aria-label="Filter Bab / Modul"
              className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer pr-1 max-w-[150px] sm:max-w-[190px] truncate"
            >
              <option value="ALL" className="bg-slate-900 text-white">
                Semua Bab (Campur)
              </option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900 text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Progress Bar & Counter (Matches Screenshot 12 / 20 style) */}
          <div className="flex items-center gap-2.5 flex-1 md:w-48">
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-300 shrink-0 font-mono">
              {sessionStats.completedCards} / {totalCardsCount}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Duel Arena or Completion / Empty Screen */}
      {totalCardsCount === 0 ? (
        <div className="p-8 sm:p-12 rounded-2xl bg-[#0f1828]/90 border border-slate-800 text-center flex flex-col items-center justify-center space-y-4 shadow-xl">
          <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Layers className="w-8 h-8" />
          </div>
          <div className="max-w-md">
            <h3 className="text-lg font-bold text-white">
              {selectedCategory !== 'ALL' ? `Tidak Ada Kartu untuk "${selectedCategory}"` : 'Belum Ada Kartu Flashcard'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {selectedCategory !== 'ALL'
                ? 'Tidak ditemukan kartu untuk bab ini. Anda dapat beralih ke "Semua Bab (Campur)" atau mengunggah materi baru untuk bab ini.'
                : 'Data kartu bawaan telah dikosongkan. Unggah dokumen latihan atau catatan materi TKA di menu Uploader untuk membuat Flashcard baru dengan AI.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selectedCategory !== 'ALL' && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('ALL');
                  applyFilterAndShuffle('ALL', allCards);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                Tampilkan Semua Bab
              </button>
            )}
            <button
              type="button"
              onClick={() => (onNavigateTab ? onNavigateTab('uploader') : onBackToDashboard())}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              Buka Menu Uploader
            </button>
          </div>
        </div>
      ) : isDeckCompleted ? (
        <CompletionCard 
          stats={sessionStats} 
          onRestart={handleRestart} 
          onBackToDashboard={onBackToDashboard} 
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left/Center: Card Duel Stage */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center p-3 sm:p-8 rounded-2xl bg-[#0f1828]/80 border border-slate-800/90 shadow-xl relative min-h-[430px] sm:min-h-[460px]">
            {/* Interactive Flashcard Card */}
            <FlashcardCard 
              card={currentCard}
              onSwipe={handleAnswer}
              disabled={showExplanation || isExiting}
              isExiting={isExiting}
              exitDirection={exitDirection}
            />

            {/* Bottom Swipe Action Controls (Thumb-friendly on mobile) */}
            <div className="flex items-center gap-6 sm:gap-10 mt-4 sm:mt-5 relative z-10">
              {/* Swipe Left Button (Red X) */}
              <div className="flex flex-col items-center">
                <button 
                  type="button"
                  onClick={() => handleAnswer('left')}
                  disabled={showExplanation || isExiting}
                  aria-label="Swipe Kiri"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-rose-500/20 border-2 border-rose-500/40 text-rose-400 hover:bg-rose-500 hover:text-white active:scale-95 transition-all shadow-lg flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  <X className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
                </button>
                <span className="text-xs font-semibold text-slate-300 mt-1.5 sm:mt-2">
                  Swipe Kiri
                </span>
                <span className="text-[10px] text-slate-400">
                  (Opsi A: {currentCard?.wordA})
                </span>
              </div>

              <span className="text-xs text-slate-600 font-medium">atau</span>

              {/* Swipe Right Button (Green Check) */}
              <div className="flex flex-col items-center">
                <button 
                  type="button"
                  onClick={() => handleAnswer('right')}
                  disabled={showExplanation || isExiting}
                  aria-label="Swipe Kanan"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 active:scale-95 transition-all shadow-lg flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
                </button>
                <span className="text-xs font-semibold text-slate-300 mt-1.5 sm:mt-2">
                  Swipe Kanan
                </span>
                <span className="text-[10px] text-slate-400">
                  (Opsi B: {currentCard?.wordB})
                </span>
              </div>
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">&larr;</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">A</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">&rarr;</kbd>
              <span className="ml-1 text-slate-400">(Keyboard Support)</span>
            </div>
          </div>

          {/* Right Column: Dynamic Side Note Widget */}
          <div className="w-full">
            <SideNote 
              card={currentCard} 
              stats={sessionStats} 
            />
          </div>
        </div>
      )}

      {/* 3. Floating Modal Penjelasan Salah (Red Pop-up) */}
      {showExplanation && (
        <ExplanationModal 
          card={wrongCardData} 
          onDismiss={handleDismissExplanation} 
        />
      )}
    </div>
  );
};
