import { TermsAndConditionsConfig } from "@/components/settings/RatesForm";

export interface ServicePackage {
  title: string;
  subtitle: string;
  price: string;
  unit: string;
  popular?: boolean;
  features: string[];
}

export type RoleCategory =
  | "PHOTOGRAPHER"
  | "VIDEOGRAPHER"
  | "MODEL"
  | "MUA"
  | "STYLIST"
  | "DESIGNER"
  | "STUDIO";

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
  PHOTOGRAPHER: {
    id: "PHOTOGRAPHER",
    name: "Fotografer (Fashion & Komersial)",
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

  VIDEOGRAPHER: {
    id: "VIDEOGRAPHER",
    name: "Videografer & Cinema Fashion",
    roleBadge: "Videografi",
    defaultStartingRate: "Mulai Rp 1,8 Jt / video",
    quickRates: [
      "Mulai Rp 1,5 Jt / video",
      "Mulai Rp 1,8 Jt / video",
      "Mulai Rp 3,5 Jt / hari",
      "Mulai Rp 5,0 Jt / proyek",
    ],
    defaultTurnaround: "4 – 6 Hari Kerja",
    quickTurnarounds: [
      "2 – 3 Hari (Kilat)",
      "4 – 6 Hari Kerja",
      "7 – 10 Hari Kerja",
      "Selesai On-Set",
    ],
    commonUnits: ["per video", "per 4 jam", "per 8 jam", "per proyek"],
    quickDeliverableSuggestions: [
      "1 Master Video 4K (16:9)",
      "2 Cutdown Reels/TikTok (9:16)",
      "Kamera Sinema 4K + Gimbal",
      "Lighting Continuous & Mic Wireless",
      "Color Grading DaVinci Resolve",
      "Lisensi Musik Komersial Bebas Klaim",
      "Gratis 2x Revisi Offline/Warna",
    ],
    packages: [
      {
        title: "Reels & TikTok Cinematic",
        subtitle: "Video fashion vertikal 9:16 untuk media sosial dan promosi rilis",
        price: "Rp 1.800.000",
        unit: "per 4 jam",
        popular: false,
        features: [
          "1-2 Video reels sinematik durasi 30-45 detik",
          "Kamera sinema 4K + Gimbal stabilization",
          "Color grading khas seluloid / warm tone",
          "Lisensi musik komersial legal tanpa copyright strike",
          "Gratis 1x revisi minor",
        ],
      },
      {
        title: "Fashion Film & Campaign Video",
        subtitle: "Video kampanye sinematik lookbook untuk peluncuran koleksi busana",
        price: "Rp 3.500.000",
        unit: "per 8 jam",
        popular: true,
        features: [
          "1 Master film 4K (16:9) + 2 Cutdowns Reels (9:16)",
          "Lighting kit continuous bawaan + wireless lavalier mic",
          "Storyboarding & arahan visual on-set",
          "Color grading profesional di DaVinci Resolve",
          "Gratis 2x revisi color grading & offline edit",
          "Delivery cepat 4-5 hari kerja",
        ],
      },
      {
        title: "Iklan TVC / Commercial Brand Video",
        subtitle: "Produksi video iklan komersial skala penuh dengan aset multi-format",
        price: "Rp 6.000.000",
        unit: "per proyek",
        popular: false,
        features: [
          "Setup multi-kamera 4K 10-bit ProRes + Drone aerial",
          "Full audio field recording 32-bit float",
          "Color grading ACES standar bioskop di DaVinci Resolve",
          "Full commercial broadcast & advertising license",
          "Penyusunan naskah visual & storyboard komprehensif",
        ],
      },
    ],
    defaultTerms: {
      dpPercentage: 50,
      maxRevisions: 2,
      shiftHours: 8,
      overtimeRate: "Rp 300.000 / jam",
      gracePeriodMinutes: 30,
      safeSetCompliant: true,
      usageRightsScope: "PAID_ADS_DIGITAL",
      usageRightsDuration: "1_YEAR",
      extraRevisionFee: "Rp 350.000 / putaran revisi ekstra",
      paymentMilestoneScheme: "50_50_WATERMARK",
      roleSpecifics: {
        aspectRatiosIncluded: "1x Vertikal Reels 9:16 (30-45 dtk) & 1x Master 16:9",
        musicLicenseIncluded: true,
        majorRevisionFeeNote: "Ganti musik latar setelah final cut dikenakan biaya re-editing",
      },
    },
  },

  MODEL: {
    id: "MODEL",
    name: "Model / Talent Fashion",
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
        unit: "per 3-4 jam",
        popular: false,
        features: [
          "Maksimal 15 look / pergantian busana",
          "Pose katalog bersih, simetris & profesional",
          "Pilihan eksposur tag akun Instagram",
          "Termasuk fitting sebelum sesi dimulai",
        ],
      },
      {
        title: "Kampanye Lookbook (Full Day)",
        subtitle: "Kampanye musiman koleksi baru label busana utama",
        price: "Rp 1.800.000",
        unit: "per 8 jam",
        popular: true,
        features: [
          "Unlimited looks dalam durasi kerja 8 jam",
          "Photoshoot indoor atau outdoor",
          "Hak tayang digital & media sosial 1 tahun",
          "Fleksibel untuk konsep editorial & ekspresi bebas",
          "Didampingi 1 pendamping terdaftar",
        ],
      },
      {
        title: "Video TVC & Brand Ambassador",
        subtitle: "Iklan komersial video, billboard, atau kampanye promosi berbayar",
        price: "Rp 3.500.000",
        unit: "per proyek",
        popular: false,
        features: [
          "Video acting & dialog / voiceover kampanye",
          "Hak guna komersial multi-channel (Ads & Billboard)",
          "1x Post feed & 2x Story endorsement di medsos pribadi",
          "Kontrak eksklusivitas kategori busana selama masa tayang",
        ],
      },
    ],
    defaultTerms: {
      dpPercentage: 50,
      maxRevisions: 1,
      shiftHours: 8,
      overtimeRate: "Rp 200.000 / jam",
      gracePeriodMinutes: 30,
      safeSetCompliant: true,
      usageRightsScope: "ORGANIC_SOCIAL",
      usageRightsDuration: "1_YEAR",
      extraRevisionFee: "Rp 150.000 / jam tambahan",
      paymentMilestoneScheme: "50_50_WATERMARK",
      roleSpecifics: {
        wardrobeRestrictions: "Casual, Formal, Modest / Hijab (Sesuai Moodboard Awal)",
        chaperoneAllowed: true,
        usageRightsPeriod: "1 Tahun Digital Media (Medsos & Website)",
      },
    },
  },

  MUA: {
    id: "MUA",
    name: "Makeup Artist & Hair Stylist (MUA)",
    roleBadge: "MUA & Hair",
    defaultStartingRate: "Mulai Rp 650rb / look",
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
      "Standby + Ganti 3 Look",
    ],
    commonUnits: ["per look", "per 4 jam (half-day)", "per 8 jam (standby)", "per model"],
    quickDeliverableSuggestions: [
      "Complexion HD Tahan 12 Jam",
      "Hair Styling / Hijab Do Rapi",
      "Standby Touch-Up On-Set",
      "Gratis Pasang Eyelash & Lensa",
      "Kosmetik High-End & Hypoallergenic",
      "Pergantian 2-3 Look Makeup",
      "Eksplorasi Editorial Avant-Garde",
    ],
    packages: [
      {
        title: "1 Look Fashion Editorial",
        subtitle: "Riasan flawless high-definition untuk pemotretan katalog ringkas",
        price: "Rp 650.000",
        unit: "per look",
        popular: false,
        features: [
          "1 Model katalog atau lookbook",
          "Makeup HD tahan lampu studio & keringat",
          "Termasuk basic hair styling / hijab do",
          "Standby touch-up 30 menit awal pemotretan",
          "Gratis pasang bulu mata premium",
        ],
      },
      {
        title: "Half-Day Standby (2-3 Look)",
        subtitle: "Pilihan favorit untuk photoshoot lookbook dengan pergantian look busana",
        price: "Rp 1.400.000",
        unit: "per 4 jam",
        popular: true,
        features: [
          "Standby on-set penuh selama 4 jam kerja",
          "Pergantian 2-3 variasi makeup & hair restyling",
          "Touch-up aktif di sela-sela jepretan kamera",
          "Kosmetik high-end internasional aman untuk kulit sensitif",
          "Free touch-up minyak wajah & bibir",
        ],
      },
      {
        title: "Full-Day Campaign Standby",
        subtitle: "Pendampingan tata rias penuh untuk produksi kampanye besar atau TVC",
        price: "Rp 2.200.000",
        unit: "per 8 jam",
        popular: false,
        features: [
          "Standby penuh 8 jam di set indoor maupun outdoor",
          "Unlimited retouch & switch gaya rambut/makeup",
          "Teknik makeup HD 4K khusus kamera sinema",
          "Termasuk konsultasi moodboard sebelum hari H",
          "Pembersihan makeup setelah sesi selesai",
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

  STYLIST: {
    id: "STYLIST",
    name: "Fashion Stylist & Wardrobe",
    roleBadge: "Fashion Stylist",
    defaultStartingRate: "Mulai Rp 1,2 Jt / sesi",
    quickRates: [
      "Mulai Rp 1,2 Jt / sesi",
      "Mulai Rp 1,5 Jt / proyek",
      "Mulai Rp 2,2 Jt / hari",
      "Mulai Rp 3,0 Jt / kampanye",
    ],
    defaultTurnaround: "Selesai On-Set Hari-H",
    quickTurnarounds: [
      "Selesai On-Set Hari-H",
      "Pra-Produksi H-3 + Hari-H",
      "1 – 2 Minggu Kampanye",
    ],
    commonUnits: ["per proyek", "per 4 jam", "per 8 jam", "per look", "per hari"],
    quickDeliverableSuggestions: [
      "Moodboard & Deck Konsep Busana",
      "Styling 8-10 Look Lengkap",
      "Styling 15-20 Look Kampanye",
      "Pulling & Return Baju Desainer",
      "Penyediaan Aksesoris & Sepatu",
      "Garment Steamer & Fitting Kit On-Set",
      "Standby Kerapian On-Camera",
    ],
    packages: [
      {
        title: "Lookbook Styling Starter",
        subtitle: "Kurasi padu padan outfit untuk pemotretan katalog & lookbook",
        price: "Rp 1.500.000",
        unit: "per proyek",
        popular: false,
        features: [
          "Kurasi gaya hingga 8 look busana siap pakai",
          "Disediakan garment steamer & perlengkapan fitting on-set",
          "Peminjaman aksesoris & sepatu pendukung esensial",
          "Penjagaan kerapian lipatan & siluet busana di depan kamera",
          "Standby styling selama 4 jam sesi foto",
        ],
      },
      {
        title: "Campaign Full Wardrobe Direction",
        subtitle: "Pengarahan gaya komprehensif kampanye peluncuran koleksi busana baru",
        price: "Rp 3.000.000",
        unit: "per 8 jam",
        popular: true,
        features: [
          "Moodboard konsep styling & palet warna selaras DNA brand",
          "Kurasi 15-20 look head-to-toe lengkap",
          "Akses pulling wardrobe & perhiasan desainer lokal",
          "Fitting pra-produksi H-1 bersama model",
          "Manajemen wardrobe on-set tanpa noda & rapi",
          "Pengembalian (return) seluruh baju pinjaman pasca-sesi",
        ],
      },
      {
        title: "Creative Direction & Sourcing",
        subtitle: "Konseptualisasi tema rilis brand dan kurasi editorial skala besar",
        price: "Rp 4.500.000",
        unit: "per proyek",
        popular: false,
        features: [
          "Perancangan visual identity kampanye dari nol",
          "Sourcing koleksi vintage archive & kain wastra langka",
          "Supervisi langsung wardrobe di set pemotretan",
          "Arahan lookbook digital & panduan gaya katalog",
          "Prioritas konsultasi kreatif via tatap muka/online",
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
      extraRevisionFee: "Rp 250.000 / jam tambahan",
      paymentMilestoneScheme: "50_50_WATERMARK",
      roleSpecifics: {
        pullingDepositResponsibility: "Biaya sewa/deposit baju desainer dibayarkan langsung oleh klien",
        wardrobeDamageResponsibility: "Ganti rugi noda/robekan busana di set ditanggung klien",
      },
    },
  },

  DESIGNER: {
    id: "DESIGNER",
    name: "Desainer Busana & Grafis Kreatif",
    roleBadge: "Desainer Kreatif",
    defaultStartingRate: "Mulai Rp 1,8 Jt / proyek",
    quickRates: [
      "Mulai Rp 1,5 Jt / proyek",
      "Mulai Rp 2,5 Jt / koleksi",
      "Mulai Rp 3,5 Jt / batch",
      "Mulai Rp 500rb / desain",
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

  STUDIO: {
    id: "STUDIO",
    name: "Studio Foto & Ruang Kreatif",
    roleBadge: "Studio Space",
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
        subtitle: "Untuk syuting iklan TVC, webseries, atau multi-brand",
        price: "Rp 2.200.000",
        unit: "per 12 jam",
        popular: false,
        features: [
          "Prioritas jadwal & booking slot",
          "Izin pemakaian generator / heavy-duty lighting",
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
};

/**
 * Mendeteksi kategori role berdasarkan sektor atau tipe actor.
 */
export function detectRoleCategory(sector?: string | null, type?: string | null): RoleCategory {
  const s = (sector || "").toLowerCase();
  const t = (type || "").toUpperCase();

  if (t === "STUDIO" || s.includes("studio") || s.includes("ruang") || s.includes("venue")) {
    return "STUDIO";
  }
  if (s.includes("model") || s.includes("talent") || s.includes("peraga")) {
    return "MODEL";
  }
  if (s.includes("mua") || s.includes("makeup") || s.includes("make up") || s.includes("hair") || s.includes("rias")) {
    return "MUA";
  }
  if (s.includes("stylist") || s.includes("wardrobe") || s.includes("tata busana") || s.includes("penata gaya")) {
    return "STYLIST";
  }
  if (s.includes("video") || s.includes("film") || s.includes("cinema") || s.includes("sinema") || s.includes("motion")) {
    return "VIDEOGRAPHER";
  }
  if (s.includes("designer") || s.includes("desain") || s.includes("perancang") || s.includes("grafis") || s.includes("fashion design") || s.includes("pola")) {
    return "DESIGNER";
  }

  // Default fotografer
  return "PHOTOGRAPHER";
}
