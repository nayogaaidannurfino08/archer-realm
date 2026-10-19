/**
 * Fisher-Yates (Knuth) Shuffle Algorithm
 * Shuffles an array in O(n) time and O(n) space without mutating the original array.
 */
export const shuffleArray = (array) => {
  if (!Array.isArray(array)) return [];
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
