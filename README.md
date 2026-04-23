# 🌙 Cahaya Sunnah – Pencarian Hadis + AI

Aplikasi web pencarian hadis Nabi Muhammad ﷺ berdasarkan tema atau kata kunci, dilengkapi penjelasan singkat berbasis Claude AI.

## ✨ Fitur
- 🔍 Pencarian hadis dari 6 kitab shahih sekaligus
- 🤖 Penjelasan singkat + pelajaran praktis oleh Claude AI
- 📖 Teks Arab & terjemahan Indonesia
- 🔀 Hadis acak
- 📤 Share ke WhatsApp / copy teks
- ⚡ Dark mode elegan, responsive mobile

## 📦 Stack
- **Next.js 14** (App Router)
- **Tailwind CSS**
- **Hadith API**: fawazahmed0/hadith-api (gratis, tanpa key)
- **AI**: Anthropic Claude API

---

## 🚀 Cara Setup Lokal

### 1. Clone & Install
```bash
git clone <repo-url>
cd cahaya-sunnah
npm install
```

### 2. Set Environment Variable
```bash
cp .env.local.example .env.local
```
Edit `.env.local` dan isi API key Claude dari https://console.anthropic.com/

### 3. Jalankan
```bash
npm run dev
```
Buka http://localhost:3000

---

## ☁️ Deploy ke Vercel

### Cara 1: Via GitHub (Recommended)
1. Push kode ke GitHub
2. Buka https://vercel.com/new
3. Import repository
4. Di bagian **Environment Variables**, tambahkan:
   - Key: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-xxxxx` (API key Claude kamu)
5. Klik **Deploy** ✅

### Cara 2: Via Vercel CLI
```bash
npm i -g vercel
vercel
# Ikuti instruksi, lalu tambahkan env variable:
vercel env add ANTHROPIC_API_KEY
```

---

## 📁 Struktur File
```
├── app/
│   ├── page.tsx              # Halaman utama
│   ├── layout.tsx            # Layout + fonts
│   ├── globals.css           # Styling global
│   └── api/
│       ├── search/route.ts   # API pencarian hadis
│       └── random/route.ts   # API hadis acak
├── components/
│   ├── SearchBar.tsx         # Komponen search bar
│   └── HadithCard.tsx        # Komponen kartu hadis
├── .env.local.example        # Template env variable
└── README.md
```

---

## 🔌 Sumber Data
- Hadis: [fawazahmed0/hadith-api](https://github.com/fawazahmed0/hadith-api) – Gratis, open source
- Penjelasan: [Anthropic Claude API](https://anthropic.com) – Berbayar (sangat terjangkau)

---

## 🤲 Semoga menjadi amal jariyah
