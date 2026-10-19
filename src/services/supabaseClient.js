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
