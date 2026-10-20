// Web Speech API Native Utilities for Archer Realm Speech Lab

let currentAudioElement = null;

export const stopSpeaking = () => {
  if (typeof window !== 'undefined') {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
    if (currentAudioElement) {
      try {
        currentAudioElement.pause();
        currentAudioElement.currentTime = 0;
      } catch (_) {}
      currentAudioElement = null;
    }
  }
};

// 1. Text-To-Speech with Mobile Android/iOS Fallback
export const speakSentence = (text, onEnd, lang = 'en-US') => {
  if (typeof window === 'undefined') {
    if (onEnd) onEnd();
    return;
  }

  stopSpeaking();

  const cleanText = (text || '').trim();
  if (!cleanText) {
    if (onEnd) onEnd();
    return;
  }

  let hasEnded = false;
  const safeEnd = () => {
    if (!hasEnded) {
      hasEnded = true;
      if (onEnd) onEnd();
    }
  };

  // Helper for High-Fidelity Online Audio Fallback (Guaranteed to work on HP / Mobile browsers)
  const playAudioFallback = () => {
    try {
      const tl = lang.startsWith('en-GB') ? 'en-gb' : lang.startsWith('id') ? 'id' : 'en-us';
      // Truncate query to 200 chars max for Google TTS standard
      const ttsQuery = encodeURIComponent(cleanText.slice(0, 200));
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${tl}&q=${ttsQuery}`;

      const audio = new Audio(audioUrl);
      currentAudioElement = audio;

      audio.onended = () => {
        currentAudioElement = null;
        safeEnd();
      };
      audio.onerror = (e) => {
        console.warn('Audio fallback error:', e);
        currentAudioElement = null;
        safeEnd();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio play was prevented or failed:', err);
          safeEnd();
        });
      }
    } catch (e) {
      console.warn('Fallback audio failed:', e);
      safeEnd();
    }
  };

  // 1. Check if native Web SpeechSynthesis is supported and active
  if ('speechSynthesis' in window) {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = lang;
      utterance.rate = 0.9;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices() || [];
      if (voices.length > 0) {
        const langPrefix = lang.split('-')[0].toLowerCase();
        // Priority: exact match, prefix match, or any English voice (including Google voices on Android)
        const voiceMatch =
          voices.find((v) => v.lang && v.lang.toLowerCase() === lang.toLowerCase()) ||
          voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(langPrefix)) ||
          voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('en'));
        if (voiceMatch) {
          utterance.voice = voiceMatch;
        }
      }

      let speechStarted = false;

      utterance.onstart = () => {
        speechStarted = true;
      };

      utterance.onend = () => {
        safeEnd();
      };

      utterance.onerror = (err) => {
        console.warn('SpeechSynthesis error on mobile, switching to audio fallback:', err);
        playAudioFallback();
      };

      // Slight timeout before speaking to allow Android Chrome event loop to clear previous cancel()
      setTimeout(() => {
        try {
          window.speechSynthesis.speak(utterance);
        } catch (_) {
          playAudioFallback();
        }
      }, 50);

      // Fallback timer: if onstart hasn't fired within 1.2s on mobile, speechSynthesis is likely muted/stalled
      setTimeout(() => {
        if (!speechStarted && !hasEnded) {
          console.info('SpeechSynthesis did not start in time on mobile, using audio fallback');
          window.speechSynthesis.cancel();
          playAudioFallback();
        }
      }, 1200);

      return;
    } catch (err) {
      console.warn('SpeechSynthesis invocation exception:', err);
      playAudioFallback();
      return;
    }
  }

  // If SpeechSynthesis not available in browser
  playAudioFallback();
};

// Helper to derive speech sentences from uploaded flashcards and boss quizzes
export const deriveSpeechSentences = (flashcards = [], bossQuizzes = [], defaultCategory = '') => {
  const speechItems = [];
  const timestamp = Date.now();

  // 1. Convert Flashcards to Speech Sentences
  (flashcards || []).forEach((fc, idx) => {
    const correctWord = fc.correctChoice === 'B' ? fc.wordB : fc.wordA;
    let sentence = (fc.contextQuestion || '').replace(/_{2,}/g, correctWord).trim();
    if (!sentence || sentence.length < 5) {
      sentence = `We must clearly differentiate between ${fc.wordA} and ${fc.wordB}.`;
    }
    const cat = fc.category || defaultCategory || 'Confusion Words';

    speechItems.push({
      id: `speech_fc_${timestamp}_${idx + 1}`,
      sentence,
      category: cat,
      difficulty: 'Intermediate',
      focusWords: [fc.wordA, fc.wordB].filter(Boolean),
      phoneticTips: `Latih pelafalan kontras antara kata "${fc.wordA}" dan "${fc.wordB}".`,
    });
  });

  // 2. Convert Boss Quizzes to Speech Sentences
  (bossQuizzes || []).forEach((bq, idx) => {
    const sentence = (bq.sentence || '').trim();
    if (sentence && sentence.length >= 8) {
      const cat = bq.category || defaultCategory || 'TKA Inversion';
      const words = sentence.split(/\s+/).map((w) => w.replace(/[^a-zA-Z]/g, '')).filter((w) => w.length > 5);

      speechItems.push({
        id: `speech_bq_${timestamp}_${idx + 1}`,
        sentence,
        category: cat,
        difficulty: 'Advanced',
        focusWords: words.slice(0, 3),
        phoneticTips: 'Perhatikan penekanan kata (stress) dan intonasi kalimat formal ini.',
      });
    }
  });

  return speechItems;
};

// 2. Speech Recognition Check & Factory
export const isSpeechRecognitionSupported = () => {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
};

export const createSpeechRecognition = (lang = 'en-US') => {
  if (!isSpeechRecognitionSupported()) return null;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.lang = lang;
  recognition.continuous = true; // Pure manual control: stays listening until user stops it
  recognition.interimResults = true; // Real-time streaming results
  recognition.maxAlternatives = 1;

  return recognition;
};

// 3. String Sanitizer & Deduplication Utilities
export const cleanTextToken = (str) =>
  (str || '')
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, '')
    .trim();

// Removes immediate consecutive duplicate tokens (e.g. "my my" -> "my")
export const cleanConsecutiveDuplicates = (str) => {
  if (!str) return '';
  const words = str.trim().split(/\s+/);
  const deduplicated = [];
  for (let i = 0; i < words.length; i++) {
    if (i > 0 && words[i].toLowerCase() === words[i - 1].toLowerCase()) {
      continue;
    }
    deduplicated.push(words[i]);
  }
  return deduplicated.join(' ');
};

// Merges a new speech segment into existing text without duplicating cumulative words
export const mergeTranscriptSegment = (base, addition) => {
  const b = (base || '').trim();
  const a = (addition || '').trim();
  if (!b) return a;
  if (!a) return b;

  const lowerB = b.toLowerCase();
  const lowerA = a.toLowerCase();

  // 1. Identical text or addition is already contained at the end of base
  if (lowerB === lowerA || lowerB.endsWith(lowerA)) {
    return b;
  }

  // 2. Addition is a cumulative superset of base (common on Android mobile)
  // e.g. base = "my name", addition = "my name is nayoga"
  if (lowerA.startsWith(lowerB)) {
    return a;
  }

  // 3. Base is already a superset of addition (lagged echo)
  if (lowerB.startsWith(lowerA)) {
    return b;
  }

  // 4. Word-level overlap matching between suffix of base and prefix of addition
  const bWords = b.split(/\s+/);
  const aWords = a.split(/\s+/);
  let maxOverlap = 0;

  for (let len = Math.min(bWords.length, aWords.length); len > 0; len--) {
    const bSlice = bWords.slice(-len).join(' ').toLowerCase();
    const aSlice = aWords.slice(0, len).join(' ').toLowerCase();
    if (bSlice === aSlice) {
      maxOverlap = len;
      break;
    }
  }

  if (maxOverlap > 0) {
    const nonOverlapping = aWords.slice(maxOverlap).join(' ');
    return nonOverlapping ? `${b} ${nonOverlapping}` : b;
  }

  // 5. Distinct disjoint segment (typical desktop chunk)
  return `${b} ${a}`;
};

// Robust parser for Web Speech API event.results (handles Mobile Android cumulative stream & Desktop deltas)
export const extractCleanTranscript = (results) => {
  if (!results || results.length === 0) return '';

  let mergedFinal = '';
  let mergedInterim = '';

  for (let i = 0; i < results.length; i++) {
    const res = results[i];
    const text = (res[0]?.transcript || '').trim();
    if (!text) continue;

    if (res.isFinal) {
      mergedFinal = mergeTranscriptSegment(mergedFinal, text);
    } else {
      mergedInterim = mergeTranscriptSegment(mergedInterim, text);
    }
  }

  let fullTranscript = '';
  if (!mergedFinal) {
    fullTranscript = mergedInterim;
  } else if (!mergedInterim) {
    fullTranscript = mergedFinal;
  } else {
    fullTranscript = mergeTranscriptSegment(mergedFinal, mergedInterim);
  }

  return cleanConsecutiveDuplicates(fullTranscript);
};

// 4. Common English Homophones Map (Sound-alike words that share pronunciation)
const HOMOPHONES = {
  their: 'there',
  theyre: 'there',
  there: 'there',
  to: 'to',
  too: 'to',
  two: 'to',
  here: 'here',
  hear: 'here',
  see: 'see',
  sea: 'see',
  buy: 'by',
  bye: 'by',
  by: 'by',
  right: 'right',
  write: 'right',
  weather: 'weather',
  whether: 'weather',
  no: 'no',
  know: 'no',
  new: 'new',
  knew: 'new',
  meat: 'meat',
  meet: 'meat',
  peace: 'peace',
  piece: 'peace',
  break: 'break',
  brake: 'break',
  hour: 'our',
  our: 'our',
  wood: 'would',
  would: 'would',
  for: 'for',
  four: 'for',
  ate: 'eight',
  eight: 'eight',
  plain: 'plain',
  plane: 'plain',
  week: 'week',
  weak: 'week',
  whole: 'whole',
  hole: 'whole',
  role: 'role',
  roll: 'role',
  affect: 'effect',
  effect: 'effect',
  accept: 'except',
  except: 'except',
  wait: 'wait',
  weight: 'wait',
  son: 'sun',
  sun: 'sun',
  principal: 'principle',
  principle: 'principle',
  fair: 'fare',
  fare: 'fare',
  heal: 'heel',
  heel: 'heel',
  idle: 'idol',
  idol: 'idol',
  lead: 'led',
  led: 'led',
  lesson: 'lessen',
  lessen: 'lessen',
  loose: 'lose',
  lose: 'lose',
  passed: 'past',
  past: 'past',
  scene: 'seen',
  seen: 'seen',
  sight: 'site',
  site: 'site',
  cite: 'site',
  stair: 'stare',
  stare: 'stare',
  tail: 'tale',
  tale: 'tale',
  waist: 'waste',
  waste: 'waste',
  which: 'witch',
  witch: 'witch',
};

// Normalize phonetic approximations (simplifies silent/consonant ambiguities)
export const normalizePhonetic = (word) => {
  if (!word) return '';
  let w = word.toLowerCase();
  if (HOMOPHONES[w]) return HOMOPHONES[w];
  w = w
    .replace(/ph/g, 'f')
    .replace(/gh$/g, 'f')
    .replace(/^kn/g, 'n')
    .replace(/^wr/g, 'r')
    .replace(/^ps/g, 's')
    .replace(/ck/g, 'k')
    .replace(/([a-z])\1+/g, '$1'); // collapse double consonants (e.g. tt -> t, ll -> l)
  return w;
};

// 5. String Distance & Similarity Scoring Engine
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
  if (!target || !spoken) return 0.0;

  // 1. Direct Homophone Match (e.g. "their" vs "there", "to" vs "too")
  if (HOMOPHONES[target] && HOMOPHONES[target] === HOMOPHONES[spoken]) {
    return 1.0;
  }

  // 2. Direct Levenshtein character similarity
  const maxLen = Math.max(target.length, spoken.length);
  const directSim = maxLen > 0 ? 1 - getLevenshteinDistance(target, spoken) / maxLen : 1.0;
  if (directSim >= 0.70) return directSim;

  // 3. Normalized phonetic similarity
  const normTarget = normalizePhonetic(target);
  const normSpoken = normalizePhonetic(spoken);
  if (normTarget === normSpoken) return 0.95;

  const normMaxLen = Math.max(normTarget.length, normSpoken.length);
  if (normMaxLen > 0) {
    const normSim = 1 - getLevenshteinDistance(normTarget, normSpoken) / normMaxLen;
    return Math.max(directSim, normSim);
  }

  return directSim;
};

// 6. Optimal Sequence Alignment with Repetition Tolerance
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

// 7. Pronunciation & Word Matching Scoring Engine (With Multi-Word Compound Recognition)
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
  const matchedSpokenIndices = new Set();

  // Pass 1: Direct single token-to-token check
  cleanedTargetTokens.forEach((targetWord, idx) => {
    if (!matchedIndices.has(idx)) {
      for (let sIdx = 0; sIdx < spokenTokens.length; sIdx++) {
        if (matchedSpokenIndices.has(sIdx)) continue;
        const sim = getWordSimilarity(targetWord, spokenTokens[sIdx]);
        if (sim >= 0.70) {
          matchedIndices.add(idx);
          matchedSpokenIndices.add(sIdx);
          break;
        }
      }
    }
  });

  // Pass 2: Multi-word sliding window (e.g. Speech engine split "nayoga" into "no" + "yoga")
  cleanedTargetTokens.forEach((targetWord, idx) => {
    if (!matchedIndices.has(idx)) {
      for (let sIdx = 0; sIdx < spokenTokens.length - 1; sIdx++) {
        if (matchedSpokenIndices.has(sIdx) && matchedSpokenIndices.has(sIdx + 1)) continue;
        const joinedPair = spokenTokens[sIdx] + spokenTokens[sIdx + 1];
        const sim = getWordSimilarity(targetWord, joinedPair);
        if (sim >= 0.70) {
          matchedIndices.add(idx);
          matchedSpokenIndices.add(sIdx);
          matchedSpokenIndices.add(sIdx + 1);
          break;
        }
      }
    }
  });

  // Pass 3: Multi-word target matching single spoken token (e.g. target "ice" "cream" vs spoken "icecream")
  for (let tIdx = 0; tIdx < cleanedTargetTokens.length - 1; tIdx++) {
    if (!matchedIndices.has(tIdx) || !matchedIndices.has(tIdx + 1)) {
      const joinedTarget = cleanedTargetTokens[tIdx] + cleanedTargetTokens[tIdx + 1];
      for (let sIdx = 0; sIdx < spokenTokens.length; sIdx++) {
        const sim = getWordSimilarity(joinedTarget, spokenTokens[sIdx]);
        if (sim >= 0.70) {
          matchedIndices.add(tIdx);
          matchedIndices.add(tIdx + 1);
          matchedSpokenIndices.add(sIdx);
          break;
        }
      }
    }
  }

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
