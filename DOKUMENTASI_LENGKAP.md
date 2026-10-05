# 📖 RAMU (Creative Opportunity Engine) — Master Project Documentation

> **Platform Kolaborasi Ekonomi Kreatif Berbasis Analisis Komplementaritas Deterministik & Ekosistem Komersial Terpadu**  
> Versi Dokumen: `2.0.0` | Status Proyek: `Production Ready` | Target: `Kompetisi Web Development & Solusi Ekosistem Kreatif Indonesia`

---

## 📑 Daftar Isi

1. [Ringkasan Eksekutif & Visi Proyek](#1-ringkasan-eksekutif--visi-proyek)
2. [Masalah Industri & Nilai Diferensiasi](#2-masalah-industri--nilai-diferensiasi)
3. [Arsitektur Sistem & Tech Stack](#3-arsitektur-sistem--tech-stack)
4. [Struktur Direktori Repositori](#4-struktur-direktori-repositori)
5. [9 Pilar Fitur Utama](#5-9-pilar-fitur-utama)
   - [5.1 Core Deterministic Opportunity Engine & 15 Katalog Pola](#51-core-deterministic-opportunity-engine--15-katalog-pola)
   - [5.2 Direktori Talenta & Profil Komersial Kreatif](#52-direktori-talenta--profil-komersial-kreatif)
   - [5.3 Manajemen Paket Tarif, Hak Cipta (Usage Rights) & Spesifikasi Studio](#53-manajemen-paket-tarif-hak-cipta-usage-rights--spesifikasi-studio)
   - [5.4 Project Brief & Production Call Sheet Hub](#54-project-brief--production-call-sheet-hub)
   - [5.5 Smart Crew Matching Engine (Algoritma Penjodohan Kru)](#55-smart-crew-matching-engine-algoritma-penjodohan-kru)
   - [5.6 Sistem Booking Langsung & Manajemen Negosiasi](#56-sistem-booking-langsung--manajemen-negosiasi)
   - [5.7 In-App Messenger Transaksional & Interactive Widgets](#57-in-app-messenger-transaksional--interactive-widgets)
   - [5.8 Pusat Notifikasi Real-Time](#58-pusat-notifikasi-real-time)
   - [5.9 Sistem Perlindungan Hukum SPK Multi-Pihak (PKSK Standar Indonesia)](#59-sistem-perlindungan-hukum-spk-multi-pihak-pksk-standar-indonesia)
   - [5.10 Showcase Portofolio & Interactive Tear Sheet (Proof-of-Craft)](#510-showcase-portofolio--interactive-tear-sheet-proof-of-craft)
   - [5.11 Readiness Hub & Metrik Kesiapan Kolaborasi](#511-readiness-hub--metrik-kesiapan-kolaborasi)
6. [Arsitektur Data & Model Database (Prisma & SQL Raw)](#6-arsitektur-data--model-database-prisma--sql-raw)
7. [Daftar Server Actions & API Endpoints](#7-daftar-server-actions--api-endpoints)
8. [Panduan Instalasi, Setup Lingkungan & Seeding](#8-panduan-instalasi-setup-lingkungan--seeding)
9. [Dataset Demo Bawaan (Golden Demo Scenario)](#9-dataset-demo-bawaan-golden-demo-scenario)
10. [Roadmap & Potensi Pengembangan Lanjutan](#10-roadmap--potensi-pengembangan-lanjutan)

---

## 1. Ringkasan Eksekutif & Visi Proyek

**RAMU (Creative Opportunity Engine)** adalah platform ekosistem kerja sama kreatif yang dirancang khusus untuk mentransformasi cara pelaku ekonomi kreatif di Indonesia (Desainer Mode, Fotografer, Model/Talenta, Makeup Artist, Sutradara Seni, Studio Foto, hingga Brand Lokal/UMKM) saling menemukan, merancang proyek, bernegosiasi, mengamankan hak cipta, dan mengeksekusi kolaborasi komersial.

Berbeda dengan direktori konvensional yang pasif (*"siapa yang bisa saya ajak kerja sama?"*), **RAMU** berperan aktif sebagai sebuah **Mesin Sintesis Peluang (*Opportunity Engine*)**:
> *"Berdasarkan aset, perlengkapan, studio, keahlian, dan batasan yang Anda miliki saat ini, proyek bernilai tinggi apa yang bisa kita ciptakan bersama secara layak dan menguntungkan?"*

Platform ini menggabungkan **5 Core Pillars Ekonomi Kolaboratif**:
1. **Core 1 — Resource Profile & Idle Capacity**: Mendaftarkan aset, keahlian, alat, ruang, dan ketersediaan waktu untuk mengaktifkan aset tidur (*idle resources*).
2. **Core 2 — Collaboration Matching ("Why This Match?")**: Evaluasi kompatibilitas 4 pilar transparan (Resource Fit 40%, Need Coverage 25%, Feasibility 20%, Readiness 15%).
3. **Core 3 — Collaboration Workspace**: Ruang kerja tim, project brief, timeline, pembagian tugas, dan anggaran bersama.
4. **Core 4 — Commercial Agreement Generator**: Penyusun draf kesepakatan multi-pihak terstandarisasi (DP 50%, hak pakai media/usage rights, batasan revisi 2x, dan batas penggunaan AI).
5. **Core 5 — Economic Outcome Dashboard**: Pelacakan dampak ekonomi riil, total nilai proyek yang tercipta, dan aktivasi aset yang sebelumnya tidak digunakan.

---

## 2. Masalah Industri & Nilai Diferensiasi

### Permasalahan yang Dihadapi Industri Kreatif Indonesia:
1. **Fragmentasi & Asimetri Informasi**: Brand dan kreator kesulitan mencari rekan kerja yang memiliki kecocokan estetika (*aesthetic style*), kelengkapan alat, dan anggaran yang sinkron.
2. **Kesepakatan Informal yang Berisiko Tinggi**: Mayoritas kolaborasi kreatif hanya disepakati via obrolan WhatsApp tanpa SPK resmi, berujung pada revisi tak terbatas (*scope creep*), keterlambatan pembayaran, dan sengketa hak pakai.
3. **Ketiadaan Standar Lisensi (Usage Rights)**: Banyak klien menggunakan hasil foto editorial untuk iklan komersial luar ruang (billboard) atau digital ads tanpa kompensasi tambahan kepada fotografer dan model.
4. **Pencurian Karya untuk Pelatihan AI**: Meningkatnya kekhawatiran kreator lokal bahwa karya digital mereka di-scrape untuk melatih model Generative AI tanpa izin (*anti-AI protection*).
5. **Kurangnya Pengakuan Kredit Bersama (Co-Crediting)**: Dalam produksi visual terpadu, sering kali hanya fotografer atau brand yang mendapat eksposur, sedangkan MUA, fashion stylist, dan tim set terlupakan.

### Nilai Diferensiasi Utama RAMU:
| Aspek | Platform Freelance Biasa (Upwork, Fastwork, Fiverr) | Media Sosial (Instagram, Behance) | **RAMU (Creative Opportunity Engine)** |
| :--- | :--- | :--- | :--- |
| **Model Temu Jodoh** | Lelang harga murah (Race to the bottom) | Portfolio visual pasif tanpa alur kerja | **Matching komplementaritas deterministik & kesesuaian estetika** |
| **Kontrak / Kesepakatan** | Format kaku standar luar negeri | Tanpa perlindungan tertulis | **Collaboration Agreement Generator Multi-Pihak + Usage Rights & Anti-AI** |
| **Alur Produksi** | Chat biasa & kirim file umum | Tidak ada | **Production Call Sheet generator, Role Slots, & Milestones** |
| **Hak Pakai Lisensi** | Tidak terdefinisi atau transfer total | Tidak ada kejelasan | **Granular Usage Rights (Organik, Ads Berbayar, OOH/Billboard, Buyout)** |
| **Aktivasi Aset Tidur** | Tidak ada fokus utilisasi | Pasif | **Resource Idle Activation (Studio, Kamera, Sisa Kain Deadstock)** |
| **Verifikasi Karya** | Gambar thumbnail standar | Gambar statis biasa | **Interactive Tear Sheet (Proof-of-craft: Gear, Lighting, HMUA, Wardrobe)** |

---

## 3. Arsitektur Sistem & Tech Stack

RAMU dibangun di atas fondasi teknologi modern berbasis performa tinggi, keamanan tipe data statis (*strict type-safety*), dan arsitektur modular berlapis (*Clean Layered Architecture*):

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER (Next.js 16 App Router)           │
│  Pages, Layouts, Server Components, Client Components, Dynamic Modals  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                    APPLICATION LAYER (Server Actions & Services)       │
│  ProjectBriefService, MessageService, BookingService, ShowcaseService, │
│  NotificationService, OpportunityService, CollaborationService         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                      CORE ENGINE (Deterministic Business Logic)        │
│  Complementarity Engine, 15 Pattern Catalog, Constraints Evaluator,    │
│  6-Dimension Scoring Engine, Explanation Structurer                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER (Database & Persistence)       │
│  Prisma ORM (v6.19.3), PostgreSQL (Supabase), Raw SQL Query Engines,  │
│  Supabase Auth / Session Handlers, Storage Services                   │
└────────────────────────────────────────────────────────────────────────┘
```

### Rincian Dependensi & Perkakas:
- **Core Framework**: `Next.js 16.3.5` (App Router)
- **UI Runtime**: `React 19.2.8` & `React DOM 19.2.8`
- **Language**: `TypeScript 5` (Strict Mode)
- **Styling**: `Tailwind CSS v4` + PostCSS 4
- **Iconography**: `lucide-react` (1.47.0)
- **Database & ORM**: `Prisma ORM 6.19.3` & `PostgreSQL` via `Supabase`
- **Authentication & Backend Services**: `@supabase/ssr` (0.12.7) & `@supabase/supabase-js` (2.116.0)
- **Database Seeding & CLI Runner**: `tsx` (4.23.13)

---

## 4. Struktur Direktori Repositori

```text
RAMU/
├── prisma/
│   ├── schema.prisma              # Skema relasional lengkap Prisma (875 baris)
│   ├── seed.ts                    # Seeding skenario Golden Demo kreator & aset
│   ├── seed-demo-messages.ts      # Seeding percakapan interaktif & penawaran proyek
│   └── init-messages-table.ts     # Inisialisasi tabel SQL langsung direct_messages
├── scripts/
│   └── init-notifications-table.ts# Inisialisasi tabel SQL langsung notifications
├── src/
│   ├── app/                       # Rute App Router Next.js 16
│   │   ├── (auth)/                # Otentikasi login & registrasi
│   │   ├── api/                   # Server action wrappers & webhook handlers
│   │   ├── assets/                # Manajemen inventaris aset, perlengkapan & studio
│   │   ├── collaborations/        # Ruang kerja proyek aktif & penandatanganan SPK
│   │   ├── constraints/           # Manajemen batasan (budget, waktu, lokasi)
│   │   ├── dashboard/             # Command center kreator & manajemen booking
│   │   ├── directory/             # Direktori talenta, studio, dan pencarian kreator
│   │   ├── engine-insights/       # Visualisasi cara kerja engine & analisis data
│   │   ├── goals/                 # Pengaturan target & pencapaian kreator
│   │   ├── messages/              # In-App Messenger transaksional & chat penawaran
│   │   ├── needs/                 # Kebutuhan kru & kolaborasi aktor
│   │   ├── onboarding/            # Alur pendaftaran awal & kelengkapan profil
│   │   ├── opportunities/         # Penjelajah peluang hasil sintesis mesin RAMU
│   │   ├── projects/              # Manajemen Project Brief, Call Sheet & Smart Crew
│   │   ├── readiness/             # Pusat skor kesiapan & metrik kematangan aset
│   │   ├── settings/              # Pengaturan profil, paket tarif & durasi lisensi
│   │   ├── showcase/              # Portofolio terkurasi & interactive tear sheet
│   │   ├── globals.css            # Tailwind v4 tema dasar & font tokens
│   │   ├── layout.tsx             # Root layout dengan navigation shell & auth context
│   │   └── page.tsx               # Landing page utama RAMU
│   ├── application/               # Layanan orkestrasi logika aplikasi
│   │   ├── assetService.ts
│   │   ├── bookingService.ts
│   │   ├── collaborationService.ts
│   │   ├── directoryService.ts
│   │   ├── feedbackService.ts
│   │   ├── messageService.ts
│   │   ├── notificationService.ts
│   │   ├── opportunityService.ts
│   │   ├── outcomeService.ts
│   │   ├── projectBriefService.ts
│   │   └── showcaseService.ts
│   ├── components/                # Komponen antarmuka pengguna
│   │   ├── assets/                # Kartu & modal penambahan aset
│   │   ├── auth/                  # Form otentikasi
│   │   ├── bookings/              # Kartu manajemen booking & status
│   │   ├── collaborations/        # SPK modal, timeline, taskboard, social credit
│   │   ├── dashboard/             # Metrik ringkasan, booking aktif, recent alerts
│   │   ├── directory/             # Kartu aktor, filterbar, slide-over drawer, booking modal
│   │   ├── landing/               # Hero, differentiator, final CTA, showcase preview
│   │   ├── layout/                # AppShell, Navbar, Sidebar navigasi
│   │   ├── messages/              # MessengerClient, kartu penawaran, delivery review
│   │   ├── notifications/         # NotificationBell, panel notifikasi melayang
│   │   ├── onboarding/            # Wizard pendaftaran peran & estetika
│   │   ├── opportunities/         # Radar chart skor 6D, visualizer komplementaritas
│   │   ├── projects/              # ProjectBriefCard, RoleSlot, SmartCrewPanel, CallSheet
│   │   ├── readiness/             # Health gauges, checklist aset
│   │   ├── settings/              # RatesForm, BrandCollabForm, SettingsNav
│   │   ├── showcase/              # TearSheetModal, HotspotPins, SocialCreditGenerator
│   │   └── ui/                    # Tombol, input, badge, tabs primitif
│   ├── domain/                    # Entitas murni domain model
│   ├── engine/                    # Mesin komplementaritas & kalkulator skor 6 dimensi
│   │   ├── complementarity/       # Evaluator hubungan aset silang
│   │   ├── constraints/           # Evaluasi batas anggaran, ketersediaan & geolokasi
│   │   ├── explanation/           # Generator penjelasan transparan
│   │   ├── patterns/              # Katalog 15 pola kolaborasi terstruktur
│   │   └── scoring/               # Algoritma perhitungan matematis 6 dimensi
│   ├── infrastructure/            # Adapter basis data & repositori
│   └── lib/                       # Utilitas, konstan role preset, & klien Supabase
```

---

## 5. 9 Pilar Fitur Utama

### 5.1 Core Deterministic Opportunity Engine & 15 Katalog Pola
Inti pembeda RAMU adalah mesin pembentuk peluang kolaborasi yang 100% deterministik. Mesin ini tidak bergantung pada prediksi halusinasi LLM untuk mencocokkan aktor, melainkan menggunakan evaluasi aturan biner dan pembobotan matematis pada 6 dimensi terukur:

```text
                           ┌───────────────────────────┐
                           │ 15 Opportunity Patterns   │
                           │ (Fashion, Editorial, dll.)│
                           └─────────────┬─────────────┘
                                         │
┌─────────────────────────┐              ▼              ┌─────────────────────────┐
│     Actor A Assets      │ ───►  COMPLEMENTARITY  ◄─── │     Actor B Assets      │
│ (Kamera, Studio, Skill) │           EVALUATOR         │ (Busana, Model, MUA)    │
└─────────────────────────┘              │              └─────────────────────────┘
                                         ▼
                           ┌───────────────────────────┐
                           │   CONSTRAINTS VALIDATOR   │
                           │  (Waktu, Budget, Lokasi)  │
                           └─────────────┬─────────────┘
                                         │
                                         ▼
                           ┌───────────────────────────┐
                           │   6-DIMENSIONAL SCORING   │
                           │ 1. Complementarity (25%)  │
                           │ 2. Goal Alignment (20%)   │
                           │ 3. Need Coverage (15%)    │
                           │ 4. Asset Utilization (15%)│
                           │ 5. Feasibility (15%)      │
                           │ 6. Actionability (10%)    │
                           └─────────────┬─────────────┘
                                         │
                                         ▼
                           ┌───────────────────────────┐
                           │ Synthesis: Synthesized    │
                           │ Opportunity & Explanation │
                           └───────────────────────────┘
```

#### 6 Dimensi Penilaian:
1. **Complementarity Score (25%)**: Mengukur apakah aset Para Pihak saling melengkapi secara struktural (misal: Fotografer + Kamera + Studio + Model + Busana Desainer).
2. **Goal Alignment Score (20%)**: Menguji keselarasan objektif masing-masing aktor (apakah sama-sama membidik editorial lookbook, rilis komersial, atau eksposur portofolio).
3. **Need Coverage Score (15%)**: Persentase kebutuhan eksplisit aktor A yang dapat dipenuhi oleh aset aktor B.
4. **Asset Utilization Score (15%)**: Rasio aset terpakai dibanding aset menganggur (*idle capacity*).
5. **Feasibility Score (15%)**: Menguji batasan teknis (kesamaan kota/lokasi, rentang jadwal kosong, dan batasan anggaran).
6. **Actionability Score (10%)**: Kesiapan eksekusi langsung berdasarkan kelengkapan kontak, status aktif akun, dan kelengkapan spesifikasi teknis.

---

### 5.2 Direktori Talenta & Profil Komersial Kreatif (Eksklusif 6 Peran Resmi)
Halaman `/directory` menyediakan basis data kurasi para pelaku kreatif di Indonesia yang **secara eksklusif dibatasi hanya pada 6 peran resmi ekosistem (tidak boleh ada yang lain)**:
1. **Fashion Brand/UMKM**: Brand apparel, label busana ready-to-wear/couture, atau UMKM mode yang merekrut kru dan mendanai produksi.
2. **Fashion Designer**: Perancang busana, pattern maker, desainer fesyen independen & perancang koleksi kapsul.
3. **Photographer**: Fotografer fashion editorial, katalog lookbook, kampanye e-commerce, dan materi promosi visual.
4. **Model**: Model peraga busana, editorial muse, talent runway & lookbook katalog.
5. **MUA/Stylist**: Makeup artist & hair stylist editorial serta penata gaya busana (wardrobe stylist) sesi pemotretan.
6. **Studio**: Fasilitas studio foto sewa, cyclorama wall, daylight loft studio, dan penyewaan lighting kit & perlengkapan produksi.

Selain itu, direktori dilengkapi filter pelengkap:
- **Gaya Estetika (*Aesthetic Styles*)**: *Minimalist Contemporary*, *Brutalist Raw*, *Earthy Warm*, *Avant-Garde High-Fashion*, *Y2K Nostalgic*, *Clean Commercial*, *Heritage Craft*.
- **Model Kompensasi Disukai**: Flat Project Fee, Daily Production Rate, Barter Karya/TFP, Revenue Sharing, Lisensi Royalti.
- **Slide-Over Profile Drawer**: Tampilan interaktif tanpa meninggalkan daftar direktori yang menampilkan bio, lencana pengalaman, galeri portofolio, spesifikasi studio, dan tombol instan **"Kirim Booking Request"**.

---

### 5.3 Manajemen Paket Tarif, Hak Cipta (Usage Rights) & Spesifikasi Studio
Terletak di `/settings/rates`, RAMU menetapkan standar transparansi penetapan harga (*commercial rate card*) untuk mengatasi masalah *undervaluing* di industri kreatif Indonesia:

#### 1. Penetapan Tarif Harian (Day Rate) & Jam Lembur (Overtime):
- Tarif Standar Full-Day (8 Jam Kerja) & Half-Day (4 Jam Kerja).
- Biaya Lembur Per Jam (*Overtime Rate*) terhitung otomatis jika sesi foto melebihi durasi kesepakatan.

#### 2. Matriks Lisensi Hak Pakai (Usage Rights Scope & Duration):
- **Cakupan Lisensi (`UsageRightsScope`)**:
  - `ORGANIC_SOCIAL`: Media Sosial Organik & Website Portofolio Brand.
  - `PAID_ADS_DIGITAL`: Iklan Berbayar Meta Ads, TikTok Ads, dan Marketplace (Shopee/Tokopedia).
  - `COMMERCIAL_OOH`: Billboard Luar Ruang, Baliho, Packaging Toko Fisik, dan Materi Banner Event.
  - `FULL_BUYOUT`: Hak Pakai Eksklusif Tanpa Batas Selamanya.
- **Durasi Lisensi (`UsageRightsDuration`)**: 6 Bulan, 1 Tahun (Standar Industri), 2 Tahun, atau *Perpetual*.

#### 3. Ketentuan Pembayaran Bertahap (`PaymentMilestoneScheme`):
- `50_50_WATERMARK`: DP 50% di muka untuk mengunci jadwal/studio + Pelunasan 50% setelah persetujuan preview ber-watermark sebelum serah terima file resolusi tinggi.
- `30_40_30`: 30% Pra-produksi + 40% Hari Produksi + 30% Final Handover.
- `100_UPFRONT`: Pembayaran penuh di muka (Full Upfront Settlement) sebelum jadwal pelaksanaan dimulai.

#### 4. Sewa Perlengkapan Teknis & Spesifikasi Ruang Studio:
- Dimensi Studio (Panjang × Lebar × Tinggi Plafon).
- Fasilitas: Cyclorama Infinity Wall, Ruang Ganti Ber-AC, Dedicated Makeup Vanity, Daya Listrik (Watt), Parkir Truk Logistik.
- Rental Alat Terintegrasi: Kamera, Lensa Cinema, Paket Lighting Continuous/Strobe, Modifier, dan Smoke Machine.

---

### 5.4 Project Brief & Production Call Sheet Hub
Di `/projects`, inisiator proyek (Brand atau Kreator Utama) dapat merilis brief terbuka maupun tertutup:
- **Interactive Multi-Step Brief Builder** (`/projects/new`): Menentukan judul proyek, target output, tenggat waktu, lokasi, anggaran belanja, gaya estetika, dan slot peran yang dibutuhkan (*Role Slots*).
- **Role Slots Dinamis**: Mendefinisikan peran seperti *Fashion Stylist*, *Editorial Model*, atau *Videographer* beserta kategori aset yang wajib disertakan pelamar.
- **Production Call Sheet Generator**: Secara otomatis menyusun lembar panggilan produksi profesional yang merinci:
  - Hari & Tanggal Sesi.
  - Lokasi Utama & Titik Temu Tim.
  - Rundown Jadwal Menit-ke-Menit (Panggilan MUA, Wardrobe Fitting, Sesi Foto Look 1–15, Istirahat Kru, Wrap Time).
  - Kontak Darurat & Penanggung Jawab Lapangan.

---

### 5.5 Smart Crew Matching Engine (Algoritma Penjodohan Kru)
Komponen `SmartCrewPanel.tsx` menjalankan algoritma pencocokan cerdas ketika seorang kreator membuka halaman detail brief proyek:
- **Kategori Aset Cocok (+50 Poin)**: Memeriksa apakah kandidat memiliki aset aktif yang terdaftar di basis data sesuai kebutuhan slot (misal: memiliki kamera resolusi tinggi untuk slot fotografer).
- **Kesesuaian Estetika (+20 Poin)**: Memeriksa irisan tag estetika antara brief dan profil kreator (misal: *Avant-Garde High-Fashion*).
- **Kedekatan Lokasi (+15 Poin)**: Memeriksa kesamaan kota domisili atau kesiapan kerja remote.
- **Kesesuaian Model Kompensasi (+15 Poin)**: Menyelaraskan skema tarif yang disepakati.
- **Tingkat Skor Kesesuaian**:
  - `Tier Hijau (85 - 100)`: *Sangat Kompatibel (Top Match)*.
  - `Tier Kuning (65 - 84)`: *Potensial (Good Fit)*.
  - `Tier Abu-abu (< 65)`: *Eksplorasi Tambahan*.
- **Undangan Instan 1-Klik**: Inisiator dapat langsung menekan tombol **"Undang Bergabung"** yang secara otomatis mengirimkan notifikasi dan pesan penawaran resmi kepada talenta bersangkutan.

---

### 5.6 Sistem Booking Langsung & Manajemen Negosiasi
Melalui `/dashboard/bookings` dan tombol **"Booking"** di direktori:
- Klien atau Brand dapat memilih paket jasa talenta, menentukan tanggal sewa/pemotretan, dan mengirimkan draf rincian pekerjaan.
- **Lifecycle Status Booking**:
  - `PENDING`: Menunggu tinjauan kreator tujuan.
  - `NEGOTIATING`: Para pihak sedang mengajukan penyesuaian harga atau jadwal (*Counter-Offer*).
  - `ACCEPTED`: Booking disetujui resmi dan siap diintegrasikan ke jadwal kerja.
  - `DECLINED`: Permintaan ditolak disertai alasan tertulis yang sopan.

---

### 5.7 In-App Messenger Transaksional & Interactive Widgets
Halaman `/messages` bukan sekadar ruang obrolan teks biasa. Dilengkapi arsitektur pesan kaya (*Rich Transactional Message Types*):
1. **Pesan Teks (`TEXT`)**: Komunikasi kasual dengan dukungan format waktu dan status baca (*read receipt*).
2. **Kartu Penawaran Resmi (`OFFER`)**: Menampilkan ringkasan proyek, nilai nominal Rupiah, tanggal sesi, dan rincian hak cipta. Penerima dapat langsung menekan tombol **"Terima Tawaran"** atau **"Ajukan Negosiasi Ulang"** langsung dari dalam gelembung obrolan.
3. **Kartu Serah Terima File (`DELIVERY`)**: Kreator mengirimkan tautan draf hasil kerja (Google Drive / Dropbox) dengan preview watermark, mencantumkan jumlah sisa kuota revisi, dan tombol konfirmasi persetujuan dari klien.
4. **Peringatan Mediasi Sengketa**: Jika terjadi kebuntuan revisi, salah satu pihak dapat mengaktifkan fitur *Mediation Alert* untuk meminta peninjauan pihak ketiga platform.
5. **Pesan Sistem Audit Trail (`SYSTEM`)**: Mencatat secara otomatis setiap kali status penawaran diterima, SPK ditandatangani, atau pembayaran disetorkan.

---

### 5.8 Pusat Notifikasi Real-Time
Komponen `NotificationBell.tsx` di header navigasi menyajikan:
- Lencana penghitung notifikasi belum dibaca (*Unread Counter Badge*).
- Panel melayang (*Dropdown Panel*) yang mengelompokkan notifikasi ke dalam jenis:
  - `BOOKING`: Permintaan booking masuk atau pembaruan negosiasi.
  - `INVITATION`: Undangan bergabung ke dalam slot brief proyek baru.
  - `MESSAGE`: Pesan baru di obrolan in-app.
  - `SPK_SIGN`: Notifikasi bahwa salah satu mitra telah menandatangani SPK kolaborasi.
- Tombol aksi cepat: **"Tandai Sudah Dibaca"** dan tautan pintas ke halaman terkait.

---

### 5.9 Collaboration Agreement Generator Multi-Pihak (Standar Industri Kreatif)
Komponen `MultiPartySpkModal.tsx` di `/collaborations/[id]` berfungsi sebagai **Collaboration Agreement Generator** yang menyusun draf kesepakatan kerja sama kolaborasi multi-pihak secara terstruktur berdasarkan parameter yang disetujui di ruang kerja:

> **Catatan Platform:** Draf kesepakatan ini disusun secara otomatis berdasarkan parameter kerja sama yang disetujui bersama para pihak. Dokumen ini disarankan untuk ditinjau dan disesuaikan oleh pihak yang berkompeten sebelum digunakan sebagai instrumen hukum formal.

#### Klausul Standar yang Dihasilkan:
- **Pasal 1 (Ruang Lingkup & Tujuan)**: Menegaskan peran spesifik masing-masing pihak dan sasaran deliverables.
- **Pasal 2 (Anggaran, Skema Biaya, dan Termin Pembayaran 50:50)**:
  - **Termin I (DP 50%)**: Dibayarkan di muka untuk mengunci sewa studio, talenta, dan operasional.
  - **Termin II (Pelunasan 50%)**: Dilunasi setelah draf hasil kerja (watermark) disetujui sebelum penyerahan master file resolusi penuh.
- **Pasal 3 (Bagi Hasil & Co-Branding)**: Ketentuan proporsional distribusi pendapatan bersih hasil penjualan produk/koleksi kapsul.
- **Pasal 4 (Hak Cipta, Hak Pakai & Batas Revisi)**:
  - Karya turunan berstatus hak pakai bersama non-eksklusif untuk promosi portofolio digital & media sosial organik selama 1 (satu) tahun.
  - Penggunaan komersial luar ruang / iklan berbayar (Meta/TikTok Ads, Billboard) **wajib memperoleh persetujuan tertulis dan kompensasi tambahan**.
  - **Batas Revisi Pasca-Produksi**: Dibatasi maksimal **2x (dua kali) putaran revisi minor** (penyelarasan warna, retouching, cropping). Perubahan konsep dasar memerlukan adendum baru.
- **Pasal 5 (Klausul Pengaturan Pelatihan AI — Optional Usage Rights)**:
  - Pembatasan bahwa karya tidak diizinkan untuk digunakan sebagai bahan pelatihan model kecerdasan buatan (*generative AI training*) tanpa izin tertulis para pihak.
- **Pasal 6 (Kewajiban Pencantuman Kredit / Co-Crediting)**: Wajib menyertakan nama dan peran seluruh kreator saat mempublikasikan hasil karya di media sosial atau media massa.
- **Pasal 7 (Pengunduran Diri & Penggantian Peran)**: Prosedur tertulis minimal 14 hari sebelum hari produksi.
- **Pasal 8 (Keadaan Memaksa / Force Majeure)**: Ketentuan penundaan tanpa denda jika terjadi musibah tak terduga.
- **Pasal 9 (Musyawarah & Mediasi)**: Penyelesaian sengketa berbasis musyawarah kekeluargaan dengan mengacu pada rekam jejak digital platform.

#### Fitur Interaktif Dokumen SPK:
- **Kanvas Tanda Tangan Digital Interaktif**: Setiap kreator dapat menandatangani dokumen langsung menggunakan kursor mouse atau layar sentuh.
- **Audit Log TTD**: Waktu dan stempel tanggal penandatanganan dicatat dalam format `WIB` (Waktu Indonesia Barat) ke basis data.
- **Ekspor Dokumen**: Cetak langsung ke format PDF standar surat perjanjian atau bagikan rangkuman pasal via WhatsApp.

---

### 5.10 Showcase Portofolio & Interactive Tear Sheet (Proof-of-Craft)
Halaman `/showcase` menyajikan portofolio visual bermutu tinggi dengan kapabilitas inspeksi teknis mendalam (*Tear Sheet Viewer*):
- **Hotspot Pins Interaktif**: Titik-titik interaktif yang disematkan langsung di atas foto karya untuk menunjukkan detail busana desainer yang dikenakan, teknik tata rias, atau tata cahaya yang digunakan.
- **Spesifikasi Kamera & Pencahayaan Nyata**: Menampilkan data teknis bodi kamera (misal: *Hasselblad 907X*, *Sony A7R V*), lensa yang dipakai (*FE 85mm f/1.4 GM*), dan skema lighting (*Profoto B10X + 120cm Octabox*).
- **Rincian Tim Kreator (Full Crew Breakdown)**: Mencantumkan kredit fotografer, desainer pakaian, penata rias (MUA), model muse, dan studio seni yang terlibat.
- **Generator Kartu Kredit Sosial (Social Credit Card Generator)**: Memungkinkan kreator mengunduh atau menyalin kartu apresiasi tim bergaya editorial untuk diunggah ke Instagram Story / LinkedIn.

---

### 5.11 Readiness Hub & Metrik Kesiapan Kolaborasi
Di `/readiness`, sistem menghitung skor kesiapan ekosistem setiap kreator:
- **Kelengkapan Profil & Portofolio**: Memeriksa keberadaan foto profil, biografi, tautan media sosial, dan karya terunggah.
- **Kesiapan Tarif Komersial**: Memeriksa apakah tarif harian, ketentuan DP, dan hak pakai lisensi sudah dikonfigurasi.
- **Kesiapan Legal**: Memeriksa apakah kreator telah memverifikasi identitas dan memiliki kesiapan penandatanganan SPK digital.

---

## 6. Arsitektur Data & Model Database (Prisma & SQL Raw)

### Diagram Relasi Entitas Utama (ERD Ringkas):

```text
┌──────────────┐       1:M       ┌──────────────┐
│   Profile    │ ─────────────── │    Actor     │
└──────────────┘                 └──────┬───────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           │ 1:M                        │ 1:M                        │ 1:M
    ┌──────▼──────┐              ┌──────▼──────┐              ┌──────▼──────┐
    │    Asset    │              │    Goal     │              │    Need     │
    └─────────────┘              └─────────────┘              └─────────────┘
           │                            │                            │
           └──────────────────┬─────────┴────────────────────────────┘
                              │ Terhubung melalui Evaluasi Engine
                       ┌──────▼──────┐
                       │ Opportunity │
                       └──────┬──────┘
                              │ 1:1 / 1:M
                     ┌────────▼──────────┐
                     │ CollaborationPlan │
                     └────────┬──────────┘
                              │ 1:1
                     ┌────────▼──────────┐
                     │   Collaboration   │
                     │ (Milestones, Task)│
                     └───────────────────┘
```

### Model-Model Penting pada `prisma/schema.prisma`:
1. **`Actor`**: Mewakili entitas kreator, studio, atau brand. Memiliki atribut status, tipe aktor, gaya estetika, tingkat pengalaman, dan model kompensasi.
2. **`Asset`**: Inventaris yang dimiliki aktor, mencakup kategori `PORTFOLIO_WORK`, `EQUIPMENT`, `STUDIO_SPACE`, `SKILL_TALENT`, `WARDROBE_PROP`, dan `AUDIENCE_REACH`.
3. **`ProjectBrief` & `ProjectBriefRole`**: Entitas penampung pengumuman proyek kolaborasi dan slot posisi spesifik yang dicari.
4. **`CollaborationInterest`**: Catatan lamaran atau undangan minat aktor terhadap slot peran pada project brief.
5. **`BookingRequest`**: Entitas pemesanan jadwal kerja langsung antar dua aktor beserta status negosiasinya.
6. **`Collaboration` & `CollaborationParticipant`**: Ruang kerja kolaborasi aktif tempat pencatatan milestone, penandatanganan SPK, dan pembagian tugas.
7. **`direct_messages` (Tabel SQL Teroptimasi)**: Menyimpan percakapan in-app berkecepatan tinggi dengan kolom tipe pesan (`TEXT`, `OFFER`, `DELIVERY`, `SYSTEM`), payload metadata JSONB, dan pengindeksan ganda.
8. **`notifications` (Tabel SQL Teroptimasi)**: Menyimpan catatan notifikasi real-time per aktor dengan penanda bacaan boolean dan pengurutan kronologis.

---

## 7. Daftar Server Actions & API Endpoints

Seluruh operasi mutasi data menggunakan **React Server Actions** untuk memastikan keamanan di sisi server dan integrasi seamless dengan Next.js App Router:

| Modul | Nama Server Action | Lokasi Berkas | Deskripsi Fungsional |
| :--- | :--- | :--- | :--- |
| **Projects** | `createProjectBriefAction` | `src/app/projects/actions.ts` | Membuat brief proyek baru beserta slot perannya. |
| **Projects** | `expressInterestAction` | `src/app/projects/actions.ts` | Mengajukan diri untuk mengisi slot peran pada brief. |
| **Projects** | `inviteActorToRoleAction` | `src/app/projects/actions.ts` | Mengundang kreator spesifik hasil rekomendasi Smart Crew. |
| **Projects** | `respondToInvitationAction`| `src/app/projects/actions.ts` | Menerima atau menolak undangan bergabung ke proyek. |
| **Projects** | `formCollaborationAction` | `src/app/projects/actions.ts` | Mengonversi brief yang kru-nya telah lengkap menjadi ruang kerja kolaborasi aktif. |
| **Messages** | `sendMessageAction` | `src/app/messages/actions.ts` | Mengirim pesan teks reguler antar aktor. |
| **Messages** | `sendProjectOfferAction` | `src/app/messages/actions.ts` | Mengirimkan kartu penawaran proyek interaktif ke dalam obrolan. |
| **Messages** | `respondToOfferAction` | `src/app/messages/actions.ts` | Menerima atau menolak penawaran proyek langsung dari chat. |
| **Messages** | `sendDeliveryAction` | `src/app/messages/actions.ts` | Mengirimkan tautan serah terima draf pekerjaan ber-watermark. |
| **Messages** | `respondToDeliveryAction` | `src/app/messages/actions.ts` | Klien menyetujui serah terima file atau meminta putaran revisi minor. |
| **Bookings** | `createBookingRequestAction`| `src/app/api/bookings/actions.ts`| Mengirimkan booking jadwal kerja langsung ke profil kreator. |
| **Bookings** | `updateBookingStatusAction` | `src/app/api/bookings/actions.ts`| Mengubah status booking (Accept, Decline, Negotiate). |
| **SPK Legal** | `signSpkAction` | `src/app/collaborations/actions.ts`| Membubuhkan tanda tangan digital pada SPK kolaborasi resmi. |
| **Settings** | `updateRatesAction` | `src/app/settings/actions.ts` | Memperbarui paket tarif, cakupan hak pakai lisensi, dan spesifikasi studio. |
| **Notifikasi** | `markNotificationReadAction`| `src/app/api/notifications/actions.ts`| Menandai satu notifikasi atau semua notifikasi telah dibaca. |

---

## 8. Panduan Instalasi, Setup Lingkungan & Seeding

### 1. Prasyarat Sistem:
- **Node.js**: Versi `18.18+` atau `20+` (Rekomendasi LTS)
- **NPM**: Versi `9+` atau `10+`
- **PostgreSQL**: Dapat menggunakan instance Supabase lokal maupun cloud

### 2. Kloning Repositori & Instalasi Dependensi:
```bash
# Clone repositori
git clone https://github.com/gilangggra/RAMU.git
cd RAMU

# Install seluruh dependensi
npm install
```

### 3. Konfigurasi Environment Variable (`.env`):
Buat berkas `.env` di direktori akar proyek dengan konfigurasi berikut:
```env
# Koneksi PostgreSQL (Supabase Connection Pooling & Direct URL)
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Kredensial Supabase Klien
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 4. Sinkronisasi Database & Seeding:
```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. Push skema ke database PostgreSQL
npm run db:push

# 3. Jalankan inisialisasi tabel SQL khusus (Messages & Notifications)
npx tsx prisma/init-messages-table.ts
npx tsx scripts/init-notifications-table.ts

# 4. Jalankan seeding skenario data bawaan (Golden Demo kreator, aset, dan obrolan)
npm run db:seed
npx tsx prisma/seed-demo-messages.ts
```

### 5. Menjalankan Server Pengembangan:
```bash
npm run dev
```
Buka peramban Anda di [http://localhost:3000](http://localhost:3000).

---

## 9. Akun Bawaan & Dataset Demo (Golden Demo Scenario)

Agar pengujian juri dan pengguna dapat langsung dilakukan tanpa harus memasukkan data secara manual dari nol, seluruh data telah dibersihkan dan disiapkan **tepat 1 akun Admin (`bernadya`)** dan **1 akun resmi per role (6 Peran)**:

| No | Peran / Aktor | Nama Akun | Email Login | Status / Kategori |
|---|---|---|---|---|
| **0** | **Platform Administrator** | `bernadya` | `bernadya@gmail.com` | **Admin Utama Platform RAMU** |
| **1** | **Fashion Brand/UMKM** | `Nala The Label` | `brand@ramu.id` | Aktor Brand / Penggagas Proyek |
| **2** | **Fashion Designer** | `Atelier Nara` | `designer@ramu.id` | Aktor Perancang Busana |
| **3** | **Photographer** | `Lensa Kreatif Studio` | `photographer@ramu.id` | Aktor Fotografer Komersial |
| **4** | **Model** | `Go Young Jung` | `model@ramu.id` | Aktor Model Editorial |
| **5** | **MUA/Stylist** | `Glow & Form Artistry` | `mua@ramu.id` | Aktor Makeup Artist & Stylist |
| **6** | **Studio** | `Studio Imaji & Co.` | `studio@ramu.id` | Aktor Fasilitas Studio & Cyclorama |

### Rincian Profil & Aset Siap Uji:

1. **Platform Administrator (`bernadya`)**:
   - Akun Super Admin untuk memonitor ekosistem, kelayakan kurasi, dan konfigurasi platform.
2. **Nala The Label (`Fashion Brand/UMKM`)**:
   - Brand fashion lokal kontemporer dengan aset material linen deadstock dan proyek aktif lookbook kampanye Musim Gugur.
3. **Atelier Nara (`Fashion Designer`)**:
   - Perancang busana avant-garde dan pattern maker independen dengan paket jasa desain koleksi kapsul & tech-pack.
4. **Lensa Kreatif Studio (`Photographer`)**:
   - Fotografer fashion komersial dengan paket full-day lookbook, kamera high-res, dan lighting kit komplit.
5. **Go Young Jung (`Model`)**:
   - Talenta model fesyen profesional spesialis katalog lookbook, runway, dan kampanye editorial.
6. **Glow & Form Artistry (`MUA/Stylist`)**:
   - Tim profesional MUA editorial dan penata gaya busana dengan paket styling lookbook dan riasan tahan lampu studio.
7. **Studio Imaji & Co. (`Studio`)**:
   - Fasilitas studio foto sewa daylight loft dengan cyclorama wall bersih, daya 16.500 Watt 3-phase, dan asisten standby.
8. **Simulasi Obrolan & Tawaran Proyek Aktif**:
   - Telah tersedia simulasi percakapan in-app antara `Nala The Label` dan `Go Young Jung` di menu `/messages` dengan kartu penawaran resmi (*Offer Card*) senilai Rp 1.800.000,- siap uji respon terima/tolak.

---

## 10. Roadmap & Potensi Pengembangan Lanjutan

1. **Integrasi Payment Gateway Lokal**:
   - Pembayaran tagihan invoice termin otomatis melalui Midtrans / Xendit (Virtual Account BCA/Mandiri, QRIS, Kartu Kredit) dengan rekonsiliasi status pembayaran otomatis.
2. **e-Meterai Peruri Otomatis**:
   - Pembubuhan materai elektronik resmi Republik Indonesia pada dokumen PDF SPK Multi-Pihak untuk kekuatan eksekutorial di pengadilan perdata.
3. **Perlindungan Watermark Dinamis & Enkripsi Aset**:
   - Penerapan stempel transparan nama klien secara otomatis pada foto review beresolusi sedang sebelum pelunasan dilakukan.
4. **Mobile Native Progressive Web App (PWA)**:
   - Dukungan notifikasi push ke perangkat seluler saat panggilan Call Sheet diterbitkan di lokasi syuting.

---

<div align="center">
  <p><strong>RAMU — Meramu Karya, Mengamankan Kolaborasi, Memajukan Industri Kreatif Indonesia.</strong></p>
  <p>© 2026 Tim Pengembang RAMU. Hak Cipta Dilindungi Undang-Undang.</p>
</div>
