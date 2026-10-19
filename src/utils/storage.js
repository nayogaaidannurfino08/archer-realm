// LocalStorage helper for Archer Realm progress persistence

const STORAGE_KEYS = {
  USER_DATA: 'archer_realm_user_data_v2',
  ACTIVE_CHARACTER: 'archer_realm_active_character',
  STATS: 'archer_realm_stats_v2',
  ACTIVE_TAB: 'archer_realm_active_tab',
  FLASHCARD_STATS: 'archer_realm_flashcard_stats_v2',
  MISTAKE_CARDS: 'archer_realm_mistake_cards_v2',
  CUSTOM_FLASHCARDS: 'archer_realm_custom_flashcards_v2',
  CUSTOM_BOSS_QUIZZES: 'archer_realm_custom_boss_quizzes_v2',
  CUSTOM_SPEECH_SENTENCES: 'archer_realm_custom_speech_sentences_v2',
  GEMINI_API_KEY: 'archer_realm_gemini_api_key',
};

export const getStoredItem = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.warn(`Failed reading ${key} from localStorage:`, error);
    return fallback;
  }
};

export const setStoredItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed writing ${key} to localStorage:`, error);
  }
};

export const clearAllProgress = () => {
  try {
    Object.values(STORAGE_KEYS).forEach((k) => {
      if (k !== STORAGE_KEYS.GEMINI_API_KEY) {
        localStorage.removeItem(k);
      }
    });
  } catch (e) {
    // Ignore
  }
};

export { STORAGE_KEYS };
