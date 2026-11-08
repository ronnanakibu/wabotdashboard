# ronnproject.my.id — Creative Engineering & Autonomous AI Ecosystem

Website portal utama dan mission control untuk seluruh ekosistem karya rekayasa software oleh Ronn. Mengintegrasikan seluruh hobby project, bot pintar WhatsApp (WABOT 2.0), web pembelajaran interaktif (EnglishQuest), dan siaran live audio 24/7 di bawah satu domain utama: `ronnproject.my.id`.

---

## 🌐 Subdomain & Architecture Matrix

| Domain / Subdomain | Layanan / Proyek | Status | Kategori |
|---|---|---|---|
| `ronnproject.my.id` | **Landing Page & Ecosystem Portal** | ✅ Active | Central Gateway |
| `equest.ronnproject.my.id` | **EnglishQuest Web** | ✅ Active (Vercel) | EdTech / Gamified |
| `wabot.ronnproject.my.id` | **WABOT 2.0 Dashboard** | 🚀 Ready | Autonomous Bot / Baileys |
| `ronnproject.my.id/radio` | **Live Radio Station & Queue** | 📻 24/7 On Air | Web Audio API / Icecast |
| `ronnproject.my.id/commands` | **WhatsApp Bot Command Catalog** | ⚡ 48+ Commands | Catalog & Usage |
| `ronnproject.my.id/owner/*` | **Observatory, Groups & Telemetry** | 🔒 Protected | Mission Control |

---

## ✨ Fitur Landing Page

- **Lightweight 2D Cybernetic Canvas Background**: Partikel konstelasi responsif kursor mouse berbasis HTML5 Canvas murni (60 FPS, GPU compositor, pause otomatis saat off-screen / tab tersembunyi, mendukung `prefers-reduced-motion`).
- **Interactive Soundwave Visualizer**: Visualisasi frekuensi audio 36-bar real-time yang tersambung langsung dengan stream audio 24/7 dan metadata lagu yang sedang berputar.
- **Developer Mission Control Terminal**: Simulator console interaktif yang dapat menerima input ketikan langsung (`help`, `projects`, `equest`, `wabot`, `radio`, `stats`, `clear`) maupun tombol preset satu klik.
- **Subdomain Directory & Project Showcase**: Kartu showcase setiap proyek dengan status pill, tombol launch langsung, dan fitur satu klik salin link subdomain.
- **Theme Accent Switcher**: Pilihan aksen warna instan di navbar (Mint Teal `#7FD1C7`, Lavender `#C9B6FF`, Amber `#E8C27A`) tersimpan di `localStorage`.
- **Mobile-First Responsive Layout**: Navigasi mobile dengan drawer sheet, padding adaptif, dan hit area minimal 44px sesuai standar ergonomi sentuh.

---

## 🚀 Menjalankan Secara Lokal

```bash
# Masuk ke folder repo
cd D:\CE\JavaScript\ronn-ai-web

# Install dependencies jika diperlukan
npm install

# Jalankan development server
npm run dev
```

Buka browser di `http://localhost:5173`.

---

## 📦 Build Produksi & Deploy ke Vercel

```bash
# Build bundle produksi
npm run build

# Preview build lokal
npm run preview
```

### Deploy ke Git & Vercel:
1. Hubungkan repository lokal ini ke GitHub:
   ```bash
   git add .
   git commit -m "feat: landing page ecosystem & subdomains hub"
   git remote add origin https://github.com/<username>/ronn-ai-web.git
   git branch -M main
   git push -u origin main
   ```
2. Di Vercel Dashboard:
   - Klik **Add New...** > **Project**.
   - Pilih repo `ronn-ai-web`.
   - Vercel akan otomatis mendeteksi Framework Preset: **Vite**.
   - Tambahkan Environment Variable:
     - `VITE_BOT_API_URL`: URL API bot kamu (misal: `https://api.ronnproject.my.id` atau URL backend VPS kamu).
   - Klik **Deploy**.
3. Pasang Domain Utama:
   - Buka **Project Settings** > **Domains**.
   - Tambahkan `ronnproject.my.id`.
   - Pasang DNS Record di registrar domain sesuai instruksi Vercel (A Record `76.76.21.21` atau CNAME).
