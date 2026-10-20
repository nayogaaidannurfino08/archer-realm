import { createClient } from '@supabase/supabase-js';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from '../utils/storage.js';

// 1. Supabase Environment Variable Configuration
const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '';
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || '';

export const isSupabaseConfigured = () => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes('your_supabase') &&
    !supabaseAnonKey.includes('your_supabase')
  );
};

// 2. Client Singleton
let supabaseInstance = null;

export const getSupabaseClient = () => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
};

// 3. Sync Flashcards (Supabase + LocalStorage Fallback)
export const syncFlashcardsToSupabase = async (flashcards) => {
  if (!Array.isArray(flashcards) || flashcards.length === 0) {
    return { synced: false, count: 0 };
  }

  // Always update LocalStorage first as robust local fallback
  const existingFc = getStoredItem(STORAGE_KEYS.CUSTOM_FLASHCARDS, []);
  const mergedFc = [
    ...flashcards,
    ...existingFc.filter((e) => !flashcards.some((f) => f.id === e.id)),
  ];
  setStoredItem(STORAGE_KEYS.CUSTOM_FLASHCARDS, mergedFc);

  // If Supabase is configured, upsert to remote database
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) return { synced: false, error: 'Client not ready' };

      const rows = flashcards.map((fc) => ({
        id: fc.id,
        word_a: fc.wordA,
        word_b: fc.wordB,
        category: fc.category || 'Confusion Words',
        subtitle: fc.subtitle || '',
        context_question: fc.contextQuestion,
        correct_choice: fc.correctChoice,
        explanation: {
          ...(typeof fc.explanation === 'object' ? fc.explanation : {}),
          quickTips: fc.quickTips || (typeof fc.explanation === 'object' ? fc.explanation.quickTips : ''),
        },
      }));

      const { data, error } = await supabase
        .from('flashcards')
        .upsert(rows, { onConflict: 'id' });

      if (error) {
        console.warn('Supabase flashcards sync warning:', error.message);
        return { synced: false, error: error.message };
      }

      return { synced: true, data };
    } catch (err) {
      console.warn('Supabase sync network error, falling back to LocalStorage:', err);
      return { synced: false, error: err.message };
    }
  }

  return { synced: false, fallback: 'localStorage' };
};

// 4. Sync Boss Quizzes (Supabase + LocalStorage Fallback)
export const syncBossQuizzesToSupabase = async (bossQuizzes) => {
  if (!Array.isArray(bossQuizzes) || bossQuizzes.length === 0) {
    return { synced: false, count: 0 };
  }

  // Always update LocalStorage first as robust local fallback
  const existingBq = getStoredItem(STORAGE_KEYS.CUSTOM_BOSS_QUIZZES, []);
  const mergedBq = [
    ...bossQuizzes,
    ...existingBq.filter((e) => !bossQuizzes.some((b) => b.id === e.id)),
  ];
  setStoredItem(STORAGE_KEYS.CUSTOM_BOSS_QUIZZES, mergedBq);

  // If Supabase is configured, upsert to remote database
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) return { synced: false, error: 'Client not ready' };

      const rows = bossQuizzes.map((bq) => ({
        id: bq.id,
        category: bq.category || 'TKA Comprehension',
        sentence: bq.sentence,
        question_text: bq.questionText,
        options: bq.options || [],
        explanation: bq.explanation || {},
      }));

      const { data, error } = await supabase
        .from('boss_quizzes')
        .upsert(rows, { onConflict: 'id' });

      if (error) {
        console.warn('Supabase boss_quizzes sync warning:', error.message);
        return { synced: false, error: error.message };
      }

      return { synced: true, data };
    } catch (err) {
      console.warn('Supabase sync network error, falling back to LocalStorage:', err);
      return { synced: false, error: err.message };
    }
  }

  return { synced: false, fallback: 'localStorage' };
};

// 5. Fetch Custom Questions with LocalStorage Fallback
export const fetchCustomFlashcards = async () => {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('flashcards')
          .select('*');

        if (!error && data && data.length > 0) {
          return data.map((row) => ({
            id: row.id,
            wordA: row.word_a,
            wordB: row.word_b,
            category: row.category,
            subtitle: row.subtitle,
            contextQuestion: row.context_question,
            correctChoice: row.correct_choice,
            quickTips: row.explanation?.quickTips || '',
            explanation: row.explanation,
          }));
        }
      }
    } catch (err) {
      console.warn('Failed fetching from Supabase, using local cache:', err);
    }
  }

  return getStoredItem(STORAGE_KEYS.CUSTOM_FLASHCARDS, []);
};

export const fetchCustomBossQuizzes = async () => {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('boss_quizzes')
          .select('*');

        if (!error && data && data.length > 0) {
          return data.map((row) => ({
            id: row.id,
            category: row.category,
            sentence: row.sentence,
            questionText: row.question_text,
            options: row.options,
            explanation: row.explanation,
          }));
        }
      }
    } catch (err) {
      console.warn('Failed fetching boss_quizzes from Supabase, using local cache:', err);
    }
  }

  return getStoredItem(STORAGE_KEYS.CUSTOM_BOSS_QUIZZES, []);
};

// 5b. Sync Speech Sentences (LocalStorage Append)
export const syncSpeechSentences = (speechSentences) => {
  if (!Array.isArray(speechSentences) || speechSentences.length === 0) {
    return { synced: false, count: 0 };
  }
  const existingSpeech = getStoredItem(STORAGE_KEYS.CUSTOM_SPEECH_SENTENCES, []);
  const merged = [
    ...speechSentences,
    ...existingSpeech.filter((e) => !speechSentences.some((s) => s.id === e.id)),
  ];
  setStoredItem(STORAGE_KEYS.CUSTOM_SPEECH_SENTENCES, merged);
  return { synced: true, count: merged.length };
};

// 6. Delete Questions by Specific Category (Supabase & LocalStorage)
export const deleteCategoryFromSupabase = async (category) => {
  if (!category) return { success: false, error: 'Category is required' };

  // 1. Remove from LocalStorage
  const localFc = getStoredItem(STORAGE_KEYS.CUSTOM_FLASHCARDS, []);
  const updatedFc = localFc.filter((c) => c.category !== category);
  setStoredItem(STORAGE_KEYS.CUSTOM_FLASHCARDS, updatedFc);

  const localBq = getStoredItem(STORAGE_KEYS.CUSTOM_BOSS_QUIZZES, []);
  const updatedBq = localBq.filter((q) => q.category !== category);
  setStoredItem(STORAGE_KEYS.CUSTOM_BOSS_QUIZZES, updatedBq);

  const localSpeech = getStoredItem(STORAGE_KEYS.CUSTOM_SPEECH_SENTENCES, []);
  const updatedSpeech = localSpeech.filter((s) => s.category !== category);
  setStoredItem(STORAGE_KEYS.CUSTOM_SPEECH_SENTENCES, updatedSpeech);

  // 2. Remove from Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await Promise.all([
          supabase.from('flashcards').delete().eq('category', category),
          supabase.from('boss_quizzes').delete().eq('category', category),
        ]);
      }
    } catch (err) {
      console.warn('Failed deleting category from Supabase:', err);
    }
  }

  return { success: true };
};

// 7. Reset All Custom Question Banks (Supabase & LocalStorage)
export const resetAllQuestionBanks = async () => {
  // 1. Clear LocalStorage custom questions
  setStoredItem(STORAGE_KEYS.CUSTOM_FLASHCARDS, []);
  setStoredItem(STORAGE_KEYS.CUSTOM_BOSS_QUIZZES, []);
  setStoredItem(STORAGE_KEYS.CUSTOM_SPEECH_SENTENCES, []);

  // 2. Clear Supabase tables
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await Promise.all([
          supabase.from('flashcards').delete().neq('id', '___non_existent___'),
          supabase.from('boss_quizzes').delete().neq('id', '___non_existent___'),
        ]);
      }
    } catch (err) {
      console.warn('Failed resetting Supabase tables:', err);
    }
  }

  return { success: true };
};

// 8. Fetch Summary of All Question Categories with Counts
export const fetchQuestionBankSummary = async () => {
  const [flashcards, bossQuizzes] = await Promise.all([
    fetchCustomFlashcards(),
    fetchCustomBossQuizzes(),
  ]);

  const speechSentences = getStoredItem(STORAGE_KEYS.CUSTOM_SPEECH_SENTENCES, []);
  const categoryMap = new Map();

  flashcards.forEach((fc) => {
    const cat = fc.category || 'Tanpa Kategori';
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, { category: cat, flashcardsCount: 0, bossQuizzesCount: 0, speechCount: 0, totalCount: 0 });
    }
    const item = categoryMap.get(cat);
    item.flashcardsCount += 1;
    item.totalCount += 1;
  });

  bossQuizzes.forEach((bq) => {
    const cat = bq.category || 'Tanpa Kategori';
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, { category: cat, flashcardsCount: 0, bossQuizzesCount: 0, speechCount: 0, totalCount: 0 });
    }
    const item = categoryMap.get(cat);
    item.bossQuizzesCount += 1;
    item.totalCount += 1;
  });

  speechSentences.forEach((s) => {
    const cat = s.category || 'Tanpa Kategori';
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, { category: cat, flashcardsCount: 0, bossQuizzesCount: 0, speechCount: 0, totalCount: 0 });
    }
    const item = categoryMap.get(cat);
    item.speechCount = (item.speechCount || 0) + 1;
    item.totalCount += 1;
  });

  return Array.from(categoryMap.values()).sort((a, b) => b.totalCount - a.totalCount);
};
