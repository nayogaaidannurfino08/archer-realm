// Web Speech API Native Utilities for Archer Realm Speech Lab

// 1. Text-To-Speech (Native SpeechSynthesis)
export const speakSentence = (text, onEnd) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.88; // Slightly measured pace for pedagogical clarity
  utterance.pitch = 1.0;

  // Prefer natural English voices if available
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(
    (v) => (v.lang.startsWith('en-US') || v.lang.startsWith('en-GB')) && !v.name.includes('Google')
  ) || voices.find((v) => v.lang.startsWith('en'));

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
};

// 2. Speech Recognition Check & Factory
export const isSpeechRecognitionSupported = () => {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
};

export const createSpeechRecognition = () => {
  if (!isSpeechRecognitionSupported()) return null;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.lang = 'en-US';
  recognition.continuous = true; // Pure manual control: stays listening until user stops it
  recognition.interimResults = true; // Real-time streaming results
  recognition.maxAlternatives = 1;

  return recognition;
};

// 3. String Sanitizer & Levenshtein Distance Functions
export const cleanTextToken = (str) =>
  str
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, '')
    .trim();

export const getLevenshteinDistance = (a, b) => {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : Math.min(
              dp[i - 1][j] + 1,      // deletion
              dp[i][j - 1] + 1,      // insertion
              dp[i - 1][j - 1] + 1   // substitution
            );
    }
  }
  return dp[m][n];
};

export const getWordSimilarity = (target, spoken) => {
  if (target === spoken) return 1.0;
  const maxLen = Math.max(target.length, spoken.length);
  if (maxLen === 0) return 1.0;
  return 1 - getLevenshteinDistance(target, spoken) / maxLen;
};

// 4. Optimal Sequence Alignment with Repetition Tolerance
export const alignTokens = (targetTokens, spokenTokens) => {
  const N = targetTokens.length;
  const M = spokenTokens.length;
  if (N === 0 || M === 0) return new Set();

  const dp = Array.from({ length: N + 1 }, () => new Array(M + 1).fill(0));
  for (let i = 1; i <= N; i++) dp[i][0] = -i * 0.5;

  for (let i = 1; i <= N; i++) {
    for (let j = 1; j <= M; j++) {
      const sim = getWordSimilarity(targetTokens[i - 1], spokenTokens[j - 1]);
      // Bonus if similarity >= 70%
      const matchScore = sim >= 0.70 ? sim * 2.0 : -0.5;
      dp[i][j] = Math.max(
        dp[i - 1][j - 1] + matchScore, // match
        dp[i - 1][j] - 0.5,            // skip target
        dp[i][j - 1] - 0.05            // skip spoken repetition/stumble
      );
    }
  }

  // Find best ending j
  let bestJ = M;
  let maxScore = dp[N][M];
  for (let j = 1; j <= M; j++) {
    if (dp[N][j] > maxScore) {
      maxScore = dp[N][j];
      bestJ = j;
    }
  }

  // Backtrack to find matched indices
  let i = N;
  let j = bestJ;
  const matchedTargetIndices = new Set();

  while (i > 0 && j > 0) {
    const sim = getWordSimilarity(targetTokens[i - 1], spokenTokens[j - 1]);
    const matchScore = sim >= 0.70 ? sim * 2.0 : -0.5;
    if (dp[i][j] === dp[i - 1][j - 1] + matchScore) {
      if (sim >= 0.70) matchedTargetIndices.add(i - 1);
      i--;
      j--;
    } else if (dp[i][j] === dp[i - 1][j] - 0.5) {
      i--;
    } else {
      j--;
    }
  }

  return matchedTargetIndices;
};

// 5. Pronunciation & Word Matching Scoring Engine
export const evaluatePronunciation = (targetSentence, spokenTranscript) => {
  if (!spokenTranscript || !targetSentence) {
    return {
      fluencyScore: 0,
      phonemeScore: 0,
      wordTokens: [],
      matchedCount: 0,
      totalCount: 0,
    };
  }

  // Clean and split tokens
  const spokenTokens = cleanTextToken(spokenTranscript).split(/\s+/).filter(Boolean);
  const targetRawTokens = targetSentence.split(/\s+/).filter(Boolean);
  const cleanedTargetTokens = targetRawTokens.map(cleanTextToken);

  // Dynamic Alignment with Repetition Tolerance
  const matchedIndices = alignTokens(cleanedTargetTokens, spokenTokens);

  // Fallback direct check for any single isolated missed words
  cleanedTargetTokens.forEach((targetWord, idx) => {
    if (!matchedIndices.has(idx)) {
      const existsInSpoken = spokenTokens.some(
        (spoken) => getWordSimilarity(targetWord, spoken) >= 0.70
      );
      if (existsInSpoken) {
        matchedIndices.add(idx);
      }
    }
  });

  const wordTokens = targetRawTokens.map((rawWord, idx) => ({
    rawWord,
    cleanWord: cleanedTargetTokens[idx],
    isCorrect: matchedIndices.has(idx),
  }));

  const matchedCount = matchedIndices.size;
  const totalCount = targetRawTokens.length;
  const matchRatio = totalCount > 0 ? matchedCount / totalCount : 0;

  // Fluency score (85-100% curve if mostly correct)
  const fluencyScore = Math.min(
    100,
    Math.max(15, Math.round(matchRatio * 92 + (matchRatio > 0.8 ? 8 : 0)))
  );

  // Phoneme / Clarity score
  const phonemeScore = Math.min(
    100,
    Math.max(20, Math.round(fluencyScore * 0.94 + (matchRatio > 0.8 ? 5 : -4)))
  );

  return {
    fluencyScore,
    phonemeScore,
    wordTokens,
    matchedCount,
    totalCount,
  };
};
