# Memoire — Personal Memory Photo Website

Premium glassmorphism personal memory archive · React + Vite + TailwindCSS + Framer Motion

---

## 🚀 Setup dari Nol (Pakai npx)

### Langkah 1 — Buat project baru dengan Vite

```bash
npx create-vite@latest memoire --template react
cd memoire
```

### Langkah 2 — Install semua dependencies

```bash
npm install
npm install react-router-dom framer-motion
npm install -D tailwindcss postcss autoprefixer
```

### Langkah 3 — Init Tailwind CSS

```bash
npx tailwindcss init -p
```

Ini akan otomatis membuat dua file:
- `tailwind.config.js`
- `postcss.config.js`

### Langkah 4 — Konfigurasi Tailwind

Buka `tailwind.config.js`, ganti isinya dengan:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
}
```

### Langkah 5 — Salin semua file dari project ini

Struktur folder yang perlu kamu buat:

```
memoire/
├── index.html                  ← ganti isi dengan file ini
├── vercel.json                 ← tambahkan file ini
├── tailwind.config.js          ← sudah dibuat di langkah 3, update isinya
├── src/
│   ├── main.jsx                ← ganti isi
│   ├── App.jsx                 ← ganti isi
│   ├── styles/
│   │   └── globals.css         ← buat folder + file baru
│   ├── data/
│   │   └── photos.js           ← buat folder + file baru
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── Gallery.jsx
│   │   ├── PhotoCard.jsx
│   │   ├── PhotoModal.jsx
│   │   ├── About.jsx
│   │   └── Footer.jsx
│   └── pages/
│       ├── Home.jsx
│       ├── GalleryPage.jsx
│       ├── ChapterPage.jsx
│       └── AboutPage.jsx
```

Hapus file bawaan Vite yang tidak dipakai:
```bash
rm src/App.css src/index.css src/assets/react.svg public/vite.svg
```

### Langkah 6 — Jalankan dev server

```bash
npm run dev
```

Buka browser di `http://localhost:5173` ✅

---

## 📦 Build & Deploy

```bash
npm run build       # build production ke folder /dist
npm run preview     # preview build lokal
```

### Deploy ke Vercel (gratis)

1. Push project ke GitHub
2. Buka [vercel.com](https://vercel.com) → **New Project** → Import repo
3. Framework preset: **Vite** (otomatis terdeteksi)
4. Klik **Deploy**

File `vercel.json` sudah menangani SPA routing otomatis.

---

## ✨ Fitur

| Fitur | Detail |
|---|---|
| Glass Navbar | Blur + opacity berubah saat scroll |
| Hero Section | Fullscreen dengan floating particles |
| Chapter Routing | `/chapter/high-school`, `/chapter/middle-school`, `/chapter/traveling` |
| Gallery | Filter tab per chapter, grid responsif |
| Photo Card | Hover zoom + caption reveal + glow border |
| Photo Modal | Backdrop blur + glass panel + tag display |
| About Section | Glass card + stats row |
| Footer | Floating glass bar |
| Background | Animated orbs + grain texture overlay |

---

## 🗂 Semua Routes

```
/                         → Home (Hero + Gallery + About)
/gallery                  → Full gallery semua chapter
/chapter/high-school      → Foto SMA
/chapter/middle-school    → Foto SMP
/chapter/traveling        → Foto perjalanan
/about                    → Halaman About
```

---

## 🎨 Design System

- **Font display:** Cormorant Garamond (serif, elegant)
- **Font body:** DM Sans (clean, modern)
- **Background:** Deep midnight `#080810` dengan animated orbs
- **Accent global:** `#e8c4a0` (warm gold)
- **Accent High School:** `#c084fc` (purple)
- **Accent Middle School:** `#38bdf8` (sky blue)
- **Accent Traveling:** `#fb923c` (orange)
- **Glass effect:** `backdrop-filter: blur(20px)` + `rgba(255,255,255,0.07)`

---

## 🔧 Untuk Mengganti Foto

Edit file `src/data/photos.js`. Setiap foto punya format:

```js
{
  id: 1,
  title: "Nama Foto",
  caption: "Keterangan singkat",
  imageUrl: "https://url-foto-kamu.jpg",
  date: "Juni 2022",
  tags: ["tag1", "tag2"],
}
```

Ganti `imageUrl` dengan URL foto kamu sendiri (Google Drive, Cloudinary, Unsplash, dll).