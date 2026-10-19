// Mock Dataset for Archer Realm - Flashcard Duel (Confusion Words Module)
// Standardized for TKA English Mastery

export const mockFlashcards = [
  {
    id: "fc-1",
    wordA: "Affect",
    wordB: "Effect",
    category: "Confusion Words",
    subtitle: "Kata yang sering tertukar, tapi artinya beda!",
    contextQuestion: "The prolonged drought will severely _____ the regional harvest this quarter.",
    correctChoice: "A", // Affect
    targetWord: "Affect",
    quickTips: {
      tipA: "Affect = mempengaruhi (verb)",
      tipB: "Effect = hasil / dampak (noun)",
    },
    explanation: {
      whyWrong: "Di kalimat ini kita memerlukan predikat (kata kerja) setelah modal auxiliary 'will severely', bukan kata benda.",
      keyRule: "Ingat trik RAVEN: Remember Affect Verb, Effect Noun. (Affect = Aksi mempengaruhi, Effect = Hasil/dampak).",
      example: "The bad weather affected his flight, and the effect was a six-hour delay.",
    },
  },
  {
    id: "fc-2",
    wordA: "Complement",
    wordB: "Compliment",
    category: "Confusion Words",
    subtitle: "Hanya beda huruf 'e' dan 'i'!",
    contextQuestion: "The head chef received a warm _____ from the food critic for her signature seafood dish.",
    correctChoice: "B", // Compliment
    targetWord: "Compliment",
    quickTips: {
      tipA: "Complement = melengkapi / penyempurna (ada huruf 'e' seperti complete)",
      tipB: "Compliment = pujian / sanjungan (ada huruf 'i' seperti I like you)",
    },
    explanation: {
      whyWrong: "Kalimat tersebut membahas apresiasi atau pujian atas masakan koki, bukan unsur yang saling melengkapi.",
      keyRule: "Compliment dengan 'I' = 'I give you praise'. Complement dengan 'E' = 'Complete' (melengkapi).",
      example: "She paid him a lovely compliment, saying his necktie was a great complement to his suit.",
    },
  },
  {
    id: "fc-3",
    wordA: "Principal",
    wordB: "Principle",
    category: "Confusion Words",
    subtitle: "Pelafalan sama, peran dalam kalimat berbeda jauh!",
    contextQuestion: "Integrity is the core _____ that guides all of our organizational decisions.",
    correctChoice: "B", // Principle
    targetWord: "Principle",
    quickTips: {
      tipA: "Principal = kepala sekolah / hal utama (noun / adj)",
      tipB: "Principle = prinsip / asas / nilai dasar (noun)",
    },
    explanation: {
      whyWrong: "Kalimat ini merujuk pada asas atau aturan moral yang dipegang teguh, bukan pimpinan institusi atau modal pokok.",
      keyRule: "Principle berakhiran 'le' seperti 'rule' (aturan/nilai). Principal berakhiran 'pal' seperti kawan/pimpinan ('pal').",
      example: "The school principal refused to compromise on his ethical principles.",
    },
  },
  {
    id: "fc-4",
    wordA: "Stationary",
    wordB: "Stationery",
    category: "Confusion Words",
    subtitle: "Jangan sampai salah beli perlengkapan kantor!",
    contextQuestion: "The traffic remained completely _____ for over an hour due to the sudden landslide.",
    correctChoice: "A", // Stationary
    targetWord: "Stationary",
    quickTips: {
      tipA: "Stationary = diam / tidak bergerak (adjective)",
      tipB: "Stationery = alat tulis / kertas surat (noun)",
    },
    explanation: {
      whyWrong: "Kendaraan dan arus lalu lintas dalam konteks ini macet tak bergerak sama sekali, bukan terkait kertas atau alat tulis.",
      keyRule: "StationEry dengan 'E' untuk Envelope (surat/alat tulis). StationAry dengan 'A' untuk Anchor (jangkar/diam mematung).",
      example: "The delivery truck remained stationary while the courier unloaded boxes of office stationery.",
    },
  },
  {
    id: "fc-5",
    wordA: "Illusion",
    wordB: "Allusion",
    category: "Confusion Words",
    subtitle: "Halusinasi visual vs rujukan sastra tersirat.",
    contextQuestion: "In the novel's dramatic climax, the author made a subtle _____ to ancient Greek mythology.",
    correctChoice: "B", // Allusion
    targetWord: "Allusion",
    quickTips: {
      tipA: "Illusion = ilusi / tipuan persepsi indra",
      tipB: "Allusion = kiasan / alusi / rujukan tersirat",
    },
    explanation: {
      whyWrong: "Penulis novel sedang menyisipkan rujukan tersirat (alusi sastra), bukan atraksi sulap atau tipuan mata.",
      keyRule: "Allusion = Allude / refer to (merujuk secara halus). Illusion = Illusory / trick of the eye (tipuan ilusi).",
      example: "The mirror maze created an optical illusion, while the poem contained an allusion to Shakespeare.",
    },
  },
  {
    id: "fc-6",
    wordA: "Beside",
    wordB: "Besides",
    category: "Confusion Words",
    subtitle: "Hanya selisih satu huruf 's' di akhir!",
    contextQuestion: "_____ English and Japanese, Maya is currently learning conversational German.",
    correctChoice: "B", // Besides
    targetWord: "Besides",
    quickTips: {
      tipA: "Beside = di sebelah / di samping secara fisik",
      tipB: "Besides = selain / di samping itu (in addition to)",
    },
    explanation: {
      whyWrong: "Konteks kalimat menunjukkan penambahan kecakapan bahasa (in addition to), bukan posisi koordinat fisik di samping.",
      keyRule: "BesideS dengan 'S' = Something Extra (selain itu). Beside tanpa 'S' = By the side (di sebelah fisik).",
      example: "He sat beside me during lunch. Besides pizza, he also ordered chicken salad.",
    },
  },
  {
    id: "fc-7",
    wordA: "Discreet",
    wordB: "Discrete",
    category: "Confusion Words",
    subtitle: "Posisi huruf 'e' menentukan makna rahasia vs terpisah!",
    contextQuestion: "The research team divided the participants into five _____ experimental groups.",
    correctChoice: "B", // Discrete
    targetWord: "Discrete",
    quickTips: {
      tipA: "Discreet = bijak menjaga rahasia / hati-hati",
      tipB: "Discrete = terpisah / berdiri sendiri / diskrit",
    },
    explanation: {
      whyWrong: "Partisipan penelitian dipisahkan ke dalam kategori yang mandiri dan terpisah (distinct/separate), bukan kelompok yang menjaga rahasia.",
      keyRule: "DiscrE-T-E: huruf 't' memisahkan kedua 'e' ('terpisah/separate'). DiscrEEt: kedua 'e' bersatu rapat ('rahasia aman').",
      example: "Please be discreet about our findings. We are analyzing data from three discrete labs.",
    },
  },
  {
    id: "fc-8",
    wordA: "Eminent",
    wordB: "Imminent",
    category: "Confusion Words",
    subtitle: "Tokoh ternama vs kejadian genting yang sebentar lagi terjadi!",
    contextQuestion: "Dark storm clouds gathered over the harbor, warning sailors of _____ heavy rain.",
    correctChoice: "B", // Imminent
    targetWord: "Imminent",
    quickTips: {
      tipA: "Eminent = terkemuka / tersohor / terpandang",
      tipB: "Imminent = sudah di depan mata / segera terjadi",
    },
    explanation: {
      whyWrong: "Awan hitam pekat mengindikasikan badai yang sudah di depan mata dan segera terjadi, bukan cuaca yang terhormat/tersohor.",
      keyRule: "Imminent = In a Minute (segera terjadi). Eminent = Excellence / Esteemed (sosok terkemuka/terpandang).",
      example: "The eminent climatologist predicted that a severe hurricane was imminent.",
    },
  },
  {
    id: "fc-9",
    wordA: "Advice",
    wordB: "Advise",
    category: "Confusion Words",
    subtitle: "Beda huruf 'c' (noun) dan 's' (verb).",
    contextQuestion: "Could you please _____ me on how to apply for the prestigious scholarship?",
    correctChoice: "B", // Advise
    targetWord: "Advise",
    quickTips: {
      tipA: "Advice = nasihat / saran (kata benda / noun)",
      tipB: "Advise = menasihati / menyarankan (kata kerja / verb)",
    },
    explanation: {
      whyWrong: "Setelah kata kerja bantu modal 'Could you please', kita membutuhkan bare infinitive (kata kerja), yaitu 'advise'.",
      keyRule: "AdviCe dengan 'C' = Cat (noun, benda yang diberikan). AdviSe dengan 'S' = Say (verb, tindakan menasihati).",
      example: "My teacher gave me great advice, and she will advise me again before finals.",
    },
  },
  {
    id: "fc-10",
    wordA: "Loose",
    wordB: "Lose",
    category: "Confusion Words",
    subtitle: "Satu huruf 'o' yang sering bikin salah di ujian TKA!",
    contextQuestion: "If you do not double-check your grammar answers, you might _____ precious points.",
    correctChoice: "B", // Lose
    targetWord: "Lose",
    quickTips: {
      tipA: "Loose = longgar / tidak kencang (adjective)",
      tipB: "Lose = kehilangan / kalah (kata kerja / verb)",
    },
    explanation: {
      whyWrong: "Konteks kalimat adalah potensi kehilangan poin ujian ('lose points'), bukan poin yang kendor atau longgar.",
      keyRule: "Loose punya dua 'o' (longgar ruangnya). Lose cuma satu 'o' (kehilangan satu 'o').",
      example: "Wear loose clothing to the match so you don't lose your focus on the court.",
    },
  },
];
