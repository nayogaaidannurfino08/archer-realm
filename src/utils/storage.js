// LocalStorage helper for Archer Realm progress persistence

const STORAGE_KEYS = {
  USER_DATA: 'archer_realm_user_data',
  ACTIVE_CHARACTER: 'archer_realm_active_character',
  STATS: 'archer_realm_stats',
  ACTIVE_TAB: 'archer_realm_active_tab',
  FLASHCARD_STATS: 'archer_realm_flashcard_stats',
  MISTAKE_CARDS: 'archer_realm_mistake_cards',
  CUSTOM_FLASHCARDS: 'archer_realm_custom_flashcards',
  CUSTOM_BOSS_QUIZZES: 'archer_realm_custom_boss_quizzes',
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

export { STORAGE_KEYS };
