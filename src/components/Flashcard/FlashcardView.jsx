import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Check, X, Sparkles, Layers } from 'lucide-react';

import { mockFlashcards } from '../../data/mockFlashcards';
import { FlashcardCard } from './FlashcardCard';
import { SideNote } from './SideNote';
import { ExplanationModal } from './ExplanationModal';
import { CompletionCard } from './CompletionCard';

import { playSuccessSound, playErrorSound } from '../../utils/audio';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from '../../utils/storage';
import { shuffleArray } from '../../utils/shuffle';
import { fetchCustomFlashcards } from '../../services/supabaseClient';

export const FlashcardView = ({ onBackToDashboard }) => {
  // Helper to load and dynamically shuffle the deck (Fisher-Yates)
  const getShuffledCards = useCallback((customList = null) => {
    const customCards = customList || getStoredItem(STORAGE_KEYS.CUSTOM_FLASHCARDS, []);
    let combined = [...mockFlashcards];
    if (customCards && customCards.length > 0) {
      const uniqueCustom = customCards.filter((c) => !mockFlashcards.some((m) => m.id === c.id));
      combined = [...uniqueCustom, ...mockFlashcards];
    }
    return shuffleArray(combined);
  }, []);

  // Deck Queue State: dynamic Fisher-Yates randomized queue
  const [deck, setDeck] = useState(getShuffledCards);
  const [totalCardsCount, setTotalCardsCount] = useState(() => deck.length);

  // Sync from Supabase on mount with local mock fallback
  useEffect(() => {
    let isMounted = true;
    fetchCustomFlashcards().then((remoteCards) => {
      if (isMounted && remoteCards && remoteCards.length > 0) {
        const freshDeck = getShuffledCards(remoteCards);
        setDeck(freshDeck);
        setTotalCardsCount(freshDeck.length);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [getShuffledCards]);

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
            const parts = vocabMetric.value.split('/');
            const currentCount = parseInt(parts[0], 10) || 842;
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

  // Restart Deck (Dynamic Re-shuffle)
  const handleRestart = () => {
    const freshShuffled = getShuffledCards();
    setDeck(freshShuffled);
    setTotalCardsCount(freshShuffled.length);
    setMissedCardIds(new Set());
    setSessionStats({
      firstTryCorrect: 0,
      repeatedCount: 0,
      completedCards: 0,
      totalCards: freshShuffled.length,
    });
    setShowExplanation(false);
    setWrongCardData(null);
  };

  // Calculate Progress Percent
  const progressPercent = Math.min(
    100,
    Math.round((sessionStats.completedCards / totalCardsCount) * 100)
  );

  return (
    <div className="w-full flex flex-col space-y-5 animate-fadeIn select-none">
      {/* 1. Header Navigation & Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
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

        {/* Progress Bar & Counter (Matches Screenshot 12 / 20 style) */}
        <div className="flex items-center gap-3.5 w-full sm:w-56">
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

      {/* 2. Main Duel Arena or Completion Screen */}
      {isDeckCompleted ? (
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
