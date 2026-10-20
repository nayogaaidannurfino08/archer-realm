import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Swords, ArrowLeft, Heart, CheckCircle2, XCircle, Sparkles, Filter } from 'lucide-react';

import { mockBossQuizzes } from '../../data/mockBossQuizzes';
import { BattleStage } from './BattleStage';
import { BossExplanationModal } from './BossExplanationModal';
import { BossVictoryScreen } from './BossVictoryScreen';
import { BossGameOverScreen } from './BossGameOverScreen';

import { 
  playSuccessSound, 
  playErrorSound, 
  playArrowShootSound, 
  playBossHitSound, 
  playPlayerHurtSound, 
  playVictoryFanfare, 
  playGameOverSound 
} from '../../utils/audio';

import { getStoredItem, setStoredItem, STORAGE_KEYS } from '../../utils/storage';
import { shuffleArray } from '../../utils/shuffle';
import { fetchCustomBossQuizzes } from '../../services/supabaseClient';

export const BossArenaView = ({ activeCharacter = 'verdant', onBackToDashboard, onNavigateTab }) => {
  // Helper to load combined master quizzes
  const getCombinedMasterQuizzes = useCallback((customList = null) => {
    const customQuizzes = customList || getStoredItem(STORAGE_KEYS.CUSTOM_BOSS_QUIZZES, []);
    let combined = [...mockBossQuizzes];
    if (customQuizzes && customQuizzes.length > 0) {
      const uniqueCustom = customQuizzes.filter((c) => !mockBossQuizzes.some((m) => m.id === c.id));
      combined = [...uniqueCustom, ...mockBossQuizzes];
    }
    return combined;
  }, []);

  // Master quizzes state
  const [allQuizzes, setAllQuizzes] = useState(getCombinedMasterQuizzes);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Extract distinct categories
  const categories = useMemo(() => {
    const cats = new Set();
    allQuizzes.forEach((q) => {
      const cat = (q.category || '').trim();
      if (cat) cats.add(cat);
    });
    return Array.from(cats);
  }, [allQuizzes]);

  // Quizzes Queue State: filtered and dynamically Fisher-Yates randomized
  const [quizzes, setQuizzes] = useState(() => shuffleArray(getCombinedMasterQuizzes()));
  const totalQuizzes = quizzes.length;

  // Active timers ref for clean bulletproof resets
  const timerRefs = useRef([]);
  const addTimeout = (fn, delay) => {
    const id = setTimeout(fn, delay);
    timerRefs.current.push(id);
    return id;
  };
  const clearAllTimeouts = useCallback(() => {
    timerRefs.current.forEach((id) => clearTimeout(id));
    timerRefs.current = [];
  }, []);

  useEffect(() => {
    return () => clearAllTimeouts();
  }, [clearAllTimeouts]);

  // Helper to apply category filter and fresh Fisher-Yates shuffle
  const applyFilterAndShuffle = useCallback((cat, quizList = allQuizzes) => {
    clearAllTimeouts();
    let filtered = quizList;
    if (cat !== 'ALL') {
      filtered = quizList.filter((q) => (q.category || '').toLowerCase() === cat.toLowerCase());
    }
    const shuffled = shuffleArray(filtered);
    setQuizzes(shuffled);
    setCurrentIndex(0);
    setPlayerHearts(3);
    setBossHp(100);
    setCombatState('idle');
    setIsFlickering(false);
    setShowExplanation(false);
    setWrongQuizData(null);
    setGameStatus('playing');
    setSelectedOption(null);
  }, [allQuizzes, clearAllTimeouts]);

  // Sync from Supabase on mount (executed strictly ONCE to prevent infinite resets)
  useEffect(() => {
    let isMounted = true;
    fetchCustomBossQuizzes().then((remoteQuizzes) => {
      if (!isMounted) return;
      if (remoteQuizzes && remoteQuizzes.length > 0) {
        const freshCombined = getCombinedMasterQuizzes(remoteQuizzes);
        setAllQuizzes(freshCombined);
        setQuizzes((prevQuizzes) => {
          const filtered = selectedCategory === 'ALL'
            ? freshCombined
            : freshCombined.filter((q) => (q.category || '').toLowerCase() === selectedCategory.toLowerCase());
          return shuffleArray(filtered);
        });
      }
    });
    return () => {
      isMounted = false;
    };
  }, []); // Run strictly ONCE on mount!

  // Game States
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playerHearts, setPlayerHearts] = useState(3);
  const [bossHp, setBossHp] = useState(100);
  const [combatState, setCombatState] = useState('idle'); // 'idle' | 'player_attacking' | 'boss_attacking' | 'hurt'
  const [isFlickering, setIsFlickering] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [wrongQuizData, setWrongQuizData] = useState(null);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing' | 'victory' | 'game_over'
  const [selectedOption, setSelectedOption] = useState(null);

  const currentQuiz = quizzes[currentIndex] || null;

  // Restart Handler (Dynamic Re-shuffle with active category filter)
  const handleRestart = () => {
    applyFilterAndShuffle(selectedCategory, allQuizzes);
  };

  // Handle Category Filter Change
  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    setSelectedCategory(newCat);
    applyFilterAndShuffle(newCat, allQuizzes);
  };

  // Answer Submission Handler
  const handleSelectAnswer = useCallback((option) => {
    if (!currentQuiz || combatState !== 'idle' || showExplanation || gameStatus !== 'playing') {
      return;
    }

    setSelectedOption(option.label);

    if (option.isCorrect) {
      // 1. JAWABAN BENAR: Archer attack -> Arrow flies -> Boss shakes -> Auto advance
      setCombatState('player_attacking');
      playArrowShootSound();

      // Projectile impacts dragon
      addTimeout(() => {
        playBossHitSound();
        playSuccessSound();

        const damagePerQuiz = 100 / totalQuizzes;
        const newHp = Math.max(0, bossHp - damagePerQuiz);
        setBossHp(newHp);

        // Check Victory
        if (newHp <= 4 || currentIndex >= totalQuizzes - 1) {
          addTimeout(() => {
            playVictoryFanfare();
            setGameStatus('victory');

            // Persist XP (+250 XP) in LocalStorage
            const currentStats = getStoredItem(STORAGE_KEYS.STATS, null);
            if (currentStats) {
              currentStats.xp = (currentStats.xp || 0) + 250;
              setStoredItem(STORAGE_KEYS.STATS, currentStats);
            }
          }, 500);
        } else {
          // Advance smoothly to next question after 700ms total
          addTimeout(() => {
            setCurrentIndex((prev) => prev + 1);
            setCombatState('idle');
            setSelectedOption(null);
          }, 550);
        }
      }, 300);
    } else {
      // 2. JAWABAN SALAH: Dragon lunges -> Fireball hits Archer -> Heart breaks -> Explanation modal
      setCombatState('boss_attacking');
      playPlayerHurtSound();

      addTimeout(() => {
        setCombatState('hurt');
        playErrorSound();
        const nextHearts = Math.max(0, playerHearts - 1);
        setPlayerHearts(nextHearts);

        addTimeout(() => {
          setWrongQuizData(currentQuiz);
          setShowExplanation(true);
        }, 450);
      }, 350);
    }
  }, [currentQuiz, combatState, showExplanation, gameStatus, bossHp, totalQuizzes, currentIndex, playerHearts]);

  // Dismiss Explanation Modal
  const handleDismissExplanation = () => {
    setShowExplanation(false);
    setWrongQuizData(null);
    setSelectedOption(null);

    // If player died (0 hearts) -> Game Over
    if (playerHearts <= 0) {
      playGameOverSound();
      setGameStatus('game_over');
      return;
    }

    // Trigger 1.2s invincibility flicker and advance to next question
    setIsFlickering(true);
    setCombatState('idle');

    addTimeout(() => {
      setIsFlickering(false);
    }, 1200);

    // Advance to next question
    if (currentIndex < totalQuizzes - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  // Keyboard Shortcuts (A / 1 = True, B / 2 = False)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showExplanation) {
        if (e.key === 'Enter' || e.key === 'Escape') {
          e.preventDefault();
          handleDismissExplanation();
        }
        return;
      }

      if (gameStatus !== 'playing' || combatState !== 'idle' || !currentQuiz) return;

      if (e.key === 'a' || e.key === 'A' || e.key === '1') {
        e.preventDefault();
        const optA = currentQuiz.options.find((o) => o.label === 'A');
        if (optA) handleSelectAnswer(optA);
      } else if (e.key === 'b' || e.key === 'B' || e.key === '2') {
        e.preventDefault();
        const optB = currentQuiz.options.find((o) => o.label === 'B');
        if (optB) handleSelectAnswer(optB);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showExplanation, gameStatus, combatState, currentQuiz, handleSelectAnswer]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col space-y-3.5 sm:space-y-4 animate-fadeIn select-none">
      {/* 1. Header Navigation & Chapter Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBackToDashboard}
            aria-label="Kembali ke Dashboard"
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-amber-400 hover:text-amber-300 transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Boss Arena
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Battle Mode
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Kalahkan naga dengan menganalisis ketepatan kalimat!
            </p>
          </div>
        </div>

        {/* Right Section: Chapter Filter Dropdown & Hearts Indicator */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          {/* Chapter Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-xl px-2.5 py-1.5 shadow-sm text-xs">
            <Filter className="w-3.5 h-3.5 text-amber-400 shrink-0" />
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

          {/* Hearts Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 shadow">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 transition-colors ${
                  i < playerHearts ? 'text-rose-500 fill-rose-500' : 'text-slate-700 fill-slate-800'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Arena Gameplay or Victory/GameOver/Empty Screens */}
      {totalQuizzes === 0 ? (
        <div className="p-8 sm:p-12 rounded-2xl bg-[#0f1828]/90 border border-slate-800 text-center flex flex-col items-center justify-center space-y-4 shadow-xl">
          <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Swords className="w-8 h-8" />
          </div>
          <div className="max-w-md">
            <h3 className="text-lg font-bold text-white">
              {selectedCategory !== 'ALL' ? `Tidak Ada Soal untuk "${selectedCategory}"` : 'Belum Ada Soal Boss Arena'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {selectedCategory !== 'ALL'
                ? 'Tidak ditemukan soal untuk bab ini. Anda dapat beralih ke "Semua Bab (Campur)" atau mengunggah materi baru untuk bab ini.'
                : 'Data soal bawaan telah dikosongkan. Unggah dokumen latihan atau catatan materi TKA di menu Uploader untuk menghasilkan tantangan Boss Arena baru dengan AI.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selectedCategory !== 'ALL' && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('ALL');
                  applyFilterAndShuffle('ALL', allQuizzes);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                Tampilkan Semua Bab
              </button>
            )}
            <button
              type="button"
              onClick={() => (onNavigateTab ? onNavigateTab('uploader') : onBackToDashboard())}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              Buka Menu Uploader
            </button>
          </div>
        </div>
      ) : gameStatus === 'victory' ? (
        <BossVictoryScreen
          xpGained={250}
          remainingHearts={playerHearts}
          totalQuizzes={totalQuizzes}
          onRestart={handleRestart}
          onBackToDashboard={onBackToDashboard}
        />
      ) : gameStatus === 'game_over' ? (
        <BossGameOverScreen
          roundReached={currentIndex + 1}
          onRestart={handleRestart}
          onBackToDashboard={onBackToDashboard}
        />
      ) : (
        <div className="flex flex-col space-y-2.5 sm:space-y-3.5">
          {/* Battle Stage (Compact Height h-44 on mobile ~176px) */}
          <BattleStage
            activeCharacter={activeCharacter}
            playerHearts={playerHearts}
            maxHearts={3}
            bossHp={bossHp}
            currentRound={currentIndex + 1}
            totalRounds={totalQuizzes}
            combatState={combatState}
            isFlickering={isFlickering}
          />

          {/* Question Box & Direct High-Contrast Action Buttons */}
          {currentQuiz && (
            <div className="p-3 sm:p-5 rounded-2xl bg-[#0f1828]/95 border border-slate-800/90 shadow-xl flex flex-col space-y-2.5 sm:space-y-3.5">
              {/* Question Context */}
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {currentQuiz.questionText}
                </span>

                {/* Sentence */}
                <div className="mt-1 p-2.5 sm:p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <p className="text-base sm:text-lg font-bold text-white leading-snug sm:leading-relaxed tracking-tight">
                    &ldquo;{currentQuiz.sentence}&rdquo;
                  </p>
                </div>
              </div>

              {/* TWO LARGE HIGH-CONTRAST BUTTONS: A: True vs B: False */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4 pt-0.5">
                {/* Button A: True */}
                <button
                  type="button"
                  disabled={combatState !== 'idle' || showExplanation}
                  onClick={() => handleSelectAnswer(currentQuiz.options[0])}
                  className={`group relative flex items-center justify-center gap-1.5 sm:gap-3 py-3 px-2 sm:py-4 sm:px-4 rounded-xl sm:rounded-2xl border-2 font-black text-xs sm:text-base transition-all duration-150 cursor-pointer disabled:opacity-50 active:scale-[0.98] ${
                    selectedOption === 'A'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.6)] scale-[1.02]'
                      : 'bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border-emerald-500/40 hover:border-emerald-400 shadow-[0_4px_15px_rgba(16,185,129,0.15)]'
                  }`}
                >
                  <span className="w-5 h-5 sm:w-7 sm:h-7 rounded-md sm:rounded-xl bg-emerald-500/30 group-hover:bg-slate-950/20 flex items-center justify-center text-[11px] sm:text-xs font-black shrink-0">
                    A
                  </span>
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span className="truncate">True (Benar)</span>
                </button>

                {/* Button B: False */}
                <button
                  type="button"
                  disabled={combatState !== 'idle' || showExplanation}
                  onClick={() => handleSelectAnswer(currentQuiz.options[1])}
                  className={`group relative flex items-center justify-center gap-1.5 sm:gap-3 py-3 px-2 sm:py-4 sm:px-4 rounded-xl sm:rounded-2xl border-2 font-black text-xs sm:text-base transition-all duration-150 cursor-pointer disabled:opacity-50 active:scale-[0.98] ${
                    selectedOption === 'B'
                      ? 'bg-rose-500 text-white border-rose-300 shadow-[0_0_25px_rgba(244,63,94,0.6)] scale-[1.02]'
                      : 'bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border-rose-500/40 hover:border-rose-400 shadow-[0_4px_15px_rgba(244,63,94,0.15)]'
                  }`}
                >
                  <span className="w-5 h-5 sm:w-7 sm:h-7 rounded-md sm:rounded-xl bg-rose-500/30 group-hover:bg-slate-950/20 flex items-center justify-center text-[11px] sm:text-xs font-black shrink-0">
                    B
                  </span>
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span className="truncate">False (Salah)</span>
                </button>
              </div>

              {/* Keyboard Helper */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span className="flex items-center gap-1.5 font-mono">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">A</kbd>
                  <span>True</span>
                  <span className="mx-1">&bull;</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">B</kbd>
                  <span>False</span>
                </span>
                <span className="text-slate-400 text-[10px] sm:text-[11px]">
                  Kategori: {currentQuiz.category}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Boss Explanation Modal (Triggered on Wrong Answer) */}
      {showExplanation && (
        <BossExplanationModal
          quiz={wrongQuizData}
          onDismiss={handleDismissExplanation}
        />
      )}
    </div>
  );
};
