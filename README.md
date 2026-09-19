# RAMU — Creative Opportunity Engine

> **Platform Kolaborasi Ekonomi Kreatif Berbasis Analisis Komplementaritas Deterministik**  
> Dibangun untuk Kompetisi Web Development.

---

## 💡 Tentang Proyek

**RAMU (Creative Opportunity Engine)** bukan sekadar direktori pencarian partner (*"siapa yang cocok jadi partner saya?"*), melainkan sebuah mesin pembentuk peluang kolaborasi (*"apa yang dapat kita ciptakan bersama berdasarkan apa yang kita miliki?"*).

Sistem menganalisis aset, kapabilitas, kebutuhan, tujuan, dan batasan (*constraints*) dari berbagai pelaku ekonomi kreatif, mencocokkannya ke dalam pola peluang (*Opportunity Patterns*), menguji kelayakan eksekusinya, dan memberikan skor terukur dalam 6 dimensi objektif:
1. **Complementarity**
2. **Goal Alignment**
3. **Need Coverage**
4. **Asset Utilization**
5. **Feasibility**
6. **Actionability**

Didukung dengan narasi penjelasan AI (Google Gemini) yang transparan dan *explainable*.

---

## 🏛️ Arsitektur Sistem (Modular Layered Architecture)

Repositori ini menerapkan pemisahan tanggung jawab yang ketat:

```text
src/
├── app/                  # Next.js App Router (Routing, Pages, Layouts, API Routes)
│   ├── (auth)/           # Authentication flows (Login, Register)
│   ├── dashboard/        # Dashboard overview aktor & rekomendasi
│   ├── assets/           # Manajemen aset, kapabilitas, kebutuhan, constraint
│   ├── opportunities/    # Penjelajah & detail peluang kolaborasi
│   ├── collaborations/   # Ruang kerja kolaborasi & tracking milestone
│   └── api/              # RESTful API handlers
│
├── components/           # Reusable Presentation Components
│   ├── ui/               # Primitif UI (Button, Card, Dialog, Badge, dll.)
│   ├── assets/           # Komponen form & kartu aset
│   ├── opportunities/    # Komponen kartu peluang, radar/bar score, narasi
│   ├── collaborations/   # Komponen board task, timeline milestone
│   └── dashboard/        # Komponen metrik & visualisasi dashboard
│
├── domain/               # Domain Business Logic (Pure TypeScript, Zero Framework Dependency)
│   ├── actor/            # Entity & Value Object Aktor
│   ├── asset/            # Entity Aset & Taksonomi Ekraf
│   ├── goal/             # Entity Tujuan Aktor
│   ├── need/             # Entity Kebutuhan Aktor
│   ├── constraint/       # Entity Batasan (Waktu, Lokasi, Budget, Kapasitas)
│   ├── opportunity/      # Agregat Peluang & Status
│   ├── collaboration/    # Agregat Kolaborasi & Komitmen
│   └── outcome/          # Agregat Hasil & Feedback
│
├── engine/               # Core Opportunity Engine (100% Deterministik)
│   ├── complementarity/  # Evaluator komplementaritas aset
│   ├── patterns/         # 15 Katalog Pola Peluang Kolaborasi
│   ├── constraints/      # Evaluator kelayakan batasan
│   ├── scoring/          # Kalkulator 6 Dimensi Scoring & Confidence
│   └── explanation/      # Penyusun struktur penjelasan peluang
│
├── application/          # Application Use Cases & Orchestration
│   ├── actors/           # Use cases pengelolaan profil aktor
│   ├── assets/           # Use cases pendaftaran aset
│   ├── opportunities/    # Use cases pembentukan & evaluasi peluang
│   ├── collaborations/   # Use cases inisiasi & manajemen proyek kolaborasi
│   └── outcomes/         # Use cases pencatatan hasil kolaborasi
│
├── infrastructure/       # External Services & Technical Implementations
│   ├── database/         # Prisma Client & Migrations
│   ├── repositories/     # Implementasi konkrit interface repository
│   └── ai/               # Gemini AI Adapter & Mock AI Fallback
│
└── lib/                  # Shared Utilities & Helpers
    ├── validation/       # Zod schemas untuk validasi input form & API
    ├── auth/             # Session handler & auth middleware
    └── utils/            # Helper formatting, classnames, dates
```

---

## 📚 Dokumentasi Lengkap

Seluruh dokumen spesifikasi teknis dan perancangan tersimpan rapi pada direktori [`docs/`](./docs/):

- 📋 [**PRD (Product Requirements Document)**](./docs/PRD.md)
- 🏗️ [**System Architecture**](./docs/ARCHITECTURE.md)
- 🎯 [**MVP Scope & Implementation Plan**](./docs/MVP_SCOPE.md)
- 🧠 [**Domain Model**](./docs/DOMAIN_MODEL.md)
- ⚙️ [**12-Stage Opportunity Engine Spec**](./docs/ENGINE_SPEC.md)
- 📊 [**6-Dimension Scoring Model**](./docs/SCORING_MODEL.md)
- 🗄️ [**PostgreSQL Data Model**](./docs/DATA_MODEL.md)
- 🔌 [**REST API Specification**](./docs/API_SPEC.md)
- 🎨 [**Design System & Tokens**](./docs/DESIGN_SYSTEM.md)
- 🖥️ [**UI/UX Specification**](./docs/UI_UX_SPEC.md)
- 🗺️ [**User Flowchart**](./docs/USER_FLOW.md)
- 📝 [**Architectural Decision Records (ADR)**](./docs/DECISIONS.md)
- 📖 [**Indeks Lengkap Dokumentasi**](./docs/README.md)

---

## 🚀 Memulai Pengembangan

### 1. Prasyarat
- Node.js v18.17+ atau v20+
- npm v9+

### 2. Instalasi & Setup Environment
```bash
# Salin konfigurasi environment
cp .env.example .env.local

# Install dependensi (jika baru clone)
npm install
```

### 3. Menjalankan Development Server
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

### 4. Build Verifikasi
```bash
npm run build
```
