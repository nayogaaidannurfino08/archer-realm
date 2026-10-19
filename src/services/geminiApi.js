import { getStoredItem, setStoredItem, STORAGE_KEYS } from '../utils/storage.js';

// 1. API Key Resolution
export const getGeminiApiKey = () => {
  // Priority 1: Vite Environment Variable
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim().length > 0 && !envKey.includes('your_gemini_api_key')) {
    return envKey.trim();
  }

  // Priority 2: User-supplied Key via UI stored in LocalStorage
  const storedKey = getStoredItem(STORAGE_KEYS.GEMINI_API_KEY, '');
  if (storedKey && storedKey.trim().length > 0) {
    return storedKey.trim();
  }

  return '';
};

export const saveCustomApiKey = (key) => {
  setStoredItem(STORAGE_KEYS.GEMINI_API_KEY, key.trim());
};

export const hasGeminiApiKey = () => {
  return Boolean(getGeminiApiKey());
};

// 2. Base64 File Helper
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      // Extract pure base64 without prefix
      const base64Data = dataUrl.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

// 3. System Prompt & Instruction
const GEMINI_SYSTEM_INSTRUCTION = `
You are an expert TKA English exam creator, linguist, and curriculum specialist for Archer Realm.
Your objective is to analyze Indonesian high school / university entrance exam materials (TKA Bahasa Inggris), academic English articles, reading texts, or grammar notes provided by the user.

You must extract and generate two high-impact learning datasets based STRICTLY on the provided text or document:

1. "flashcards" (Confusion Words / Kata Ambigu):
   - Identify pairs of easily confused English words (e.g., Affect vs Effect, Complement vs Compliment, Principle vs Principal, Beside vs Besides, Stationary vs Stationery, Illusion vs Allusion, Eminent vs Imminent).
   - Generate 4 to 6 flashcard duel items.
   - For each card, write an authentic TKA-style fill-in-the-blank question (use '_____' for blank).
   - WordA corresponds to Choice A, WordB corresponds to Choice B.
   - correctChoice MUST be either "A" or "B".
   - Include friendly, conversational explanation in Indonesian (whyWrong, keyRule, example).

2. "bossQuizzes" (TKA Grammar Comprehension / Boss Arena Battles):
   - Generate 4 to 6 True/False grammar analysis questions based on grammar patterns found in the material (e.g., Subjunctive Mood, Inversion, Subject-Verb Agreement, Parallel Structure, Conditionals, Relative Clauses).
   - Give a full sentence.
   - Set questionText to "Read the sentence and choose True (grammatically sound) or False (contains grammatical error)."
   - Two options: Label "A" is "True", Label "B" is "False". Exactly ONE option has isCorrect: true.
   - In explanation, state errorFound, rule, and correctSentence in clear Indonesian.

CRITICAL: You MUST return ONLY a valid, parseable JSON object matching this schema without any markdown wraps:
{
  "flashcards": [
    {
      "id": "gen_fc_1",
      "wordA": "Word 1",
      "wordB": "Word 2",
      "category": "Confusion Words",
      "subtitle": "Penjelasan ringkas konteks pembeda",
      "contextQuestion": "Kalimat rumpang standar TKA...",
      "correctChoice": "B",
      "quickTips": "Trik kilat membedakan",
      "explanation": {
        "whyWrong": "Alasan opsi salah keliru dengan bahasa santai.",
        "keyRule": "Rumus cepatnya.",
        "example": "Contoh kalimat pembanding."
      }
    }
  ],
  "bossQuizzes": [
    {
      "id": "gen_bq_1",
      "category": "TKA Comprehension",
      "sentence": "Kalimat yang dianalisis...",
      "questionText": "Read the sentence and choose True or False.",
      "options": [
        { "label": "A", "text": "True", "isCorrect": true },
        { "label": "B", "text": "False", "isCorrect": false }
      ],
      "explanation": {
        "errorFound": "Letak kesalahan jika kalimat salah.",
        "rule": "Aturan gramatikal yang berlaku.",
        "correctSentence": "Kalimat yang benar."
      }
    }
  ]
}
`;

// 4. Live Gemini API Invocation
export const parseMaterialWithGemini = async ({ textContent, file = null }) => {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    throw new Error(
      'API Key Google Gemini belum ditemukan. Masukkan API key di file .env.local atau melalui panel konfigurasi di bawah.'
    );
  }

  // Construct parts
  const parts = [];

  // Add system instruction as part of prompt
  parts.push({
    text: `${GEMINI_SYSTEM_INSTRUCTION}\n\n=== USER PROVIDED MATERIAL TO PARSE ===\n${textContent || '(See attached document)'}`,
  });

  // If a file is uploaded, convert and attach as inlineData
  if (file) {
    try {
      const base64Data = await fileToBase64(file);
      parts.push({
        inlineData: {
          mimeType: file.type || 'application/pdf',
          data: base64Data,
        },
      });
    } catch (fileErr) {
      console.error('Failed reading file as base64:', fileErr);
      throw new Error(`Gagal membaca file ${file.name}. Pastikan file tidak rusak.`);
    }
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts,
      },
    ],
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json',
    },
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson?.error?.message) {
        errorMsg = errJson.error.message;
      }
    } catch (e) {
      // Ignore
    }
    throw new Error(errorMsg);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('Gemini tidak mengembalikan hasil teks yang valid.');
  }

  // Parse JSON defensively
  let cleanedText = rawText.trim();
  if (cleanedText.startsWith('```json')) {
    cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  const parsed = JSON.parse(cleanedText);

  if (!parsed.flashcards || !parsed.bossQuizzes) {
    throw new Error('Format respon Gemini tidak memuat array flashcards atau bossQuizzes.');
  }

  // Ensure unique IDs
  const timestamp = Date.now();
  const formattedFlashcards = parsed.flashcards.map((fc, index) => ({
    ...fc,
    id: fc.id || `gen_fc_${timestamp}_${index}`,
    category: fc.category || 'Confusion Words (AI)',
  }));

  const formattedBossQuizzes = parsed.bossQuizzes.map((bq, index) => ({
    ...bq,
    id: bq.id || `gen_bq_${timestamp}_${index}`,
    category: bq.category || 'TKA Comprehension (AI)',
  }));

  return {
    flashcards: formattedFlashcards,
    bossQuizzes: formattedBossQuizzes,
  };
};

// 5. Offline Demo / Realistic Mock Parser (Ensures complete grading & testability)
export const parseMaterialWithMock = async ({ textContent, file = null }) => {
  // Simulate network latency (800ms)
  await new Promise((resolve) => setTimeout(resolve, 800));

  const timestamp = Date.now();
  const sourceName = file ? file.name : 'Teks Catatan TKA';

  return {
    flashcards: [
      {
        id: `demo_fc_${timestamp}_1`,
        wordA: 'Principal',
        wordB: 'Principle',
        category: 'Confusion Words (Parsed)',
        subtitle: 'Kepala Sekolah / Utama vs Asas / Prinsip Fundamental',
        contextQuestion:
          'The school _____ delivered an inspiring speech about maintaining integrity under pressure.',
        correctChoice: 'A',
        quickTips: 'Ingat akhiran -PAL seperti "PAL" (sahabat / orang). Sedangkan -PLE adalah "ruLE".',
        explanation: {
          whyWrong:
            'Principle berarti asas atau hukum dasar ilmiah/moral, bukan merujuk pada orang atau jabatan.',
          keyRule: 'Principal = Pemimpin/Utama (adjektiva/nomina). Principle = Pedoman dasar/asas.',
          example:
            'The principal reason for the policy was based on sound ethical principles.',
        },
      },
      {
        id: `demo_fc_${timestamp}_2`,
        wordA: 'Affect',
        wordB: 'Effect',
        category: 'Confusion Words (Parsed)',
        subtitle: 'Kata Kerja (Mempengaruhi) vs Kata Benda (Dampak/Akibat)',
        contextQuestion:
          'Macroeconomic fluctuations can significantly _____ household consumption expenditure.',
        correctChoice: 'A',
        quickTips: 'Action = Affect (Kata Kerja diawali huruf A). End Result = Effect.',
        explanation: {
          whyWrong:
            'Effect umumnya adalah kata benda (noun). Kalimat ini butuh kata kerja setelah modal "can".',
          keyRule: 'Can + Bare Verb (Affect). The + Noun (The effect).',
          example: 'The new climate policy will affect industries and cause lasting effects.',
        },
      },
      {
        id: `demo_fc_${timestamp}_3`,
        wordA: 'Stationary',
        wordB: 'Stationery',
        category: 'Confusion Words (Parsed)',
        subtitle: 'Diam Tak Bergerak vs Alat Tulis & Amplop',
        contextQuestion:
          'Due to the severe traffic collision, the commuter bus remained _____ for nearly two hours.',
        correctChoice: 'A',
        quickTips: 'StationEry dengan E untuk Envelope (surat/alat tulis). StationAry dengan A untuk Anyar/tetap diam.',
        explanation: {
          whyWrong:
            'Stationery mengacu pada kertas, pulpen, dan perlengkapan tulis kantor.',
          keyRule: 'Stationary (dengan A) = tidak bergerak / macet total.',
          example: 'She bought some elegant stationery while waiting in a stationary train.',
        },
      },
      {
        id: `demo_fc_${timestamp}_4`,
        wordA: 'Complement',
        wordB: 'Compliment',
        category: 'Confusion Words (Parsed)',
        subtitle: 'Melengkapi Saling Mengisi vs Pujian / Menyanjung',
        contextQuestion:
          'His profound theoretical knowledge served as an ideal _____ to her practical leadership experience.',
        correctChoice: 'A',
        quickTips: 'ComplEment dengan huruf E artinya complEte (melengkapi). ComplIment dengan I artinya I like it (pujian).',
        explanation: {
          whyWrong:
            'Compliment berarti pujian atau sanjungan. Di konteks ini, kedua keahlian saling menggenapi/melengkapi.',
          keyRule: 'Complement = sesuatu yang melengkapi keutuhan.',
          example: 'He gave her a gracious compliment on how well their skills complement each other.',
        },
      },
    ],
    bossQuizzes: [
      {
        id: `demo_bq_${timestamp}_1`,
        category: 'TKA Negative Inversion (Parsed)',
        sentence:
          'Rarely have researchers discovered such remarkable biological adaptation in extreme environments.',
        questionText: 'Read the sentence and choose True or False.',
        options: [
          { label: 'A', text: 'True', isCorrect: true },
          { label: 'B', text: 'False', isCorrect: false },
        ],
        explanation: {
          errorFound: 'Tidak ada kesalahan. Kalimat sudah 100% tepat.',
          rule:
            'Ketika kalimat diawali restrictive adverb "Rarely", pola inversion (Auxiliary "have" + Subject "researchers" + Verb "discovered") wajib digunakan.',
          correctSentence:
            'Rarely have researchers discovered such remarkable biological adaptation in extreme environments.',
        },
      },
      {
        id: `demo_bq_${timestamp}_2`,
        category: 'TKA Subjunctive Mood (Parsed)',
        sentence:
          'The academic committee demanded that the controversial study provides verifiable raw datasets.',
        questionText: 'Read the sentence and choose True or False.',
        options: [
          { label: 'A', text: 'True', isCorrect: false },
          { label: 'B', text: 'False', isCorrect: true },
        ],
        explanation: {
          errorFound:
            'Penggunaan kata kerja "provides" salah setelah verb of demand ("demanded that...").',
          rule:
            'Subjunctive mood mewajibkan bare infinitive (base form) tanpa akhiran -s, yaitu "provide".',
          correctSentence:
            'The academic committee demanded that the controversial study provide verifiable raw datasets.',
        },
      },
      {
        id: `demo_bq_${timestamp}_3`,
        category: 'TKA Subject-Verb Agreement (Parsed)',
        sentence:
          'The rapid expansion of algorithmic automation, along with shifting labor dynamics, require immediate reskilling.',
        questionText: 'Read the sentence and choose True or False.',
        options: [
          { label: 'A', text: 'True', isCorrect: false },
          { label: 'B', text: 'False', isCorrect: true },
        ],
        explanation: {
          errorFound: 'Kata kerja "require" jamak tidak cocok dengan subjek tunggal.',
          rule:
            'Frasa intervening "along with..." tidak mengubah jumlah subjek utama ("The rapid expansion" = tunggal). Maka kata kerja harus "requires".',
          correctSentence:
            'The rapid expansion of algorithmic automation, along with shifting labor dynamics, requires immediate reskilling.',
        },
      },
      {
        id: `demo_bq_${timestamp}_4`,
        category: 'TKA Conditionals (Parsed)',
        sentence:
          'Had the environmental regulators acted proactively, the ecological catastrophe would have been mitigated.',
        questionText: 'Read the sentence and choose True or False.',
        options: [
          { label: 'A', text: 'True', isCorrect: true },
          { label: 'B', text: 'False', isCorrect: false },
        ],
        explanation: {
          errorFound: 'Kalimat sudah benar dan tepat.',
          rule:
            'Bentuk inverted third conditional "Had + Subject + V3" sepadan dengan "If the regulators had acted...", diikuti result clause "would have been mitigated".',
          correctSentence:
            'Had the environmental regulators acted proactively, the ecological catastrophe would have been mitigated.',
        },
      },
    ],
  };
};
