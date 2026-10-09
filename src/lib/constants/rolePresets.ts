import { TermsAndConditionsConfig } from "@/components/settings/RatesForm";

export type PackageTier = "STARTER" | "CAMPAIGN" | "COMMERCIAL";

export interface ServicePackage {
  id?: string;
  tier?: PackageTier;
  title: string;
  subtitle: string;
  price: string;
  unit: string;
  // 4 Structured Scope Dimensions:
  capacityDuration?: string;    // Durasi/Kapasitas (e.g. "4 Jam (Setengah Hari)")
  deliverablesSummary?: string; // Deliverables Nyata (e.g. "15 Foto Final Retouch + Semua RAW")
  usageRights?: string;         // Lisensi Hak Siar (e.g. "Komersial Digital Sosmed & Web 6 Bulan")
  equipmentIncluded?: string;   // Gear/Fasilitas Terbawa (e.g. "Kamera Full-frame + Lighting Strobo Kit")
  collaborationCount?: number;  // Data-driven counter
  popular?: boolean;            // Backward compatibility
  features: string[];           // Rincian poin
}

/**
 * 5 PERAN RESMI AKTOR DI PLATFORM RAMU:
 * 1. Fashion Brand/UMKM
 * 2. Photographer
 * 3. Model
 * 4. MUA/Stylist
 * 5. Studio
 * Tidak boleh ada yang lain.
 */
export const ALLOWED_ACTOR_ROLES = [
  "Fashion Brand/UMKM",
  "Photographer",
  "Model",
  "MUA/Stylist",
  "Studio",
] as const;

export type AllowedActorRole = (typeof ALLOWED_ACTOR_ROLES)[number];

export type RoleCategory =
  | "BRAND"
  | "DESIGNER"
  | "PHOTOGRAPHER"
  | "MODEL"
  | "MUA_STYLIST"
  | "STUDIO"
  // Legacy aliases untuk kompatibilitas ke belakang
  | "MUA"
  | "STYLIST"
  | "VIDEOGRAPHER";

export interface RolePresetData {
  id: RoleCategory;
  name: string;
  roleBadge: string;
  defaultStartingRate: string;
  quickRates: string[];
  defaultTurnaround: string;
  quickTurnarounds: string[];
  commonUnits: string[];
  quickDeliverableSuggestions: string[];
  packages: ServicePackage[];
  defaultTerms: TermsAndConditionsConfig;
}

export const ROLE_PRESETS: Record<RoleCategory, RolePresetData> = {
  BRAND: {
    id: "BRAND",
    name: "Fashion Brand/UMKM",
    roleBadge: "Brand / UMKM",
    defaultStartingRate: "Sesuai Anggaran Brief",
    quickRates: [
      "Sesuai Anggaran Brief",
      "Sistem Bagi Hasil Produk",
      "Kompensasi Flat Fee",
      "Fee Komersial Berbayar Sesuai SPK",
    ],
    defaultTurnaround: "Sesuai Timeline Kampanye",
    quickTurnarounds: [
      "1 – 2 Minggu",
      "3 – 4 Minggu",
      "1 Bulan Kampanye",
      "Sesuai Kalender Musim",
    ],
    commonUnits: ["per proyek", "per kampanye", "per koleksi", "bagi hasil", "per bulan"],
    quickDeliverableSuggestions: [
      "Penyediaan Sampel Busana / Outfit",
      "Dokumen Brief & Moodboard Resmi",
      "Distribusi Promosi Omnichannel",
      "Pemberian Co-Credit Seluruh Kru",
      "Pembayaran Termin DP 50%",
      "Listing Produk di E-Commerce",
      "Akses Display Toko / Flagship",
    ],
    packages: [
      {
        tier: "STARTER",
        title: "Katalog & E-Commerce Listing",
        subtitle: "Sesi foto katalog produk bersih untuk peluncuran marketplace & webstore",
        price: "Sesuai Brief",
        unit: "per katalog",
        capacityDuration: "1 – 2 Hari Sesi",
        deliverablesSummary: "Penyediaan 10 sampel busana bersih & terstandar",
        usageRights: "Komersial Digital (Webstore & Marketplace)",
        equipmentIncluded: "Garmen sampel siap pakai + Hanger khusus",
        features: [
          "Foto produk packshot & on-model terstandar",
          "Penyediaan garmen rapi & siap dipotret",
          "Penggunaan hak tayang komersial digital",
        ],
      },
      {
        tier: "CAMPAIGN",
        title: "Kolaborasi Kampanye Lookbook",
        subtitle: "Penyediaan sampel busana & pendanaan produksi lookbook koleksi baru",
        price: "Sesuai Brief",
        unit: "per kampanye",
        capacityDuration: "2 – 4 Minggu Timeline",
        deliverablesSummary: "10-15 Look Busana Sampel + Alokasi Dana Produksi",
        usageRights: "Komersial Digital & Sosial Media 1 Tahun",
        equipmentIncluded: "Wardrobe set lengkap + Akomodasi pengiriman",
        popular: true,
        features: [
          "Penyediaan 10-15 look busana sampel siap fitting",
          "Pembagian biaya produksi terstruktur (DP 50% di awal)",
          "Pencantuman kredit resmi seluruh tim di lookbook & media sosial",
          "Distribusi konten promosi di kanal resmi brand",
        ],
      },
      {
        tier: "COMMERCIAL",
        title: "Co-Branding Koleksi Kapsul",
        subtitle: "Kemitraan pembuatan lini produk eksklusif edisi terbatas dengan sistem bagi hasil",
        price: "Bagi Hasil",
        unit: "per koleksi",
        capacityDuration: "1 Musim Rilis (3 Bulan)",
        deliverablesSummary: "Produksi Batch Lini Busana Bersama Mitra",
        usageRights: "Hak Komersial Eksklusif Multi-Kanal",
        equipmentIncluded: "Jaringan Distribusi Retail & E-Commerce Resmi",
        features: [
          "Pengembangan konsep koleksi bersama mitra & kolaborator",
          "Distribusi retail & penjualan di platform resmi brand",
          "Bagi hasil transparan dari penjualan bersih",
          "Hak cipta & kredit bersama diakui dalam SPK",
        ],
      },
    ],
    defaultTerms: {
      dpPercentage: 50,
      maxRevisions: 2,
      shiftHours: 8,
      overtimeRate: "Rp 200.000 / jam",
      gracePeriodMinutes: 30,
      safeSetCompliant: true,
      usageRightsScope: "ORGANIC_SOCIAL",
      usageRightsDuration: "1_YEAR",
      extraRevisionFee: "Rp 150.000 / revisi",
      paymentMilestoneScheme: "50_50_WATERMARK",
      roleSpecifics: {
        brandCreditRequired: true,
      },
    },
  },

  DESIGNER: {
    id: "DESIGNER",
    name: "Fashion Designer",
    roleBadge: "Fashion Designer",
    defaultStartingRate: "Mulai Rp 2,5 Jt / koleksi",
    quickRates: [
      "Mulai Rp 1,5 Jt / desain",
      "Mulai Rp 2,5 Jt / koleksi",
      "Mulai Rp 4,0 Jt / proyek",
      "Mulai Rp 500rb / sketsa",
    ],
    defaultTurnaround: "7 – 14 Hari Kerja",
    quickTurnarounds: [
      "3 – 5 Hari Kerja",
      "7 – 14 Hari Kerja",
      "14 – 21 Hari Kerja",
      "Sesuai Timeline Batch",
    ],
    commonUnits: ["per proyek", "per koleksi", "per desain", "per sesi", "per batch"],
    quickDeliverableSuggestions: [
      "Moodboard & Tren Visual Riset",
      "5-8 Sketsa Desain 2D Digital",
      "Lembar Spesifikasi Teknis (Tech-Pack)",
      "Pembuatan Pola (Pattern Making)",
      "Prototipe Sampel Fisik (Toille)",
      "Desain Packaging & Hangtag",
      "Panduan Identitas Brand Kit",
      "Gratis 2x Revisi Desain",
    ],
    packages: [
      {
        tier: "STARTER",
        title: "Identitas Visual & Sketsa Konsep",
        subtitle: "Panduan visual brand busana dan sketsa konsep untuk rilis baru",
        price: "Rp 1.500.000",
        unit: "per proyek",
        capacityDuration: "5 – 7 Hari Kerja",
        deliverablesSummary: "Moodboard Konsep + 5 Sketsa Desain 2D",
        usageRights: "Hak Pakai Konsep Digital & Internal Brand",
        equipmentIncluded: "Aset vektor master file (AI, PDF) + Color Palette",
        features: [
          "Panduan logo, tipografi, dan palet warna busana",
          "Template visual lookbook & feed media sosial",
          "Aset vektor master file (AI, EPS, PDF, SVG)",
          "Gratis 2x revisi desain visual",
        ],
      },
      {
        tier: "CAMPAIGN",
        title: "Desain Koleksi Busana & Tech-Pack",
        subtitle: "Pengembangan konsep busana siap jahit dan spesifikasi garmen pabrik",
        price: "Rp 3.500.000",
        unit: "per koleksi",
        capacityDuration: "10 – 14 Hari Kerja",
        deliverablesSummary: "Tech-Pack Lengkap 6-8 Outfit + Rekomendasi Kain",
        usageRights: "Lisensi Produksi Koleksi Musiman",
        equipmentIncluded: "Spesifikasi Fabrikasi + Panduan Jahit Garmen",
        popular: true,
        features: [
          "Riset tren & moodboard konsep koleksi (5-8 outfit)",
          "Sketsa desain digital 2D (tampak depan & belakang)",
          "Lembar spesifikasi teknis (tech-pack) lengkap ukuran & bahan",
          "Rekomendasi jenis kain, gramasi, & aksesoris kancing/zipper",
          "Gratis 2x putaran revisi teknis",
        ],
      },
      {
        tier: "COMMERCIAL",
        title: "Pembuatan Pola & Sampel Fisik (Toille)",
        subtitle: "Pengerjaan prototipe fisik busana pertama siap fitting bersama model",
        price: "Rp 5.500.000",
        unit: "per koleksi",
        capacityDuration: "14 – 21 Hari Kerja",
        deliverablesSummary: "Pola Presisi Butik + Sampel Fisik Siap Fitting",
        usageRights: "Hak Cipta Desain Penuh (Commercial Buyout)",
        equipmentIncluded: "1x Sesi Fitting Langsung Model On-Set",
        features: [
          "Pembuatan pola presisi (pattern making) ukuran standar",
          "Pengerjaan sampel fisik busana (toille mock-up)",
          "1x Sesi fitting langsung bersama model & revisi ukuran",
          "Standar jahitan rapi kualitas butik/atelier",
          "Hak kekayaan intelektual desain diserahkan penuh ke klien",
        ],
      },
    ],
    defaultTerms: {
      dpPercentage: 50,
      maxRevisions: 2,
      shiftHours: 8,
      overtimeRate: "Rp 200.000 / jam",
      gracePeriodMinutes: 30,
      safeSetCompliant: true,
      usageRightsScope: "ORGANIC_SOCIAL",
      usageRightsDuration: "PERPETUAL",
      extraRevisionFee: "Rp 250.000 / putaran revisi ekstra",
      paymentMilestoneScheme: "50_50_WATERMARK",
      roleSpecifics: {
        fittingPolicy: "Fitting busana dilakukan H-1 atau di lokasi sebelum sesi dimulai",
        dryCleaningResponsibility: "Biaya laundry / dry cleaning busana pasca-sesi ditanggung oleh klien/peminjam",
        noAlteringPolicy: "Dilarang memotong, mengubah jahitan, atau merusak siluet busana tanpa izin tertulis pemilik brand/wardrobe",
        brandCreditRequired: true,
      },
    },
  },

  PHOTOGRAPHER: {
    id: "PHOTOGRAPHER",
    name: "Photographer",
    roleBadge: "Fotografi",
    defaultStartingRate: "Mulai Rp 1,5 Jt / sesi",
    quickRates: [
      "Mulai Rp 1,2 Jt / sesi",
      "Mulai Rp 1,5 Jt / sesi",
      "Mulai Rp 2,5 Jt / hari",
      "Mulai Rp 100rb / foto",
    ],
    defaultTurnaround: "3 – 5 Hari Kerja",
    quickTurnarounds: [
      "1 – 2 Hari (Kilat)",
      "3 – 5 Hari Kerja",
      "5 – 7 Hari Kerja",
      "Selesai On-Set",
    ],
    commonUnits: ["per sesi", "per 4 jam", "per 8 jam", "per proyek", "per look", "per foto"],
    quickDeliverableSuggestions: [
      "15 Foto Retouch High-Res",
      "30 Foto Retouch High-Res",
      "Semua File RAW/Preview Drive H+1",
      "Lighting Kit & Modifier On-Set",
      "Tethering Monitor On-Set",
      "Color Grading Sesuai Moodboard",
      "Gratis 2x Revisi Minor",
      "Hak Siar Medsos & Web 1 Tahun",
    ],
    packages: [
      {
        tier: "STARTER",
        title: "Lookbook Half-Day (Starter)",
        subtitle: "Sesi foto lookbook esensial untuk emerging brand & katalog awal",
        price: "Rp 1.500.000",
        unit: "per 4 jam",
        capacityDuration: "4 Jam (Setengah Shift)",
        deliverablesSummary: "15 Foto Final Retouch High-Res + Semua RAW H+1",
        usageRights: "Komersial Digital (Sosmed & Web) 6 Bulan",
        equipmentIncluded: "1 Kamera Sony A7IV + 2 Lensa Prime/Zoom + 1 Strobo Kit",
        features: [
          "1 Kamera profesional + Lensa prime/zoom",
          "15 Foto final retouch resolusi tinggi",
          "Semua file preview H+1 via Google Drive",
          "Color grading konsisten standar lookbook",
          "Delivery hasil akhir 3-4 hari kerja",
        ],
      },
      {
        tier: "CAMPAIGN",
        title: "Kampanye Lookbook Penuh (Campaign)",
        subtitle: "Produksi visual lookbook komprehensif untuk peluncuran utama koleksi busana",
        price: "Rp 2.800.000",
        unit: "per 8 jam",
        capacityDuration: "8 Jam (Full-Day Shift)",
        deliverablesSummary: "35 Foto Final Retouch Komersial Majalah + Tethering On-Set",
        usageRights: "Komersial Digital & Cetak 1 Tahun",
        equipmentIncluded: "2 Kamera Pro + Full Studio Strobe Kit (Profoto/Godox)",
        popular: true,
        features: [
          "2 Kamera profesional + Full lighting kit bawaan",
          "35 Foto final retouch resolusi tinggi majalah",
          "Sesi tethering on-set langsung ke laptop",
          "Color grading custom sesuai DNA brand Anda",
          "Gratis 2x revisi minor",
          "Lisensi komersial digital & media sosial 1 tahun",
        ],
      },
      {
        tier: "COMMERCIAL",
        title: "Produksi Visual Komersial & Video Teaser",
        subtitle: "Produksi visual komersial multi-channel foto dan video teaser media sosial",
        price: "Rp 4.500.000",
        unit: "per proyek",
        capacityDuration: "10 – 12 Jam / 2 Sesi",
        deliverablesSummary: "50 Foto Retouch Majalah + 2 Video Reels 4K Sinematik",
        usageRights: "Komersial Multi-Kanal (OOH Billboard & Paid Ads) 2 Tahun",
        equipmentIncluded: "Setup Multi-Cam + Continuous Lighting Kit + Gimbal",
        features: [
          "Background putih / seamless & creative set lighting",
          "50 Foto final retouch kualitas billboard & lookbook",
          "2 Video Reels / TikTok sinematik durasi 30-45 detik",
          "Batch color matching akurat dengan warna kain asli",
          "Lisensi komersial penuh multi-channel",
        ],
      },
    ],
    defaultTerms: {
      dpPercentage: 50,
      maxRevisions: 2,
      shiftHours: 8,
      overtimeRate: "Rp 250.000 / jam",
      gracePeriodMinutes: 30,
      safeSetCompliant: true,
      usageRightsScope: "ORGANIC_SOCIAL",
      usageRightsDuration: "1_YEAR",
      extraRevisionFee: "Rp 100.000 / foto tambahan",
      paymentMilestoneScheme: "50_50_WATERMARK",
      roleSpecifics: {
        colorAccuracyCommitment: true,
        rawFilePolicy: "File JPG resolusi tinggi (High-Res); RAW tidak diserahkan",
      },
    },
  },

  MODEL: {
    id: "MODEL",
    name: "Model",
    roleBadge: "Model & Talent",
    defaultStartingRate: "Mulai Rp 1,0 Jt / sesi",
    quickRates: [
      "Mulai Rp 800rb / sesi",
      "Mulai Rp 1,0 Jt / sesi",
      "Mulai Rp 1,8 Jt / hari",
      "Mulai Rp 100rb / look",
    ],
    defaultTurnaround: "Selesai Sesi Pemotretan",
    quickTurnarounds: [
      "Selesai Sesi Pemotretan",
      "Hari yang Sama (On-Set)",
      "Konfirmasi Jadwal H-2",
    ],
    commonUnits: ["per sesi (3-4 jam)", "per 8 jam (full-day)", "per look", "per proyek"],
    quickDeliverableSuggestions: [
      "Maksimal 15 Look Busana",
      "Unlimited Look dalam Shift",
      "Pose Katalog Bersih & Komersial",
      "Konsep Editorial Avant-Garde",
      "Termasuk Fitting Pra-Produksi",
      "Hak Tayang Medsos 1 Tahun",
      "Kolaborasi Tag Feeds & Story",
    ],
    packages: [
      {
        tier: "STARTER",
        title: "Katalog & E-Commerce (Starter)",
        subtitle: "Foto produk katalog marketplace & webstore brand",
        price: "Rp 1.000.000",
        unit: "per 4 jam",
        capacityDuration: "4 Jam (Setengah Hari)",
        deliverablesSummary: "Maksimal 12-15 Look Busana Katalog Bersih",
        usageRights: "Komersial Marketplace & Webstore 6 Bulan",
        equipmentIncluded: "Standby fitting 30 menit pra-sesi pemotretan",
        features: [
          "Maksimal 12-15 look busana siap pakai",
          "Pose katalog rapi, proporsional & konsisten",
          "Termasuk fitting 30 menit sebelum sesi dimulai",
          "Hak tayang foto untuk marketplace & webstore 1 tahun",
        ],
      },
      {
        tier: "CAMPAIGN",
        title: "Editorial Lookbook & Campaign",
        subtitle: "Pemodelan kampanye rilis busana dengan eksplorasi gaya dinamis",
        price: "Rp 1.800.000",
        unit: "per 8 jam",
        capacityDuration: "8 Jam (Full-Day Shift)",
        deliverablesSummary: "Unlimited Look dalam Shift + Pose Dramatis Editorial",
        usageRights: "Komersial Media Sosial, Web & PR 1 Tahun",
        equipmentIncluded: "1x Fitting Pra-Produksi Terpisah + Kolaborasi Feeds",
        popular: true,
        features: [
          "Eksplorasi pose editorial & ekspresi dramatis sesuai moodboard",
          "Termasuk 1x fitting pra-produksi terpisah",
          "Standby on-set penuh hingga 8 jam",
          "Hak guna media sosial, website, & press release 1 tahun",
          "Dukungan posting kolaborasi Instagram/TikTok feeds",
        ],
      },
      {
        tier: "COMMERCIAL",
        title: "Video TVC & Brand Ambassador",
        subtitle: "Iklan komersial video sinematik, billboard, atau digital ads",
        price: "Rp 3.500.000",
        unit: "per proyek",
        capacityDuration: "12 Jam / Multi-Day Sesi",
        deliverablesSummary: "Akting Video TVC + Sesi Foto Komersial Utama",
        usageRights: "Hak Siar Komersial Multi-Channel (Ads & Billboard) 1 Tahun",
        equipmentIncluded: "Eksklusivitas Kategori Busana Musiman + 1 Post Endorsement",
        features: [
          "Video acting & dialog / voiceover",
          "Hak guna komersial multi-channel (Ads & Billboard)",
          "1x Post feed & 2x Story endorsement di akun talent",
          "Kontrak eksklusivitas kategori busana",
        ],
      },
    ],
    defaultTerms: {
      dpPercentage: 50,
      maxRevisions: 1,
      shiftHours: 4,
      overtimeRate: "Rp 200.000 / jam",
      gracePeriodMinutes: 30,
      safeSetCompliant: true,
      usageRightsScope: "ORGANIC_SOCIAL",
      usageRightsDuration: "1_YEAR",
      extraRevisionFee: "Rp 100.000 / look tambahan",
      paymentMilestoneScheme: "50_50_WATERMARK",
      roleSpecifics: {
        wardrobeRestrictions: "Casual, Formal, Modest / Hijab (Sesuai Moodboard Awal)",
        chaperoneAllowed: true,
        usageRightsPeriod: "1 Tahun Digital Media (Medsos & Website)",
      },
    },
  },

  MUA_STYLIST: {
    id: "MUA_STYLIST",
    name: "MUA/Stylist",
    roleBadge: "MUA / Stylist",
    defaultStartingRate: "Mulai Rp 800rb / sesi",
    quickRates: [
      "Mulai Rp 650rb / look",
      "Mulai Rp 800rb / sesi",
      "Mulai Rp 1,4 Jt / half-day",
      "Mulai Rp 2,2 Jt / full-day",
    ],
    defaultTurnaround: "Selesai On-Set Hari-H",
    quickTurnarounds: [
      "Selesai On-Set Hari-H",
      "Standby Sesuai Durasi Jadwal",
      "Pra-Produksi + Hari-H",
    ],
    commonUnits: ["per look", "per 4 jam (half-day)", "per 8 jam (standby)", "per model", "per proyek"],
    quickDeliverableSuggestions: [
      "Complexion HD Tahan 12 Jam",
      "Hair Styling & Hijab Do Rapi",
      "Kurasi 8-15 Look Wardrobe Lengkap",
      "Standby Touch-Up On-Set",
      "Peminjaman Aksesoris & Fitting Kit",
      "Garment Steamer & Penjagaan Siluet Busana",
      "Kosmetik High-End & Hypoallergenic",
    ],
    packages: [
      {
        tier: "STARTER",
        title: "Single Look & Makeup Express (Starter)",
        subtitle: "Riasan natural HD dan penataan rambut untuk sesi katalog ringkas 1 model",
        price: "Rp 800.000",
        unit: "per 4 jam",
        capacityDuration: "4 Jam (Setengah Shift)",
        deliverablesSummary: "1-2 Model Katalog + Touch-up Standby On-Set",
        usageRights: "Komersial Digital (Webstore & Media Sosial) 1 Tahun",
        equipmentIncluded: "Kosmetik High-End Hypoallergenic + Basic Hair Kit",
        features: [
          "1 Model katalog atau lookbook ringkas",
          "Makeup HD natural glow tahan lampu studio",
          "Basic hair styling atau hijab do rapi",
          "Pemasangan bulu mata premium",
          "Standby touch-up aktif selama sesi",
        ],
      },
      {
        tier: "CAMPAIGN",
        title: "Lookbook Styling & Makeup Direction (Campaign)",
        subtitle: "Padu padan outfit dan pengarahan tata rias penuh kampanye peluncuran busana",
        price: "Rp 1.800.000",
        unit: "per 8 jam",
        capacityDuration: "8 Jam (Full-Day Shift)",
        deliverablesSummary: "Kurasi 10-15 Look Head-to-Toe + 2-3 Variasi Riasan",
        usageRights: "Komersial Digital & Cetak Majalah 1 Tahun",
        equipmentIncluded: "Garment Steamer + Fitting Kit + Aksesoris Tambahan",
        popular: true,
        features: [
          "Kurasi hingga 15 look busana siap pakai",
          "Makeup HD tahan lampu studio & keringat",
          "Hair styling atau hijab do variatif sesuai tema",
          "Disediakan garment steamer & perlengkapan fitting on-set",
          "Standby touch-up aktif selama 8 jam kerja",
        ],
      },
      {
        tier: "COMMERCIAL",
        title: "Editorial Avant-Garde & High Fashion (Commercial)",
        subtitle: "Pengarahan gaya komprehensif editorial avant-garde untuk kampanye besar",
        price: "Rp 3.200.000",
        unit: "per proyek",
        capacityDuration: "Sesi Penuh + Riset Konsep",
        deliverablesSummary: "Konsep Riasan Eksperimental + Custom Wardrobe Styling",
        usageRights: "Hak Cipta Publikasi Komersial Penuh (Multi-Channel)",
        equipmentIncluded: "Custom Props Styling + Makeup SFX/Prostetik Halus",
        features: [
          "Moodboard konsep styling & palet makeup selaras DNA brand",
          "Kurasi 15-20 look head-to-toe lengkap",
          "Pergantian variasi makeup & hairdo dramatis",
          "Peminjaman aksesoris pendukung esensial",
          "Standby penuh di set indoor maupun outdoor",
        ],
      },
    ],
    defaultTerms: {
      dpPercentage: 50,
      maxRevisions: 2,
      shiftHours: 8,
      overtimeRate: "Rp 200.000 / jam",
      gracePeriodMinutes: 30,
      safeSetCompliant: true,
      usageRightsScope: "ORGANIC_SOCIAL",
      usageRightsDuration: "1_YEAR",
      extraRevisionFee: "Rp 200.000 / jam tambahan",
      paymentMilestoneScheme: "50_50_WATERMARK",
      roleSpecifics: {
        maxHeadsIncluded: 1,
        prepTimeRequired: "90 Menit sebelum sesi foto dimulai",
        extraHeadFee: "Rp 350.000 / orang tambahan",
      },
    },
  },

  STUDIO: {
    id: "STUDIO",
    name: "Studio",
    roleBadge: "Studio",
    defaultStartingRate: "Mulai Rp 200rb / jam (Shift Rp 750rb)",
    quickRates: [
      "Mulai Rp 150rb / jam",
      "Mulai Rp 200rb / jam",
      "Mulai Rp 750rb / shift (4 jam)",
      "Mulai Rp 1,4 Jt / hari (8 jam)",
    ],
    defaultTurnaround: "Instan / Slot Booking",
    quickTurnarounds: [
      "Instan / Slot Booking",
      "Konfirmasi H-1",
      "Sesuai Kalender Ketersediaan",
    ],
    commonUnits: ["per 4 jam", "per 8 jam", "per 12 jam", "per jam", "per shift"],
    quickDeliverableSuggestions: [
      "Akses Cyclorama Wall Bersih",
      "Daya Listrik 16.500 Watt (3-Phase)",
      "Ruang Makeup & Fitting Ber-AC",
      "Background Seamless Bebas Pilih",
      "High-Speed Wi-Fi & Bluetooth Speaker",
      "1 Asisten Studio Siap Membantu",
      "Free Parking Kru & Loading Mudah",
    ],
    packages: [
      {
        tier: "STARTER",
        title: "Shift Setengah Hari (Starter)",
        subtitle: "Sesi foto katalog, podcast, atau lookbook ringkas",
        price: "Rp 750.000",
        unit: "per 4 jam",
        capacityDuration: "4 Jam (Setengah Shift)",
        deliverablesSummary: "Akses Area Cyclorama Wall + Ruang Rias Ber-AC",
        usageRights: "Bebas Hak Tayang Komersial (Perpetual / Selamanya)",
        equipmentIncluded: "Daya Listrik 16.500W (3-Phase) + 1 Asisten Studio Standby",
        features: [
          "Akses area cyclorama wall & ruang makeup ber-AC",
          "Daya listrik 16.500 Watt (3-Phase)",
          "AC dingin & koneksi Wi-Fi kencang",
          "1 Asisten studio standby di lokasi",
        ],
      },
      {
        tier: "CAMPAIGN",
        title: "Shift Penuh Lookbook (Campaign)",
        subtitle: "Pilihan utama untuk campaign lookbook & video komersial brand",
        price: "Rp 1.400.000",
        unit: "per 8 jam",
        capacityDuration: "8 Jam (Full-Day Shift)",
        deliverablesSummary: "Akses Seluruh Area Studio + Fitting Room VIP + Setup Lighting",
        usageRights: "Bebas Hak Tayang Komersial (Perpetual / Selamanya)",
        equipmentIncluded: "2 Asisten Standby + Bebas Ganti Seamless Background",
        popular: true,
        features: [
          "Akses penuh seluruh area studio & fitting room",
          "Bebas ganti setup lighting & background seamless",
          "Free parking kru & loading barang mudah",
          "Termasuk 1 jam persiapan (setup/breakdown)",
          "2 Asisten studio standby",
        ],
      },
      {
        tier: "COMMERCIAL",
        title: "Produksi Skala Penuh & Syuting Video (Commercial)",
        subtitle: "Untuk syuting kampanye lookbook besar, TVC, atau multi-brand",
        price: "Rp 2.200.000",
        unit: "per 12 jam",
        capacityDuration: "12 Jam Produksi Penuh",
        deliverablesSummary: "Akses Eksklusif Seluruh Venue + Prioritas Jadwal",
        usageRights: "Bebas Hak Tayang Komersial (Perpetual / Selamanya)",
        equipmentIncluded: "Izin Heavy-Duty Gear + Ruang Tunggu VIP & Free Parking Kru",
        features: [
          "Prioritas jadwal & booking slot",
          "Izin pemakaian heavy-duty lighting / generator",
          "Overtime grace period 30 menit",
          "Akses pantry & ruang tunggu VIP",
        ],
      },
    ],
    defaultTerms: {
      dpPercentage: 50,
      maxRevisions: 1,
      shiftHours: 4,
      overtimeRate: "Rp 150.000 / 30 menit",
      gracePeriodMinutes: 30,
      safeSetCompliant: true,
      usageRightsScope: "ORGANIC_SOCIAL",
      usageRightsDuration: "PERPETUAL",
      extraRevisionFee: "Rp 150.000 / jam tambahan",
      paymentMilestoneScheme: "50_50_WATERMARK",
      roleSpecifics: {
        maxCrewCapacity: 10,
        cycloramaShoeTapeRequired: true,
        overtimePerBlockFee: "Rp 150.000 per 30 menit",
      },
    },
  },

  // Backward compatibility aliases
  get MUA() {
    return this.MUA_STYLIST;
  },
  get STYLIST() {
    return this.MUA_STYLIST;
  },
  get VIDEOGRAPHER() {
    return this.PHOTOGRAPHER;
  },
};

/**
 * Mendeteksi kategori role berdasarkan sektor atau tipe actor.
 * Selalu mengembalikan salah satu dari 6 kategori resmi.
 */
export function detectRoleCategory(sector?: string | null, type?: string | null): RoleCategory {
  const s = (sector || "").toLowerCase();
  const t = (type || "").toUpperCase();

  if (
    t === "BRAND" ||
    s.includes("brand") ||
    s.includes("label") ||
    s.includes("umkm") ||
    s.includes("designer") ||
    s.includes("desain") ||
    s.includes("perancang") ||
    s.includes("couture") ||
    s.includes("pola") ||
    s.includes("pattern")
  ) {
    return "BRAND";
  }
  if (t === "STUDIO" || s.includes("studio") || s.includes("ruang") || s.includes("venue")) {
    return "STUDIO";
  }
  if (s.includes("model") || s.includes("talent") || s.includes("peraga") || s.includes("muse")) {
    return "MODEL";
  }
  if (
    s.includes("mua") ||
    s.includes("makeup") ||
    s.includes("make up") ||
    s.includes("hair") ||
    s.includes("rias") ||
    s.includes("stylist") ||
    s.includes("wardrobe") ||
    s.includes("tata busana") ||
    s.includes("penata gaya")
  ) {
    return "MUA_STYLIST";
  }

  // Default Photographer
  return "PHOTOGRAPHER";
}
