// Mock Dataset for Archer Realm - Boss Arena (TKA Grammar & Reading Comprehension)
// Standardized for TKA English True / False Mastery Analysis

export const mockBossQuizzes = [
  {
    id: "boss-q1",
    category: "TKA Grammar Comprehension",
    sentence: "The book, which was written by a famous author, become a bestseller.",
    questionText: "Read the sentence and choose True or False.",
    options: [
      { label: "A", text: "True", isCorrect: false },
      { label: "B", text: "False", isCorrect: true },
    ],
    explanation: {
      errorFound: "Kata kerja 'become' seharusnya 'became' karena menceritakan peristiwa masa lampau ('was written'), atau 'becomes' jika present tense dengan subjek tunggal 'The book'.",
      rule: "Intervening relative clause ('which was written...') tidak boleh mengaburkan keselarasan antara subjek utama dan kata kerja predikatnya.",
      correctSentence: "The book, which was written by a famous author, became a bestseller.",
    },
  },
  {
    id: "boss-q2",
    category: "TKA Grammar Comprehension",
    sentence: "The committee recommended that every participant submits their identification card before entering the hall.",
    questionText: "Read the sentence and choose True or False.",
    options: [
      { label: "A", text: "True", isCorrect: false },
      { label: "B", text: "False", isCorrect: true },
    ],
    explanation: {
      errorFound: "Kata 'submits' keliru; seharusnya menggunakan bare infinitive 'submit'.",
      rule: "Mandative Subjunctive: Setelah verba yang menyatakan usulan atau instruksi (recommend, insist, demand that), klausa terikat wajib memakai bare infinitive (V1 murni tanpa -s/-es).",
      correctSentence: "The committee recommended that every participant submit their identification card before entering the hall.",
    },
  },
  {
    id: "boss-q3",
    category: "TKA Grammar Comprehension",
    sentence: "Rarely we have witnessed such extraordinary resilience in the face of unprecedented natural disasters.",
    questionText: "Read the sentence and choose True or False.",
    options: [
      { label: "A", text: "True", isCorrect: false },
      { label: "B", text: "False", isCorrect: true },
    ],
    explanation: {
      errorFound: "Susunan kata 'we have witnessed' salah; harus mengalami inversi menjadi 'have we witnessed'.",
      rule: "Negative Inversion: Apabila kalimat diawali adverbia bernuansa negatif atau pembatasan (Rarely, Seldom, Scarcely, Never), posisi auxiliary verb wajib mendahului subjek.",
      correctSentence: "Rarely have we witnessed such extraordinary resilience in the face of unprecedented natural disasters.",
    },
  },
  {
    id: "boss-q4",
    category: "TKA Grammar Comprehension",
    sentence: "If she had arrived at the train station earlier, she would not miss the express departure to Kyoto.",
    questionText: "Read the sentence and choose True or False.",
    options: [
      { label: "A", text: "True", isCorrect: false },
      { label: "B", text: "False", isCorrect: true },
    ],
    explanation: {
      errorFound: "Klausa hasil 'would not miss' salah waktu; seharusnya 'would not have missed'.",
      rule: "Third Conditional (situasi pengandaian lampau): Polanya adalah 'If + Past Perfect (had arrived), Subject + would have + V3 (would not have missed)'.",
      correctSentence: "If she had arrived at the train station earlier, she would not have missed the express departure to Kyoto.",
    },
  },
  {
    id: "boss-q5",
    category: "TKA Grammar Comprehension",
    sentence: "The modern scholarship program aims to foster critical thinking, developing leadership skills, and inspire community service.",
    questionText: "Read the sentence and choose True or False.",
    options: [
      { label: "A", text: "True", isCorrect: false },
      { label: "B", text: "False", isCorrect: true },
    ],
    explanation: {
      errorFound: "Struktur paralel rusak: 'foster' (infinitive), 'developing' (gerund), dan 'inspire' (infinitive). Kata 'developing' seharusnya 'develop'.",
      rule: "Parallel Structure: Unsur-unsur yang disusun berurutan dalam deret koordinatif wajib memiliki bentuk tata bahasa yang setara.",
      correctSentence: "The modern scholarship program aims to foster critical thinking, develop leadership skills, and inspire community service.",
    },
  },
  {
    id: "boss-q6",
    category: "TKA Grammar Comprehension",
    sentence: "Neither the head manager nor the assistant supervisors was aware of the sudden system outage.",
    questionText: "Read the sentence and choose True or False.",
    options: [
      { label: "A", text: "True", isCorrect: false },
      { label: "B", text: "False", isCorrect: true },
    ],
    explanation: {
      errorFound: "'was' keliru; seharusnya menggunakan kata kerja jamak 'were'.",
      rule: "Rule of Proximity: Pada konjungsi berpasangan 'Neither... nor' atau 'Either... or', bentuk kata kerja diselaraskan dengan subjek yang paling dekat (subjek kedua: 'the assistant supervisors' yang jamak).",
      correctSentence: "Neither the head manager nor the assistant supervisors were aware of the sudden system outage.",
    },
  },
  {
    id: "boss-q7",
    category: "TKA Grammar Comprehension",
    sentence: "Having completed the lab experiment ahead of schedule, the professor praised the students for their accuracy.",
    questionText: "Read the sentence and choose True or False.",
    options: [
      { label: "A", text: "True", isCorrect: false },
      { label: "B", text: "False", isCorrect: true },
    ],
    explanation: {
      errorFound: "Dangling Participle: yang menyelesaikan eksperimen adalah para siswa, namun subjek utama yang mengikuti koma justru sang profesor.",
      rule: "Participle Modifier: Subjek utama yang berada langsung setelah koma pembuka wajib menjadi pelaku logis dari frasa participle tersebut.",
      correctSentence: "Having completed the lab experiment ahead of schedule, the students were praised by the professor for their accuracy.",
    },
  },
  {
    id: "boss-q8",
    category: "TKA Grammar Comprehension",
    sentence: "Had the economic council implemented the reform sooner, inflation would have stabilized by the third quarter.",
    questionText: "Read the sentence and choose True or False.",
    options: [
      { label: "A", text: "True", isCorrect: true },
      { label: "B", text: "False", isCorrect: false },
    ],
    explanation: {
      errorFound: "Tidak ada kesalahan sama sekali. Kalimat ini merupakan inversi gramatikal Third Conditional yang sepenuhnya sahih.",
      rule: "Inverted Conditional: Bentuk 'Had + Subjek + V3' secara sah menggantikan 'If + Subjek + had + V3' dalam ragam bahasa formal TKA.",
      correctSentence: "Had the economic council implemented the reform sooner, inflation would have stabilized by the third quarter.",
    },
  },
  {
    id: "boss-q9",
    category: "TKA Grammar Comprehension",
    sentence: "The environmental scientist whom delivered the keynote address received international recognition.",
    questionText: "Read the sentence and choose True or False.",
    options: [
      { label: "A", text: "True", isCorrect: false },
      { label: "B", text: "False", isCorrect: true },
    ],
    explanation: {
      errorFound: "'whom' salah karena menempati posisi subjek bagi kata kerja 'delivered'. Seharusnya menggunakan kata ganti subjek 'who'.",
      rule: "Case of Relative Pronouns: Gunakan 'who' jika perannya sebagai subjek pelaku aksi ('who delivered'), dan gunakan 'whom' hanya jika perannya sebagai objek penderita aksi.",
      correctSentence: "The environmental scientist who delivered the keynote address received international recognition.",
    },
  },
  {
    id: "boss-q10",
    category: "TKA Grammar Comprehension",
    sentence: "The academic journal provides invaluable advice and numerous informations for graduate researchers.",
    questionText: "Read the sentence and choose True or False.",
    options: [
      { label: "A", text: "True", isCorrect: false },
      { label: "B", text: "False", isCorrect: true },
    ],
    explanation: {
      errorFound: "'informations' keliru karena 'information' adalah kata benda tak dapat dihitung (uncountable noun) yang tidak memiliki bentuk jamak -s.",
      rule: "Uncountable Noun Quantification: Kata benda uncountable tidak boleh diimbuhi akhiran -s atau didahului 'numerous' secara langsung. Gunakan 'much information' atau 'numerous pieces of information'.",
      correctSentence: "The academic journal provides invaluable advice and numerous pieces of information for graduate researchers.",
    },
  },
];
