import { TermsAndConditionsConfig } from "@/components/settings/RatesForm";

export interface ServicePackage {
  title: string;
  subtitle: string;
  price: string;
  unit: string;
  popular?: boolean;
  features: string[];
}

/**
 * 6 PERAN RESMI AKTOR DI PLATFORM RAMU:
 * 1. Fashion Brand/UMKM
 * 2. Fashion Designer
 * 3. Photographer
 * 4. Model
 * 5. MUA/Stylist
 * 6. Studio
 * Tidak boleh ada yang lain.
 */
export const ALLOWED_ACTOR_ROLES = [
  "Fashion Brand/UMKM",
  "Fashion Designer",
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
      "Barter / TFP Kolaborasi",
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
        title: "Kolaborasi Kampanye Lookbook",
        subtitle: "Penyediaan sampel busana & pendanaan produksi lookbook koleksi baru",
        price: "Sesuai Brief",
        unit: "per kampanye",
        popular: true,
        features: [
          "Penyediaan 10-15 look busana sampel siap fitting",
          "Pembagian biaya produksi terstruktur (DP 50% di awal)",
          "Pencantuman kredit resmi seluruh tim di lookbook & media sosial",
          "Distribusi konten promosi di kanal resmi brand",
        ],
      },
      {
        title: "Co-Branding Koleksi Kapsul",
        subtitle: "Kemitraan pembuatan lini produk eksklusif edisi terbatas dengan sistem bagi hasil",
        price: "Bagi Hasil",
        unit: "per koleksi",
        popular: false,
        features: [
          "Pengembangan desain bersama desainer & kolaborator",
          "Distribusi retail & penjualan di platform resmi brand",
          "Bagi hasil transparan dari penjualan bersih",
          "Hak cipta & kredit bersama diakui dalam SPK",
        ],
      },
      {
        title: "Katalog & E-Commerce Listing",
        subtitle: "Sesi foto katalog bersih untuk peluncuran marketplace & website",
        price: "Sesuai Brief",
        unit: "per proyek",
        popular: false,
        features: [
          "Foto produk packshot & on-model terstandar",
          "Penyediaan garmen rapi & siap dipotret",
          "Penggunaan hak tayang komersial digital",
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
        title: "Identitas Visual & Brand Kit",
        subtitle: "Panduan visual brand busana lengkap untuk rilis koleksi baru",
        price: "Rp 2.000.000",
        unit: "per proyek",
        popular: false,
        features: [
          "Panduan logo, tipografi, dan palet warna busana",
          "Template visual lookbook & feed media sosial",
          "Aset vektor master file (AI, EPS, PDF, SVG)",
          "Gratis 2x revisi desain visual",
        ],
      },
      {
        title: "Desain Koleksi Busana & Tech-Pack",
        subtitle: "Pengembangan konsep busana siap jahit dan spesifikasi garmen pabrik",
        price: "Rp 3.500.000",
        unit: "per koleksi",
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
        title: "Pembuatan Pola & Sampel Fisik (Toille)",
        subtitle: "Pengerjaan prototipe fisik busana pertama siap fitting bersama model",
        price: "Rp 5.500.000",
        unit: "per koleksi",
        popular: false,
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
        noAlteringPolicy: "Dilarang memotong, mengubah jahitan, atau merusak siluet busana tanpa izin tertulis desainer",
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
        title: "Lookbook Half-Day",
        subtitle: "Sesi foto lookbook esensial untuk rilis katalog busana baru",
        price: "Rp 1.500.000",
        unit: "per 4 jam",
        popular: false,
        features: [
          "1 Kamera profesional + Lensa prime/zoom",
          "15 Foto final retouch resolusi tinggi",
          "Semua file preview H+1 via Google Drive",
          "Color grading konsisten standar lookbook",
          "Delivery hasil akhir 3-4 hari kerja",
        ],
      },
      {
        title: "Kampanye Penuh (Full-Day)",
        subtitle: "Produksi visual lookbook komprehensif untuk kampanye utama rilis busana",
        price: "Rp 2.800.000",
        unit: "per 8 jam",
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
        title: "Katalog & E-Commerce Packshot",
        subtitle: "Foto katalog produk bersih untuk marketplace & website resmi",
        price: "Rp 1.200.000",
        unit: "per 20 produk",
        popular: false,
        features: [
          "Background putih / seamless bersih seragam",
          "3 Sudut foto per pakaian (Depan, Belakang, Detail)",
          "Batch color matching akurat dengan warna kain asli",
          "Format siap upload Tokopedia, Shopee, & Website",
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
        title: "Katalog & E-Commerce",
        subtitle: "Foto produk katalog marketplace & webstore brand",
        price: "Rp 1.000.000",
        unit: "per 4 jam",
        popular: false,
        features: [
          "Maksimal 12-15 look busana siap pakai",
          "Pose katalog rapi, proporsional & konsisten",
          "Termasuk fitting 30 menit sebelum sesi dimulai",
          "Hak tayang foto untuk marketplace & webstore 1 tahun",
        ],
      },
      {
        title: "Editorial Lookbook & Campaign",
        subtitle: "Pemodelan kampanye rilis busana dengan eksplorasi gaya dinamis",
        price: "Rp 1.800.000",
        unit: "per 8 jam",
        popular: true,
        features: [
          "Eksplorasi pose editorial & ekspresi dramatis sesuai moodboard",
          "Termasuk 1x fitting pra-produksi terpisah",
          "Standby on-set penuh hingga 8 jam",
          "Hak guna media sosial, website, & press release 1 tahun",
          "Dukungan posting kolaborasi Instagram/TikTok feeds",
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
        title: "Lookbook Styling & Makeup Starter",
        subtitle: "Padu padan outfit dan riasan HD untuk katalog & lookbook",
        price: "Rp 1.400.000",
        unit: "per 4 jam",
        popular: true,
        features: [
          "Kurasi hingga 8 look busana siap pakai",
          "Makeup HD tahan lampu studio & keringat",
          "Hair styling atau hijab do rapi",
          "Disediakan garment steamer & perlengkapan fitting on-set",
          "Standby touch-up aktif selama 4 jam kerja",
        ],
      },
      {
        title: "Campaign Full-Day Direction",
        subtitle: "Pengarahan gaya komprehensif dan tata rias penuh kampanye peluncuran busana",
        price: "Rp 2.800.000",
        unit: "per 8 jam",
        popular: false,
        features: [
          "Moodboard konsep styling & palet makeup selaras DNA brand",
          "Kurasi 15-20 look head-to-toe lengkap",
          "Pergantian 2-3 variasi makeup & hairdo sesuai konsep",
          "Peminjaman aksesoris pendukung esensial",
          "Standby penuh 8 jam di set indoor maupun outdoor",
          "Pembersihan makeup & pengembalian wardrobe rapi",
        ],
      },
      {
        title: "Single Look Express",
        subtitle: "Riasan dan penataan busana untuk sesi foto ringkas 1 model",
        price: "Rp 750.000",
        unit: "per look",
        popular: false,
        features: [
          "1 Model katalog atau lookbook",
          "Makeup HD + basic hair styling",
          "Pemasangan bulu mata premium gratis",
          "Standby touch-up 30 menit awal",
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
        title: "Shift Setengah Hari (Half-Day)",
        subtitle: "Sesi foto katalog, podcast, atau lookbook ringkas",
        price: "Rp 750.000",
        unit: "per 4 jam",
        popular: false,
        features: [
          "Akses area cyclorama wall & ruang makeup ber-AC",
          "Daya listrik 16.500 Watt (3-Phase)",
          "AC dingin & koneksi Wi-Fi kencang",
          "1 Asisten studio standby di lokasi",
        ],
      },
      {
        title: "Shift Penuh (Full-Day)",
        subtitle: "Pilihan utama untuk campaign lookbook & video komersial",
        price: "Rp 1.400.000",
        unit: "per 8 jam",
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
        title: "Produksi Besar / 12 Jam",
        subtitle: "Untuk syuting kampanye lookbook besar atau multi-brand",
        price: "Rp 2.200.000",
        unit: "per 12 jam",
        popular: false,
        features: [
          "Prioritas jadwal & booking slot",
          "Izin pemakaian heavy-duty lighting",
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

  if (t === "BRAND" || s.includes("brand") || s.includes("label") || s.includes("umkm")) {
    return "BRAND";
  }
  if (
    s.includes("designer") ||
    s.includes("desain") ||
    s.includes("perancang") ||
    s.includes("couture") ||
    s.includes("pola") ||
    s.includes("pattern")
  ) {
    return "DESIGNER";
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
