// 1. API Key Resolution (Strictly via Environment Variable)
export const getGeminiApiKey = () => {
  const envRaw = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_GEMINI_API_KEY : undefined;
  if (!envRaw) return '';
  const cleaned = String(envRaw).trim().replace(/^["']|["']$/g, '').trim();
  if (cleaned.length === 0 || cleaned.includes('your_gemini_api_key')) {
    return '';
  }
  return cleaned;
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
      const base64Data = dataUrl.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

// 3. System Prompt & Instruction (Standardized for TKA English & Archer Realm)
const GEMINI_SYSTEM_INSTRUCTION = `
You are an expert TKA English exam creator, linguist, and curriculum specialist for Archer Realm.
From the provided learning material, articles, reading texts, or grammar notes, extract and generate two high-impact learning datasets:

1. "flashcards" (Confusion Words / Vocabulary Mastery):
   - Pairs of easily confused English words (e.g. Affect vs Effect, Complement vs Compliment, Principle vs Principal, Beside vs Besides, Stationary vs Stationery, Illusion vs Allusion, Eminent vs Imminent, Advice vs Advise, Cite vs Site, Loose vs Lose).
   - Generate AT LEAST 20 to 25 unique flashcard duel items.
   - Fill-in-the-blank question using '_____'.
   - WordA corresponds to Choice A, WordB corresponds to Choice B.
   - correctChoice MUST be either "A" or "B".
   - Include friendly explanation in Indonesian (whyWrong, keyRule, example).

2. "boss_quizzes" or "bossQuizzes" (TKA Grammar Inversion & True/False Comprehension):
   - Generate AT LEAST 20 to 25 True/False grammar analysis questions (e.g. Subjunctive Mood, Negative Inversion, Inverted Conditionals, Subject-Verb Agreement, Parallelism).
   - Set questionText to "Read the sentence and choose True or False."
   - Two options: Label "A" is "True", Label "B" is "False". Exactly one has isCorrect: true.
   - Include explanation with errorFound, rule, and correctSentence.

CRITICAL: Return ONLY a valid JSON object without markdown formatting:
{
  "flashcards": [
    {
      "wordA": "Affect",
      "wordB": "Effect",
      "category": "Confusion Words",
      "subtitle": "Mempengaruhi (V) vs Dampak (N)",
      "contextQuestion": "Macroeconomic fluctuations will severely _____ consumption.",
      "correctChoice": "A",
      "quickTips": "Affect Verb, Effect Noun",
      "explanation": {
        "whyWrong": "Dibutuhkan kata kerja setelah will.",
        "keyRule": "Affect = kata kerja, Effect = kata benda.",
        "example": "The decision affected us deeply."
      }
    }
  ],
  "boss_quizzes": [
    {
      "category": "TKA Comprehension",
      "sentence": "Rarely have researchers discovered such remarkable biological adaptation.",
      "questionText": "Read the sentence and choose True or False.",
      "options": [
        { "label": "A", "text": "True", "isCorrect": true },
        { "label": "B", "text": "False", "isCorrect": false }
      ],
      "explanation": {
        "errorFound": "Tidak ada kesalahan. Kalimat gramatikal.",
        "rule": "Negative inversion (Rarely have researchers discovered) sudah tepat.",
        "correctSentence": "Rarely have researchers discovered such remarkable biological adaptation."
      }
    }
  ]
}
`;

// Helper: Dynamically discover active generative models authorized for this API key
async function getSupportedModelList(apiKey) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.models) && data.models.length > 0) {
        const generationModels = data.models
          .filter(
            (m) =>
              Array.isArray(m.supportedGenerationMethods) &&
              m.supportedGenerationMethods.includes('generateContent')
          )
          .map((m) => m.name.replace(/^models\//, ''));

        if (generationModels.length > 0) {
          // Sort so newest active flash models come first (3.8-flash, 3.6-flash, etc.)
          return generationModels.sort((a, b) => {
            const aPref = a.includes('3.8-flash') ? -4 : a.includes('3.6-flash') ? -3 : a.includes('3.5-flash') ? -2 : a.includes('flash') ? -1 : 1;
            const bPref = b.includes('3.8-flash') ? -4 : b.includes('3.6-flash') ? -3 : b.includes('3.5-flash') ? -2 : b.includes('flash') ? -1 : 1;
            return aPref - bPref;
          });
        }
      }
    }
  } catch (_) {
    // Dynamic discovery fallback
  }
  return [];
}

// 4. Live Gemini API Direct REST Fetch
export const parseMaterialWithGemini = async ({ textContent, file = null, moduleName = '' }) => {
  // 1. Validasi Env Key
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY belum terpasang di Vercel/Environment.');
  }

  // 2. Construct prompt parts
  const parts = [];
  const userModuleHint =
    moduleName && moduleName.trim().length > 0
      ? `\n\n=== MODULE / CHAPTER TAG: "${moduleName.trim()}" (Use this tag for the "category" field of all generated items) ===`
      : '';

  parts.push({
    text: `${GEMINI_SYSTEM_INSTRUCTION}${userModuleHint}\n\n=== USER PROVIDED MATERIAL TO PARSE ===\n${
      textContent || '(See attached document)'
    }`,
  });

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
      throw new Error(`Gagal membaca file ${file.name}. Pastikan file tidak rusak atau gunakan format PDF/TXT.`);
    }
  }

  // 3. Dynamic Discovery + Active Models Fallback List (Aligned with latest changelog)
  const discoveredModels = await getSupportedModelList(apiKey);
  const fallbackModels = [
    'gemini-3.8-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash-lite',
    'gemini-flash-latest',
    'gemini-4-argon',
    'gemini-2.5-flash',
    'gemini-1.5-flash',
  ];

  // Candidates list: dynamic discovered models first, followed by standard fallback list
  const modelCandidates = Array.from(new Set([...discoveredModels, ...fallbackModels]));

  const payload = {
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
  };

  let rawText = '';
  let succeededModel = '';
  const attemptedErrors = [];

  // 4. Direct REST Fetch with Multi-Model & Multi-API Version Fallback
  for (const modelCandidate of modelCandidates) {
    const cleanModel = modelCandidate.replace(/^models\//, '');

    // Try v1beta first; if 404, try v1
    for (const apiVersion of ['v1beta', 'v1']) {
      const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${cleanModel}:generateContent?key=${apiKey}`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          let errorMsg = `HTTP ${response.status} (${response.statusText})`;
          try {
            const errData = await response.json();
            if (errData?.error?.message) {
              errorMsg = errData.error.message;
            }
          } catch (_) {}

          attemptedErrors.push(`[${apiVersion}/${cleanModel}]: ${errorMsg}`);
          continue;
        }

        const data = await response.json();
        const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textOutput || textOutput.trim().length === 0) {
          attemptedErrors.push(`[${apiVersion}/${cleanModel}]: Empty response`);
          continue;
        }

        rawText = textOutput;
        succeededModel = `${apiVersion}/${cleanModel}`;
        console.info(`[Google AI Studio] Sukses generate soal menggunakan model: ${succeededModel}`);
        break; // Success! Break out of apiVersion loop
      } catch (netErr) {
        attemptedErrors.push(`[${apiVersion}/${cleanModel}]: ${netErr.message}`);
      }
    }

    if (rawText) {
      break; // Success! Break out of modelCandidates loop
    }
  }

  if (!rawText) {
    const errorSummary = attemptedErrors.slice(0, 3).join(' | ');
    throw new Error(
      `Gagal menghasilkan soal dari Google Gemini API. Rincian: ${errorSummary || 'Koneksi ke AI Studio terputus.'}`
    );
  }

  // 5. Defensive JSON Parsing
  let cleanedText = rawText.trim();
  if (cleanedText.startsWith('```json')) {
    cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  let parsed = null;
  try {
    parsed = JSON.parse(cleanedText);
  } catch (_) {
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch (_) {}
    }

    if (!parsed) {
      console.error('Failed to parse Gemini output:', cleanedText);
      throw new Error('Respon dari Google Gemini tidak berformat JSON valid. Silakan coba unggah materi kembali.');
    }
  }

  // 6. Comprehensive Normalization for both Schemas
  const rawFlashcards = Array.isArray(parsed.flashcards) ? parsed.flashcards : [];
  const rawBossQuizzes = Array.isArray(parsed.bossQuizzes)
    ? parsed.bossQuizzes
    : Array.isArray(parsed.boss_quizzes)
    ? parsed.boss_quizzes
    : [];

  if (rawFlashcards.length === 0 && rawBossQuizzes.length === 0) {
    throw new Error('Respon Gemini tidak memuat array flashcards atau boss_quizzes.');
  }

  const timestamp = Date.now();
  const categoryTag = moduleName && moduleName.trim().length > 0 ? moduleName.trim() : null;

  const formattedFlashcards = rawFlashcards.map((fc, index) => {
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const wordA = fc.wordA || fc.word || 'Word A';
    const wordB = fc.wordB || fc.pair || fc.word2 || 'Word B';
    const contextQuestion =
      fc.contextQuestion ||
      fc.sentence ||
      fc.question ||
      `The student must differentiate between ${wordA} and ${wordB}.`;

    let correctChoice = 'A';
    if (fc.correctChoice === 'A' || fc.correctChoice === 'B') {
      correctChoice = fc.correctChoice;
    } else if (fc.correct) {
      correctChoice = String(fc.correct).trim().toLowerCase() === wordB.toLowerCase() ? 'B' : 'A';
    }

    return {
      id: fc.id || `fc_${timestamp}_${randomSuffix}_${index + 1}`,
      wordA,
      wordB,
      category: categoryTag || fc.category || 'Confusion Words (AI)',
      subtitle: fc.subtitle || fc.meaning || 'Kata yang sering tertukar dalam ujian TKA',
      contextQuestion,
      correctChoice,
      quickTips: typeof fc.quickTips === 'string' ? fc.quickTips : fc.meaning || `${wordA} vs ${wordB}`,
      explanation:
        typeof fc.explanation === 'object' && fc.explanation !== null
          ? fc.explanation
          : {
              whyWrong: `Pilihan yang tepat dalam kalimat ini adalah ${correctChoice === 'A' ? wordA : wordB}.`,
              keyRule: `Perhatikan konteks gramatikal dan makna dari ${wordA} dan ${wordB}.`,
              example: `${wordA} dan ${wordB} memiliki fungsi gramatikal yang berbeda dalam kalimat.`,
            },
    };
  });

  const formattedBossQuizzes = rawBossQuizzes.map((bq, index) => {
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const sentence = bq.sentence || bq.text || '';
    const questionText = bq.questionText || bq.question_text || 'Read the sentence and choose True or False.';

    let options = [
      { label: 'A', text: 'True', isCorrect: true },
      { label: 'B', text: 'False', isCorrect: false },
    ];

    if (Array.isArray(bq.options) && bq.options.length > 0) {
      if (typeof bq.options[0] === 'object') {
        options = bq.options;
      } else {
        const correctAns = String(bq.correct_answer || bq.correct || 'A').toUpperCase();
        options = [
          { label: 'A', text: 'True', isCorrect: correctAns === 'A' || correctAns === 'TRUE' },
          { label: 'B', text: 'False', isCorrect: correctAns === 'B' || correctAns === 'FALSE' },
        ];
      }
    }

    return {
      id: bq.id || `bq_${timestamp}_${randomSuffix}_${index + 1}`,
      category: categoryTag || bq.category || 'TKA Comprehension (AI)',
      sentence,
      questionText,
      options,
      explanation:
        typeof bq.explanation === 'object' && bq.explanation !== null
          ? bq.explanation
          : {
              errorFound: bq.explanation || 'Analisis struktur gramatikal kalimat.',
              rule: 'Kaidah tata bahasa standar TKA Bahasa Inggris.',
              correctSentence: sentence,
            },
    };
  });

  return {
    flashcards: formattedFlashcards,
    bossQuizzes: formattedBossQuizzes,
    modelUsed: succeededModel,
  };
};

// Direct Text Generator wrapper alias
export async function generateQuestionsFromText(inputText, moduleName = '') {
  return await parseMaterialWithGemini({ textContent: inputText, moduleName });
}

// 5. Offline Demo / Realistic Mock Parser (Generates 20+ items each for complete offline testing)
export const parseMaterialWithMock = async ({ textContent, file = null, moduleName = '' }) => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const timestamp = Date.now();
  const categoryTag =
    moduleName && moduleName.trim().length > 0 ? moduleName.trim() : 'Bab 1: Subjunctive & Inversion';

  const mockPairs = [
    { a: 'Principal', b: 'Principle', q: 'The school _____ delivered an inspiring speech about maintaining integrity.', c: 'A', st: 'Kepala Sekolah vs Asas Fundamental' },
    { a: 'Affect', b: 'Effect', q: 'Macroeconomic fluctuations can significantly _____ household consumption expenditure.', c: 'A', st: 'Mempengaruhi (V) vs Dampak (N)' },
    { a: 'Stationary', b: 'Stationery', q: 'Due to the severe traffic collision, the commuter bus remained _____ for hours.', c: 'A', st: 'Diam Tak Bergerak vs Perlengkapan Tulis' },
    { a: 'Complement', b: 'Compliment', q: 'His theoretical knowledge served as an ideal _____ to her practical experience.', c: 'A', st: 'Melengkapi vs Pujian' },
    { a: 'Beside', b: 'Besides', q: '_____ English literature, she is also pursuing a degree in comparative linguistics.', c: 'B', st: 'Di samping/sebelah vs Selain itu' },
    { a: 'Illusion', b: 'Allusion', q: 'The poet made a subtle _____ to Shakespearean tragedies in the opening stanza.', c: 'B', st: 'Ilusi Penglihatan vs Rujukan/Sindiran Halus' },
    { a: 'Eminent', b: 'Imminent', q: 'The meteorologists warned that a catastrophic storm landfall was _____.', c: 'B', st: 'Terkemuka/Tersohor vs Segera Terjadi' },
    { a: 'Advice', b: 'Advise', q: 'The financial consultant offered invaluable _____ regarding risk management.', c: 'A', st: 'Nasihat (Kata Benda) vs Menasihati (Kata Kerja)' },
    { a: 'Cite', b: 'Site', q: 'Students must accurately _____ all academic journals consulted in their thesis.', c: 'A', st: 'Mengutip Sumber vs Lokasi/Tempat' },
    { a: 'Disinterested', b: 'Uninterested', q: 'The presiding judge remained entirely _____, weighing only empirical evidence.', c: 'A', st: 'Netral Tak Memihak vs Bosan/Tidak Tertarik' },
    { a: 'Farther', b: 'Further', q: 'Before proceeding _____, the committee required a comprehensive fiscal audit.', c: 'B', st: 'Jarak Fisik Nyata vs Tingkat Lanjutan/Abstrak' },
    { a: 'Loose', b: 'Lose', q: 'If the company fails to adapt to AI trends, it will _____ its competitive advantage.', c: 'B', st: 'Longgar/Lepas vs Kehilangan/Kalah' },
    { a: 'Precede', b: 'Proceed', q: 'A thorough literature review must _____ the formulation of research hypotheses.', c: 'A', st: 'Mendahului vs Melanjutkan' },
    { a: 'Discrete', b: 'Discreet', q: 'The clinical trial separated participants into three _____ experimental cohorts.', c: 'A', st: 'Terpisah/Berbeda vs Hati-hati/Bijaksana' },
    { a: 'Council', b: 'Counsel', q: 'The international legal _____ advised the diplomat on cross-border treaties.', c: 'B', st: 'Dewan/Majelis vs Nasihat Hukum/Konsultan' },
    { a: 'Assure', b: 'Ensure', q: 'Strict safety protocols are enforced to _____ zero operational workplace accidents.', c: 'B', st: 'Meyakinkan Seseorang vs Memastikan/Menjamin' },
    { a: 'Elicit', b: 'Illicit', q: 'The investigative journalist attempted to _____ the truth regarding illegal transactions.', c: 'A', st: 'Mendapatkan/Memancing vs Terlarang/Ilegal' },
    { a: 'Allude', b: 'Elude', q: 'Despite months of investigation, the elusive cybercriminal managed to _____ arrest.', c: 'B', st: 'Merujuk Secara Tak Langsung vs Meloloskan Diri' },
    { a: 'Coarse', b: 'Course', q: 'The university launched a rigorous _____ on advanced natural language processing.', c: 'B', st: 'Kasar/Rendah vs Mata Kuliah/Jalur' },
    { a: 'Historic', b: 'Historical', q: 'The signing of the peace accord was a _____ event that ended decades of strife.', c: 'A', st: 'Bersejarah/Sangat Penting vs Berkaitan dengan Sejarah' },
    { a: 'Ingenious', b: 'Ingenuous', q: 'The engineer proposed an _____ mechanical solution to reduce energy dissipation.', c: 'A', st: 'Sangat Cerdas/Kreatif vs Polos/Lugu' },
  ];

  const mockQuizzes = [
    { s: 'Rarely have researchers discovered such remarkable biological adaptation in extreme environments.', t: true, e: 'Negative Inversion (Rarely have researchers discovered) sudah 100% tepat.' },
    { s: 'The committee demanded that every participant submits their identification card upon arrival.', t: false, e: 'Mandative Subjunctive mewajibkan bare infinitive (submit), bukan submits.' },
    { s: 'Had the environmental regulators acted proactively, the catastrophe would have been mitigated.', t: true, e: 'Inverted third conditional (Had + Subject + V3) sudah tepat dan baku.' },
    { s: 'The expansion of renewable facilities, along with smart grid networks, require massive capital.', t: false, e: 'Subjek tunggal (The expansion) wajib menggunakan kata kerja singular (requires).' },
    { s: 'Scarcely had the keynote speaker commenced his lecture when the power outage occurred.', t: true, e: 'Pola Scarcely had + S + V3 ... when ... sudah sesuai kaidah inversi formal.' },
    { s: 'It is essential that every applicant is present thirty minutes prior to the commencement.', t: false, e: 'Klausa esensial subjunctive wajib menggunakan bare infinitive "be", bukan "is".' },
    { s: 'Neither the department head nor the research associates were informed of the budget cut.', t: true, e: 'Aturan Proximity: subjek terdekat (research associates) jamak, verba "were" sudah benar.' },
    { s: 'Under no circumstances employees are permitted to disclose confidential enterprise data.', t: false, e: 'Negative prepositional inversion: harus "are employees permitted", bukan "employees are".' },
    { s: 'The professor recommended that the postgraduate candidate revise the methodology chapter.', t: true, e: 'Subjunctive mood: kata kerja "revise" (bare infinitive) tepat setelah recommended that.' },
    { s: 'If the meteorological team would have issued earlier alerts, lives could have been saved.', t: false, e: 'Dalam conditional clause masa lampau, gunakan "had issued", bukan "would have issued".' },
    { s: 'Only after reviewing the audit findings did the board authorize the expansion plan.', t: true, e: 'Inversi dengan "Only after": auxiliary "did" mendahului subjek "the board" sudah tepat.' },
    { s: 'Each of the academic journals published by the university adhere to international indexing.', t: false, e: 'Subjek "Each of..." bernilai tunggal, sehingga kata kerja harus "adheres".' },
    { s: 'Were the international treaty ratified by all signatories, global tariffs would plummet.', t: true, e: 'Inverted second conditional: "Were the treaty ratified" (sepadan dengan If the treaty were ratified).' },
    { s: 'Not only the senior diplomats but also the prime minister were surprised by the treaty terms.', t: false, e: 'Not only... but also... concord berpatokan pada subjek kedua ("the prime minister" = singular -> was).' },
    { s: 'Seldom does an emerging technology disrupt existing industrial paradigms so rapidly.', t: true, e: 'Inversi dengan "Seldom": Auxiliary "does" mendahului subjek "an emerging technology".' },
    { s: 'The judge insisted that the witness gives testimony under sworn oath without hesitation.', t: false, e: 'Mandative subjunctive setelah "insisted that": harus "give" (bare infinitive), bukan "gives".' },
    { s: 'A high proportion of the agricultural yields was devastated by unprecedented flooding.', t: true, e: 'Proporsi terhadap uncountable/collective noun bernilai tunggal ("was devastated").' },
    { s: 'Little did the venture capitalists realized that the startup had falsified its user growth.', t: false, e: 'Setelah auxiliary "did" dalam inversi, kata kerja utama harus bare infinitive ("realize", bukan "realized").' },
    { s: 'Should you require supplementary documentation, please contact the registry office.', t: true, e: 'Inverted first conditional: "Should you require" sepadan dengan "If you require".' },
    { s: 'The criteria utilized by the admissions board remains rigorously confidential.', t: false, e: '"Criteria" adalah bentuk jamak dari "criterion", sehingga verba harus jamak ("remain", bukan "remains").' },
    { s: 'No sooner had the expedition team summited the peak than a fierce blizzard engulfed the ridge.', t: true, e: 'Pola inversi "No sooner had... than..." sudah tepat dan baku dalam TKA.' },
  ];

  return {
    flashcards: mockPairs.map((p, index) => ({
      id: `fc_${timestamp}_${Math.random().toString(36).substring(2, 7)}_${index + 1}`,
      wordA: p.a,
      wordB: p.b,
      category: categoryTag,
      subtitle: p.st,
      contextQuestion: p.q,
      correctChoice: p.c,
      quickTips: `Bedakan ${p.a} dan ${p.b} berdasarkan fungsi kalimat.`,
      explanation: {
        whyWrong: `Opsi salah tidak selaras dengan struktur kalimat dan kelas kata yang dibutuhkan.`,
        keyRule: `Perhatikan posisi kata dalam kalimat TKA.`,
        example: `Pahami konteks pemakaian kata ${p.a} dan ${p.b}.`,
      },
    })),
    bossQuizzes: mockQuizzes.map((q, index) => ({
      id: `bq_${timestamp}_${Math.random().toString(36).substring(2, 7)}_${index + 1}`,
      category: categoryTag,
      sentence: q.s,
      questionText: 'Read the sentence and choose True or False.',
      options: [
        { label: 'A', text: 'True', isCorrect: q.t },
        { label: 'B', text: 'False', isCorrect: !q.t },
      ],
      explanation: {
        errorFound: q.t ? 'Tidak ada kesalahan. Kalimat gramatikal.' : q.e,
        rule: q.e,
        correctSentence: q.s,
      },
    })),
  };
};
