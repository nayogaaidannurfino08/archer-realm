# ARCHER REALM: AI DEVELOPMENT RULES & GUIDELINES

## 1. IDENTITY & OWNERSHIP
- Nama Aplikasi: Archer Realm (TKA English Mastery Platform)
- Creator & Hak Cipta: Nayoga Aidan Nurfino
- Wajib sertakan watermark di Header: "Engineered by Nayoga Aidan Nurfino"
- Wajib sertakan di Footer: "© 2026 Nayoga Aidan Nurfino. All rights reserved."

## 2. STRICT DESIGN PRINCIPLES (ANTI AI-SLOP)
- Format: Responsive Web Application (Utamakan Mobile-first layout).
- Gaya Visual: Modern SaaS / Edutech UI (Dark Slate, aksen Emerald Green, tipografi bersih ala Bento Grid).
- BUKAN game mobile kartun norak. Elemen ilustrasi fantasi HANYA boleh ada di dalam modul "Boss Arena". Area Dashboard, Flashcard, Uploader, dan Speech Lab harus tetap clean, sleek, dan profesional.
- Hindari komponen berantakan atau gaya desain murahan.

## 3. ARCHITECTURE & TECH STACK
- Framework: React 18+ (Vite)
- Styling: Tailwind CSS
- Icons: Lucide React
- Routing: Tab-based state navigation (Dashboard, Flashcard, Boss Arena, Speech Lab, Uploader).
- State Persistence: Gunakan LocalStorage terlebih dahulu untuk menyimpan progres (XP, streak, karakter aktif, kartu yang salah).
- Backend (Nanti): Supabase Free Tier & Google Gemini Flash API Free Tier.
- Speech Engine: Native Web Speech API bawaan browser.

## 4. CODING CONVENTIONS
- Clean Code: Pecah komponen secara modular sesuai struktur folder (Layout, Dashboard, Flashcard, Arena, Speech, Uploader).
- Data Separation: DILARANG keras hardcode data soal di dalam file JSX tampilan. Semua dummy data wajib ditaruh di `src/data/mock*.js`.
- Error Handling: Komponen harus tahan banting, tidak boleh layar blank jika data kosong.

## 5. WORKFLOW RULE (STEP-BY-STEP)
- JANGAN PERNAH membuat semua fitur sekaligus dalam satu waktu.
- Kerjakan HANYA komponen yang diminta secara spesifik oleh user.
- Tunggu konfirmasi dan evaluasi user sebelum melanjutkan ke modul berikutnya.