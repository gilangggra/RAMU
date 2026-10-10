const { PrismaClient, AssetCategory, AssetRole, SourceType, ConfidenceLevel, AssetStatus } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Memulai penataan data lengkap untuk semua peran di RAMU...");

  // -------------------------------------------------------------
  // 1. MODEL: Go Young Jung
  // -------------------------------------------------------------
  const modelId = '00000000-0000-0000-0000-000000000005';
  console.log("👗 Menyelaraskan profil Model (Go Young Jung)...");

  // Hapus aset salah (laptop/kamera dari profil model)
  await prisma.asset.deleteMany({
    where: {
      actorId: modelId,
      name: { contains: "Dell" },
    },
  });

  // Hapus aset portofolio lama agar diganti dengan portofolio autentik lengkap
  await prisma.asset.deleteMany({
    where: {
      actorId: modelId,
      category: AssetCategory.PORTFOLIO_WORK,
    },
  });

  const modelCompCardPhotos = [
    {
      type: "Headshot / Close-Up",
      url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      caption: "Polaroid Clean Headshot (Daylight Alami, No Retouch)",
    },
    {
      type: "Profile / 45° Angle",
      url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
      caption: "Profil Struktur Wajah & Rahang",
    },
    {
      type: "Full Body Front",
      url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
      caption: "Proporsi Tubuh Penuh (Minimalist Bodysuit)",
    },
    {
      type: "Editorial Pose",
      url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
      caption: "High-Fashion Movement & Katalog Wastra",
    },
  ];

  // Update / create Model Skill & Specs Asset
  const existingModelSkill = await prisma.asset.findFirst({
    where: { actorId: modelId, category: AssetCategory.SKILL_TALENT },
  });

  const modelAttributes = {
    height_cm: 175,
    weight_kg: 51,
    bust_waist_hips: "83-59-88 cm",
    clothing_size: "S / 36 EU / 4 US",
    shoe_size: "38.5 EU / 7.5 US",
    hair_color: "Dark Brown / Long Natural",
    eye_color: "Dark Brown",
    skin_undertone: "Neutral Fair",
    experience_years: 5,
    specialties: [
      "Editorial Fashion",
      "Lookbook & Catalog",
      "Traditional Wastra & Batik Modern",
      "Commercial Beauty Campaign",
      "Runway / Catwalk",
    ],
    capabilities: [
      "Pose Katalog 35+ Looks/Sesi",
      "Ekspresi Emosional Editorial",
      "Catwalk Runway Tempo Tinggi",
      "On-set Fluid Posing",
    ],
    wardrobe_restrictions: "Tidak menerima lingerie atau nude art",
    chaperone_allowed: true,
    travel_radius: "Jabodetabek & Luar Kota (Akomodasi Disediakan)",
    comp_card: modelCompCardPhotos,
  };

  if (existingModelSkill) {
    await prisma.asset.update({
      where: { id: existingModelSkill.id },
      data: {
        name: "Kapabilitas Modeling Editorial & Pose Katalog Fashion",
        subtype: "Fashion Modeling",
        description: "Talenta model profesional dengan pengalaman 5+ tahun dalam kampanye fashion editorial, lookbook desainer independen, dan runway pekan mode nasional.",
        attributes: modelAttributes,
      },
    });
  } else {
    await prisma.asset.create({
      data: {
        actorId: modelId,
        category: AssetCategory.SKILL_TALENT,
        subtype: "Fashion Modeling",
        name: "Kapabilitas Modeling Editorial & Pose Katalog Fashion",
        description: "Talenta model profesional dengan pengalaman 5+ tahun dalam kampanye fashion editorial, lookbook desainer independen, dan runway pekan mode nasional.",
        roles: [AssetRole.CAPABILITY, AssetRole.RESOURCE],
        attributes: modelAttributes,
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE,
      },
    });
  }

  // Tambahkan Portofolio Resmi Model
  const modelPortfolios = [
    {
      name: "Editorial Lookbook 'Siluet & Spora' — Spring/Summer",
      subtype: "Editorial Fashion",
      description: "Pose editorial lookbook dengan pencahayaan daylight alami dan penataan drapery busana kontemporer.",
      imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80",
    },
    {
      name: "Comp-Card Clean Polaroid Series 2026",
      subtype: "Comp Card Agensi",
      description: "Set polaroid standar agensi internasional menampilkan proporsi tubuh asli, struktur wajah, dan ekspresi natural.",
      imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80",
    },
    {
      name: "Wastra Kontemporer — Tenun Nusantara Showcase",
      subtype: "Katalog Komersial",
      description: "Kampanye busana tenun ikat tradisional berpadu dengan siluet modern, menonjolkan tekstur kain dan anggunnya gestur.",
      imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=80",
    },
    {
      name: "Radiant Glow — High-End Beauty Commercial",
      subtype: "Beauty Commercial",
      description: "Macro beauty shot untuk kampanye produk perawatan kulit dengan fokus pada kejernihan kulit dan ekspresi mata.",
      imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=80",
    },
  ];

  for (const p of modelPortfolios) {
    await prisma.asset.create({
      data: {
        actorId: modelId,
        category: AssetCategory.PORTFOLIO_WORK,
        subtype: p.subtype,
        name: p.name,
        description: p.description,
        roles: [AssetRole.CREATIVE_ELEMENT],
        attributes: {
          image_url: p.imageUrl,
          media_type: "IMAGE",
          aspect_ratio: "4:5",
        },
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE,
      },
    });
  }

  // Paket Layanan Mandiri Model
  const modelServicePackages = [
    {
      tier: "STARTER",
      title: "Lookbook Setengah Hari (Half-Day)",
      subtitle: "Maksimal 12-15 looks busana, durasi 4 jam pemotretan",
      price: "Rp 2.000.000",
      unit: "4 jam",
      capacityDuration: "4 Jam (Half-Day)",
      deliverablesSummary: "12-15 Looks Katalog, Unlimited Poses, Raw Preview",
      usageRights: "Komersial Digital (Web & Media Sosial Brand) 6 Bulan",
      equipmentIncluded: "Model Standby + Basic Heels & Nude Undergarments",
      features: [
        "Durasi pemotretan hingga 4 jam on-set",
        "Maksimal 15 pergantian busana (looks)",
        "Standby fitting dan briefing 30 menit sebelum sesi",
        "Hak pakai digital webstore dan sosial media",
      ],
    },
    {
      tier: "COMMERCIAL",
      title: "Full-Day Lookbook & Commercial Campaign",
      subtitle: "Maksimal 30 looks busana, durasi 8 jam dengan standby touchup",
      price: "Rp 3.800.000",
      unit: "8 jam",
      capacityDuration: "8 Jam (Full-Day)",
      deliverablesSummary: "Hingga 30 Looks, Video Reel Movement B-Roll",
      usageRights: "Komersial Digital & E-Commerce 1 Tahun",
      equipmentIncluded: "Wardrobe Personal Kit (3 Pilihan Sepatu & Accessories)",
      popular: true,
      features: [
        "Durasi kerja 8 jam (termasuk istirahat 1 jam)",
        "Kapasitas hingga 30 set pakaian lookbook",
        "Bebas re-take pose untuk variasi sudut katalog",
        "Termasuk hak siar marketplace e-commerce nasional",
      ],
    },
    {
      tier: "CAMPAIGN",
      title: "High-Fashion Editorial & Hero Campaign",
      subtitle: "Kampanye utama brand, lookbook editorial eksklusif & billboard",
      price: "Rp 7.000.000",
      unit: "proyek",
      capacityDuration: "Sesi Penuh + Runway/Hero Launch",
      deliverablesSummary: "Hero Billboard Key Visuals & Master Campaign",
      usageRights: "Lisensi Komersial Lengkap (Print, Billboard, Digital) 1 Tahun",
      equipmentIncluded: "Full Agency Talent Rider & Exclusive Non-Compete 3 Bulan",
      features: [
        "Eksklusivitas kompetitor sejenis selama 3 bulan",
        "Hak siar cetak (billboard, majalah, lookbook book)",
        "Termasuk sesi pra-produksi & fitting lookbook 1 hari sebelumnya",
        "Didampingi SPK legal terpadu standar RAMU",
      ],
    },
  ];

  await prisma.asset.upsert({
    where: { id: "00000000-0000-0000-0000-000000001005" },
    update: {
      name: "Paket Tarif Modeling Resmi Go Young Jung",
      subtype: "COMMERCIAL_SERVICE_PACKAGES",
      description: "Struktur tarif modeling profesional terverifikasi untuk katalog, editorial, dan kampanye komersial.",
      attributes: { service_packages: modelServicePackages },
    },
    create: {
      id: "00000000-0000-0000-0000-000000001005",
      actorId: modelId,
      category: AssetCategory.SKILL_TALENT,
      subtype: "COMMERCIAL_SERVICE_PACKAGES",
      name: "Paket Tarif Modeling Resmi Go Young Jung",
      description: "Struktur tarif modeling profesional terverifikasi untuk katalog, editorial, dan kampanye komersial.",
      roles: [AssetRole.CAPABILITY],
      attributes: { service_packages: modelServicePackages },
      sourceType: SourceType.SELF_REPORTED,
      confidenceLevel: ConfidenceLevel.HIGH,
      status: AssetStatus.ACTIVE,
    },
  });


  // -------------------------------------------------------------
  // 2. PHOTOGRAPHER: Lensa Kreatif Studio
  // -------------------------------------------------------------
  const photoId = '00000000-0000-0000-0000-000000000004';
  console.log("📷 Menyelaraskan profil Photographer (Lensa Kreatif Studio)...");

  await prisma.asset.deleteMany({
    where: {
      actorId: photoId,
      category: AssetCategory.PORTFOLIO_WORK,
    },
  });

  const photoAttributes = {
    primary_camera: "Sony Alpha 1 (50.1 MP) & Sony A7R V (61 MP)",
    secondary_camera: "Fujifilm GFX 100S (Medium Format 102 MP)",
    lenses: [
      "Sony FE 24-70mm f/2.8 GM II",
      "Sony FE 85mm f/1.4 GM",
      "Sony FE 50mm f/1.2 GM",
      "Sony FE 90mm f/2.8 Macro G OSS",
    ],
    lighting_gear: [
      "3x Profoto B10X Plus (500Ws Mobile Strobes)",
      "2x Profoto Softbox RFi 3x4' + Grid",
      "1x Profoto Beauty Dish White 20.5\"",
      "Profoto Air Remote TTL-S",
    ],
    tethering_available: true,
    drone_aerial: false,
    editing_software: [
      "Capture One Pro 23 (Tethering On-Set)",
      "Adobe Photoshop CC (High-End Retouch)",
      "Adobe Lightroom Classic",
    ],
    specialties: [
      "Fashion Lookbook & E-Commerce",
      "Editorial High-Fashion",
      "Macro Beauty & Jewelry",
      "Color-Accurate Fabric Catalog",
    ],
    capabilities: [
      "Live Tethered Preview ke iPad/Monitor Klien",
      "Color Checker Passport Akurasi Warna Kain",
      "Output Resolusi Tinggi Siap Cetak Billboard",
      "High-Speed Sync Freeze Motion",
    ],
    deliverables: [
      "Semua RAW File Resolusi Penuh",
      "15-25 Foto Final High-End Retouched",
      "Web-Optimized JPEG Version",
      "Color Proofing PDF Kontak",
    ],
    delivery_time_days: 3,
    rate_starting_at: "Rp 2.500.000 / shift",
  };

  const existingPhotoSkill = await prisma.asset.findFirst({
    where: { actorId: photoId, category: AssetCategory.SKILL_TALENT },
  });

  if (existingPhotoSkill) {
    await prisma.asset.update({
      where: { id: existingPhotoSkill.id },
      data: {
        name: "Kapabilitas Fotografi Fashion & Produksi Visual Lookbook",
        subtype: "Fotografi Komersial",
        description: "Studio fotografi spesialis fesyen editorial, katalog lookbook e-commerce berakurasi warna tinggi, dan kampanye busana komersial.",
        attributes: photoAttributes,
      },
    });
  } else {
    await prisma.asset.create({
      data: {
        actorId: photoId,
        category: AssetCategory.SKILL_TALENT,
        subtype: "Fotografi Komersial",
        name: "Kapabilitas Fotografi Fashion & Produksi Visual Lookbook",
        description: "Studio fotografi spesialis fesyen editorial, katalog lookbook e-commerce berakurasi warna tinggi, dan kampanye busana komersial.",
        roles: [AssetRole.CAPABILITY, AssetRole.RESOURCE],
        attributes: photoAttributes,
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE,
      },
    });
  }

  const photoPortfolios = [
    {
      name: "Editorial Lookbook 'Silk & Shadows' — Deconstructed Fashion",
      subtype: "Editorial Fashion",
      description: "Pemotretan busana sutra organza dengan teknik play-of-shadows dan pencahayaan contour berdaya pikat visual tinggi.",
      imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80",
    },
    {
      name: "Katalog Komersial Koleksi Musim Gugur 2026",
      subtype: "Katalog Komersial",
      description: "Foto katalog e-commerce 24 SKU dengan kalibrasi warna presisi standar industri garmen dan tekstil.",
      imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80",
    },
    {
      name: "Wastra Tenun Atelier — Parang Kontemporer Series",
      subtype: "Wastra Nusantara",
      description: "Karya kolaboratif busana tenun ikat tradisional dengan moodboard editorial majalah mode internasional.",
      imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80",
    },
    {
      name: "Macro Beauty & Jewelry Heritage Collection",
      subtype: "Beauty Commercial",
      description: "Macro photography perhiasan logam mulia dengan pencahayaan softbox gradasi halus dan detail tekstur tajam.",
      imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=80",
    },
  ];

  for (const p of photoPortfolios) {
    await prisma.asset.create({
      data: {
        actorId: photoId,
        category: AssetCategory.PORTFOLIO_WORK,
        subtype: p.subtype,
        name: p.name,
        description: p.description,
        roles: [AssetRole.CREATIVE_ELEMENT],
        attributes: {
          image_url: p.imageUrl,
          media_type: "IMAGE",
          aspect_ratio: "4:5",
        },
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE,
      },
    });
  }

  const photoPackages = [
    {
      tier: "STARTER",
      title: "Lookbook Setengah Hari (4 Jam)",
      subtitle: "Ideal untuk koleksi kapsul UMKM, maksimal 12 looks katalog",
      price: "Rp 2.500.000",
      unit: "4 jam",
      capacityDuration: "4 Jam Pemotretan",
      deliverablesSummary: "Semua RAW + 12 Foto Final High-End Retouch",
      usageRights: "Komersial Digital (Sosmed & Web) 1 Tahun",
      equipmentIncluded: "Kamera Sony A7R V + 2 Lensa GM + Profoto Lighting Kit",
      features: [
        "Durasi sesi 4 jam di studio atau daylight venue",
        "Termasuk live tethering ke layar laptop",
        "Koreksi warna standar Pantone/ColorChecker",
        "Pengiriman file final dalam 3 hari kerja",
      ],
    },
    {
      tier: "COMMERCIAL",
      title: "Full-Day Fashion Lookbook (8 Jam)",
      subtitle: "Standar industri kampanye lookbook, hingga 30 looks busana",
      price: "Rp 4.500.000",
      unit: "8 jam",
      capacityDuration: "8 Jam Pemotretan",
      deliverablesSummary: "Semua RAW + 25 Foto Final Retouched + Color Grade",
      usageRights: "Komersial Digital & E-Commerce Marketplace Penuh",
      equipmentIncluded: "Dual Body Sony Alpha + 4 Lensa GM + 3 Profoto Strobes",
      popular: true,
      features: [
        "Durasi sesi 8 jam pemotretan intensif",
        "Termasuk 1 asisten fotografer on-set",
        "25 foto retouch majalah + seluruh master file resolusi tinggi",
        "Bebas revisi minor retouching hingga 2 kali",
      ],
    },
    {
      tier: "CAMPAIGN",
      title: "Master Campaign & Billboard Commercial",
      subtitle: "Kampanye besar rilis koleksi musiman, hero visuals & media cetak",
      price: "Rp 8.500.000",
      unit: "proyek",
      capacityDuration: "Full-Day + Pre-Production Consultation",
      deliverablesSummary: "Semua RAW + 40 Retouched + Key Visual Poster",
      usageRights: "Lisensi Cetak, Billboard, & Digital Tanpa Batas Wilayah",
      equipmentIncluded: "Full Cine & Medium Format Gear + Lighting Suite",
      features: [
        "Konsultasi konsep visual & moodboard pra-produksi",
        "Format foto resolusi super tinggi siap cetak billboard",
        "Color grading khusus identitas brand (LUT & Preset khusus)",
        "Dukungan SPK hak cipta & lisensi komersial terpadu RAMU",
      ],
    },
  ];

  await prisma.asset.upsert({
    where: { id: "00000000-0000-0000-0000-000000001004" },
    update: {
      name: "Paket Jasa Fotografi Lensa Kreatif Studio",
      subtype: "COMMERCIAL_SERVICE_PACKAGES",
      description: "Paket resmi jasa fotografi fashion dan komersial dengan peralatan lighting profesional.",
      attributes: { service_packages: photoPackages },
    },
    create: {
      id: "00000000-0000-0000-0000-000000001004",
      actorId: photoId,
      category: AssetCategory.SKILL_TALENT,
      subtype: "COMMERCIAL_SERVICE_PACKAGES",
      name: "Paket Jasa Fotografi Lensa Kreatif Studio",
      description: "Paket resmi jasa fotografi fashion dan komersial dengan peralatan lighting profesional.",
      roles: [AssetRole.CAPABILITY],
      attributes: { service_packages: photoPackages },
      sourceType: SourceType.SELF_REPORTED,
      confidenceLevel: ConfidenceLevel.HIGH,
      status: AssetStatus.ACTIVE,
    },
  });


  // -------------------------------------------------------------
  // 3. STUDIO: Studio Imaji & Co.
  // -------------------------------------------------------------
  const studioId = '00000000-0000-0000-0000-000000000002';
  console.log("🏢 Menyelaraskan profil Studio (Studio Imaji & Co.)...");

  await prisma.asset.deleteMany({
    where: {
      actorId: studioId,
      category: AssetCategory.PORTFOLIO_WORK,
    },
  });

  const studioAttributes = {
    area_sqm: 160,
    ceiling_height_m: 5.2,
    cyclorama_type: "L-Curve Seamless White (8m x 6m x 5.2m)",
    electrical_capacity: "16.500 VA (3 Phase Industrial Breaker)",
    floor_type: "Epoxy Matte Grey & Polished Microcement",
    space_type: ["Daylight Studio Loft", "Seamless White Cyclorama", "Industrial Brick Set Corner"],
    max_people_capacity: 25,
    max_crew_capacity: 15,
    available_setups: [
      "White Infinity Cyclorama Wall",
      "North-Facing Giant Daylight Windows",
      "Warm Sunset Afternoon Light Set",
      "Dark Room Blackout Curtain Setup",
    ],
    lighting_gear: [
      "4x C-Stand Matthews 40\" with Grip Arm",
      "2x Heavy Duty Century Boom Stands",
      "4x Polyboards Hitam/Putih (2.4m x 1.2m)",
      "Sandbags 10kg (8 Pcs)",
    ],
    props_available: true,
    facilities: [
      "2x Dedicated Makeup Stations dengan Hollywood Light",
      "Private Fitting Room dengan Cermin Penuh",
      "Industrial Garment Steamer Philips Pro",
      "Ruang Tunggu Klien & Coffee Bar",
      "AC Sentral Inverter 5PK",
      "WiFi Fiber Optic 200 Mbps",
      "Area Parkir Khusus 6 Mobil",
    ],
    operating_hours: "07:00 - 22:00 WIB",
    overtime_policy: "Rp 350.000 / jam tambahan di atas shift sewa",
  };

  const existingStudioAsset = await prisma.asset.findFirst({
    where: { actorId: studioId, category: AssetCategory.STUDIO_SPACE },
  });

  if (existingStudioAsset) {
    await prisma.asset.update({
      where: { id: existingStudioAsset.id },
      data: {
        name: "Studio Daylight Loft dengan L-Curve Cyclorama Wall",
        subtype: "Daylight Studio & Cyclorama",
        description: "Ruang studio foto daylight berplafon tinggi 5.2m dengan cyclorama mulus warna putih, pencahayaan alami melimpah, dan fasilitas produksi lengkap.",
        attributes: studioAttributes,
      },
    });
  } else {
    await prisma.asset.create({
      data: {
        actorId: studioId,
        category: AssetCategory.STUDIO_SPACE,
        subtype: "Daylight Studio & Cyclorama",
        name: "Studio Daylight Loft dengan L-Curve Cyclorama Wall",
        description: "Ruang studio foto daylight berplafon tinggi 5.2m dengan cyclorama mulus warna putih, pencahayaan alami melimpah, dan fasilitas produksi lengkap.",
        roles: [AssetRole.RESOURCE],
        attributes: studioAttributes,
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE,
      },
    });
  }

  const studioPortfolios = [
    {
      name: "Daylight Loft White Cyclorama — Setup Editorial 2026",
      subtype: "Fasilitas Studio",
      description: "Tampilan cyclorama mulus L-curve dengan pencahayaan alami dari jendela raksasa menghadap utara.",
      imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1000&q=80",
    },
    {
      name: "Warm Sunset Daylight Corner Studio",
      subtype: "Fasilitas Studio",
      description: "Sudut studio bertekstur mikro-semen dengan jatuhnya bayangan matahari sore yang hangat untuk lookbook bernuansa tenang.",
      imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80",
    },
    {
      name: "Industrial Brick Wall & Minimalist Concrete Area",
      subtype: "Set Produksi",
      description: "Dinding bata ekspos bergaya industrial urban cocok untuk lookbook streetwear dan kampanye busana kasual.",
      imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1000&q=80",
    },
    {
      name: "Makeup Station & Lounge Klien Eksklusif",
      subtype: "Fasilitas Pendukung",
      description: "Area rias profesional dengan cermin hollywood bebas bayangan, kursi hidrolik, dan steamer baju kapasitas tinggi.",
      imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80",
    },
  ];

  for (const p of studioPortfolios) {
    await prisma.asset.create({
      data: {
        actorId: studioId,
        category: AssetCategory.PORTFOLIO_WORK,
        subtype: p.subtype,
        name: p.name,
        description: p.description,
        roles: [AssetRole.CREATIVE_ELEMENT],
        attributes: {
          image_url: p.imageUrl,
          media_type: "IMAGE",
          aspect_ratio: "16:9",
        },
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE,
      },
    });
  }

  const studioPackages = [
    {
      tier: "STARTER",
      title: "Sewa Studio Setengah Hari (4 Jam)",
      subtitle: "Akses daylight cyclorama dan ruang rias, cocok untuk lookbook singkat",
      price: "Rp 1.200.000",
      unit: "4 jam",
      capacityDuration: "4 Jam Sesi",
      deliverablesSummary: "Akses Studio 160m², Cyclorama Putih, Ruang Rias",
      usageRights: "Bebas Penggunaan Komersial dan Non-Komersial",
      equipmentIncluded: "Listrik 16.500 VA + AC + 2 C-Stand + Steamer",
      features: [
        "Durasi sewa 4 jam bebas pilih shift (pagi/siang)",
        "Termasuk listrik 16.500 VA dan AC sentral",
        "Akses 2 meja rias dan fitting room private",
        "Termasuk 2 C-Stand dan polyboard pemantul cahaya",
      ],
    },
    {
      tier: "COMMERCIAL",
      title: "Sewa Studio Penuh (8 Jam / Full-Day)",
      subtitle: "Pilihan paling populer untuk kampanye katalog komersial lengkap",
      price: "Rp 2.200.000",
      unit: "8 jam",
      capacityDuration: "8 Jam Sesi Penuh",
      deliverablesSummary: "Full Access Studio + Semua Set + Free Repaint",
      usageRights: "Bebas Hak Siar Produksi Komersial",
      equipmentIncluded: "All Stands & Grip Gear + Coffee & Water Station",
      popular: true,
      features: [
        "Durasi 8 jam penuh mencakup puncak golden hour daylight",
        "Bebas memakai seluruh sudut set (Cyclorama, Bata, & Sudut Semen)",
        "Termasuk cat ulang lantai cyclorama putih bersih saat mulai",
        "Kapasitas kru hingga 20 orang",
      ],
    },
    {
      tier: "CAMPAIGN",
      title: "Full Production 12 Jam & Overtime Buffer",
      subtitle: "Produksi video iklan, TVC, dan kampanye editorial berskala besar",
      price: "Rp 3.500.000",
      unit: "12 jam",
      capacityDuration: "12 Jam Shift Panjang",
      deliverablesSummary: "Eksklusif Seluruh Gedung Studio & Area Parkir",
      usageRights: "Produksi Film, Iklan TV, & Katalog Komersial",
      equipmentIncluded: "All Grip Gear + Heavy Power Access + Kru Studio Standby",
      features: [
        "Durasi hingga 12 jam leluasa dari pagi hingga malam",
        "1 staf operasional studio standby membantu teknis",
        "Bebas membawa perlengkapan lighting luar daya besar",
        "Akses parkir VIP khusus hingga 6 kendaraan",
      ],
    },
  ];

  await prisma.asset.upsert({
    where: { id: "00000000-0000-0000-0000-000000001002" },
    update: {
      name: "Paket Sewa Studio Imaji & Co.",
      subtype: "COMMERCIAL_SERVICE_PACKAGES",
      description: "Struktur tarif dan paket sewa studio foto daylight & cyclorama.",
      attributes: { service_packages: studioPackages },
    },
    create: {
      id: "00000000-0000-0000-0000-000000001002",
      actorId: studioId,
      category: AssetCategory.STUDIO_SPACE,
      subtype: "COMMERCIAL_SERVICE_PACKAGES",
      name: "Paket Sewa Studio Imaji & Co.",
      description: "Struktur tarif dan paket sewa studio foto daylight & cyclorama.",
      roles: [AssetRole.CAPABILITY],
      attributes: { service_packages: studioPackages },
      sourceType: SourceType.SELF_REPORTED,
      confidenceLevel: ConfidenceLevel.HIGH,
      status: AssetStatus.ACTIVE,
    },
  });


  // -------------------------------------------------------------
  // 4. MUA / STYLIST: Glow & Form Artistry
  // -------------------------------------------------------------
  const muaId = '00000000-0000-0000-0000-000000000003';
  console.log("💄 Menyelaraskan profil MUA & Stylist (Glow & Form Artistry)...");

  await prisma.asset.deleteMany({
    where: {
      actorId: muaId,
      category: AssetCategory.PORTFOLIO_WORK,
    },
  });

  const muaAttributes = {
    primary_kit_brands: [
      "Dior Backstage",
      "Chanel Beauty",
      "NARS Cosmetics",
      "Charlotte Tilbury",
      "Bobbi Brown",
      "Make Up For Ever HD",
    ],
    makeup_styles: [
      "Clean Editorial Glass Skin",
      "Avant-Garde Graphic & Color Pop",
      "Natural Dewy Commercial Look",
      "High-Fashion Runway Matte Finish",
    ],
    hair_specialties: [
      "Sleek Sculpted Hair & Architectural Buns",
      "Textured Editorial Waves",
      "Wet-Look Avant-Garde Styling",
      "Modern Wastra Updo (Sanggul Kontemporer)",
    ],
    sanitation_standards: [
      "100% Disposable Mascara & Lip Wands",
      "Pembersihan Kuas dengan UV-C Box Sterilizer",
      "70% Isopropyl Alcohol Spray untuk Setiap Produk",
      "Mixing Menggunakan Spatula & Palet Stainless Steel",
    ],
    hair_tools: [
      "Dyson Supersonic Professional Edition",
      "Dyson Airwrap Multi-Styler",
      "GHD Platinum+ Styler",
      "Babyliss Pro Titanium Curling Iron",
    ],
    onset_equipment: [
      "Industrial Garment Steamer Portable",
      "Wardrobe Emergency Kit (Safety Pins, Fashion Tape, Lint Roller)",
      "Portable Ring Light Bi-Color",
    ],
    styling_specialties: [
      "Editorial Fashion Lookbook",
      "Contemporary Wastra & Tenun Draping",
      "High-Fashion Streetwear & Minimalist Tailoring",
      "Visual Concept Moodboarding & Color Grading",
    ],
    wardrobe_archive_count: 220,
    rate_starting_at: "Rp 1.500.000 / sesi",
  };

  const existingMuaSkill = await prisma.asset.findFirst({
    where: { actorId: muaId, category: AssetCategory.SKILL_TALENT },
  });

  if (existingMuaSkill) {
    await prisma.asset.update({
      where: { id: existingMuaSkill.id },
      data: {
        name: "Layanan Tata Rias Editorial MUA & Penata Gaya Busana (Stylist)",
        subtype: "Editorial Makeup & Hair Styling",
        description: "Artis tata rias dan penata gaya fesyen profesional berpengalaman pada pemotretan lookbook, kampanye majalah, dan rilis koleksi desainer.",
        attributes: muaAttributes,
      },
    });
  } else {
    await prisma.asset.create({
      data: {
        actorId: muaId,
        category: AssetCategory.SKILL_TALENT,
        subtype: "Editorial Makeup & Hair Styling",
        name: "Layanan Tata Rias Editorial MUA & Penata Gaya Busana (Stylist)",
        description: "Artis tata rias dan penata gaya fesyen profesional berpengalaman pada pemotretan lookbook, kampanye majalah, dan rilis koleksi desainer.",
        roles: [AssetRole.CAPABILITY, AssetRole.RESOURCE],
        attributes: muaAttributes,
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE,
      },
    });
  }

  const muaPortfolios = [
    {
      name: "Dewy Editorial Glass Skin — Jakarta Fashion Week",
      subtype: "Makeup Editorial",
      description: "Tata rias kulit dewy berkilau alami dengan fokus pada kilau tulang pipi dan tekstur kulit yang sangat halus.",
      imageUrl: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1000&q=80",
    },
    {
      name: "Avant-Garde Graphic Eye & Hair Sculpting",
      subtype: "Tata Rias & Rambut",
      description: "Penataan rias mata grafis berani dipadukan dengan tatanan rambut arsitektural untuk kampanye editorial fashion.",
      imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80",
    },
    {
      name: "Contemporary Wastra Styling & Draping Guide",
      subtype: "Fashion Styling",
      description: "Kurasi styling kain tenun ikat NTT dengan struktur blazer tailoring modern dan aksesoris perak Kotagede.",
      imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80",
    },
    {
      name: "Minimalist Natural Glow — Lookbook Kampanye SS26",
      subtype: "Commercial Beauty",
      description: "Gaya riasan komersial natural tanpa kesan berlebihan untuk katalog busana harian siap pakai.",
      imageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=80",
    },
  ];

  for (const p of muaPortfolios) {
    await prisma.asset.create({
      data: {
        actorId: muaId,
        category: AssetCategory.PORTFOLIO_WORK,
        subtype: p.subtype,
        name: p.name,
        description: p.description,
        roles: [AssetRole.CREATIVE_ELEMENT],
        attributes: {
          image_url: p.imageUrl,
          media_type: "IMAGE",
          aspect_ratio: "4:5",
        },
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE,
      },
    });
  }

  const muaPackages = [
    {
      tier: "STARTER",
      title: "Lookbook Makeup & Hair (1 Model, 4 Jam)",
      subtitle: "Riasan dasar dan tatanan rambut rapi untuk katalog koleksi kapsul",
      price: "Rp 1.500.000",
      unit: "sesi",
      capacityDuration: "4 Jam Sesi",
      deliverablesSummary: "1 Look Utama + 1 Kali Touch-up Perubahan Lipstik",
      usageRights: "Komersial Digital (Foto & Video Katalog)",
      equipmentIncluded: "Full High-End Kit Dior/NARS/MAC + Dyson Tools",
      features: [
        "Durasi kerja 4 jam on-set di studio atau lokasi pemotretan",
        "Termasuk persiapan kulit (skin prep) intensif sebelum rias",
        "Standby touch-up keringat dan rambut selama pemotretan",
        "100% standar sanitasi kuas dan aplikator higienis",
      ],
    },
    {
      tier: "COMMERCIAL",
      title: "Full-Day MUA + Onset Wardrobe Styling (8 Jam)",
      subtitle: "Paket komplit rias, tatanan rambut, dan styling pakaian on-set",
      price: "Rp 3.500.000",
      unit: "hari",
      capacityDuration: "8 Jam Kerja Penuh",
      deliverablesSummary: "Hingga 3 Look Pergantian + Styling 20+ Outfits",
      usageRights: "Komersial Digital & E-Commerce Lengkap",
      equipmentIncluded: "MUA Kit + Garment Steamer + Styling Pin & Tape Box",
      popular: true,
      features: [
        "Hingga 3 kali perubahan gaya riasan dan tatanan rambut",
        "Termasuk jasa steaming dan fitting pakaian on-set",
        "Kurasi aksesoris pelengkap dari arsip styling",
        "Standby penuh selama 8 jam pemotretan katalog",
      ],
    },
    {
      tier: "CAMPAIGN",
      title: "High-Fashion Editorial & Hero Campaign Direction",
      subtitle: "Arahan visual konsep penuh, avant-garde makeup & arsip wardrobe",
      price: "Rp 6.000.000",
      unit: "proyek",
      capacityDuration: "Full Production Day + Moodboard Development",
      deliverablesSummary: "Creative Direction, Avant-Garde Looks & Full Styling Archive",
      usageRights: "Lisensi Penuh (Cetak, Billboard, & Digital Internasional)",
      equipmentIncluded: "Dual MUA & Stylist Team + Akses 200+ Arsip Wardrobe",
      features: [
        "Penyusunan moodboard konsep kecantikan dan gaya busana",
        "Akses bebas ke 200+ potong arsip pakaian dan aksesoris kurasi",
        "Tim beranggotakan 2 orang (Lead MUA + Assistant Stylist)",
        "Dukungan SPK legal terpadu standar ekosistem RAMU",
      ],
    },
  ];

  await prisma.asset.upsert({
    where: { id: "00000000-0000-0000-0000-000000001003" },
    update: {
      name: "Paket Jasa Rias & Styling Glow & Form Artistry",
      subtype: "COMMERCIAL_SERVICE_PACKAGES",
      description: "Tarif resmi layanan MUA dan Fashion Stylist untuk lookbook dan kampanye mode.",
      attributes: { service_packages: muaPackages },
    },
    create: {
      id: "00000000-0000-0000-0000-000000001003",
      actorId: muaId,
      category: AssetCategory.SKILL_TALENT,
      subtype: "COMMERCIAL_SERVICE_PACKAGES",
      name: "Paket Jasa Rias & Styling Glow & Form Artistry",
      description: "Tarif resmi layanan MUA dan Fashion Stylist untuk lookbook dan kampanye mode.",
      roles: [AssetRole.CAPABILITY],
      attributes: { service_packages: muaPackages },
      sourceType: SourceType.SELF_REPORTED,
      confidenceLevel: ConfidenceLevel.HIGH,
      status: AssetStatus.ACTIVE,
    },
  });


  // -------------------------------------------------------------
  // 5. FASHION BRAND 1: Nala The Label
  // -------------------------------------------------------------
  const brand1Id = '00000000-0000-0000-0000-000000000001';
  console.log("👗 Menyelaraskan profil Brand (Nala The Label)...");

  await prisma.asset.deleteMany({
    where: {
      actorId: brand1Id,
      category: AssetCategory.PORTFOLIO_WORK,
    },
  });

  const brand1Attributes = {
    design_dna: "Contemporary Ready-to-Wear dengan Siluet Minimalis & Wastra Kontemporer",
    sample_sizes_ready: "S & M (Lengkap 18 Looks Siap Photoshoot)",
    sample_skus_count: 18,
    fabric_materials: ["Silk Organza", "Tenun ATBM Jepara", "Eco-dyed Linen", "Cotton Twill"],
    capacity_monthly: "1.500 pcs/bulan",
    brand_category: ["Ready-to-Wear", "Contemporary Modest", "Sustainable Fashion"],
    product_types: ["Dresses", "Tailored Outerwear", "Wide-Leg Trousers", "Handwoven Shawls"],
    target_market: ["Wanita Profesional Urban 22-38 Tahun", "Pencinta Wastra Modern"],
    budget_range: "Rp 5.000.000 - Rp 15.000.000 per kampanye",
    collab_timeline: "1 - 3 Minggu pra-rilis koleksi",
    collab_types: [
      "Resource Sharing / Content Exchange",
      "Co-Branding & Kolaborasi Koleksi",
      "Product Seeding / Gifting",
      "Paid Campaign",
    ],
  };

  const existingBrand1Asset = await prisma.asset.findFirst({
    where: { actorId: brand1Id, category: AssetCategory.WARDROBE_PROP },
  });

  if (existingBrand1Asset) {
    await prisma.asset.update({
      where: { id: existingBrand1Asset.id },
      data: {
        name: "Koleksi Sampel Busana Ready-to-Wear (18 Looks Lengkap)",
        subtype: "Sampel Busana Koleksi",
        description: "Koleksi sampel pakaian siap pakai karya desainer lokal, tersedia dalam ukuran S & M untuk pemotretan lookbook, kampanye editorial, dan video komersial.",
        attributes: brand1Attributes,
      },
    });
  } else {
    await prisma.asset.create({
      data: {
        actorId: brand1Id,
        category: AssetCategory.WARDROBE_PROP,
        subtype: "Sampel Busana Koleksi",
        name: "Koleksi Sampel Busana Ready-to-Wear (18 Looks Lengkap)",
        description: "Koleksi sampel pakaian siap pakai karya desainer lokal, tersedia dalam ukuran S & M untuk pemotretan lookbook, kampanye editorial, dan video komersial.",
        roles: [AssetRole.RESOURCE],
        attributes: brand1Attributes,
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE,
      },
    });
  }

  const brand1Portfolios = [
    {
      name: "Lookbook Editorial SS26 — 'Spora & Siluet'",
      subtype: "Koleksi Lookbook",
      description: "Kampanye busana musim semi/panas yang memadukan keanggunan sutra organza dengan teknik tailoring struktural kontemporer.",
      imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80",
    },
    {
      name: "Koleksi Musim Gugur 2026 — Contemporary Modest (18 Looks)",
      subtype: "Katalog Koleksi",
      description: "Rangkaian busana modest bergaya urban dengan palet warna terakota hangat dan bahan linen ramah lingkungan.",
      imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80",
    },
    {
      name: "Campaign Visual 'Tenun Bernapas' (Parang Modern Series)",
      subtype: "Kampanye Kampus",
      description: "Karya kolaboratif yang merevolusi motif batik parang menjadi outerwear kasual dinamis untuk wanita aktif.",
      imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80",
    },
    {
      name: "E-Commerce Capsule Catalog 2026",
      subtype: "Katalog Toko",
      description: "Materi katalog komersial beresolusi tinggi dengan akurasi warna tajam untuk marketplace dan etalase digital.",
      imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80",
    },
  ];

  for (const p of brand1Portfolios) {
    await prisma.asset.create({
      data: {
        actorId: brand1Id,
        category: AssetCategory.PORTFOLIO_WORK,
        subtype: p.subtype,
        name: p.name,
        description: p.description,
        roles: [AssetRole.CREATIVE_ELEMENT],
        attributes: {
          image_url: p.imageUrl,
          media_type: "IMAGE",
          aspect_ratio: "4:5",
        },
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE,
      },
    });
  }


  // -------------------------------------------------------------
  // 6. FASHION BRAND 2: Atelier Nara
  // -------------------------------------------------------------
  const brand2Id = '00000000-0000-0000-0000-000000000006';
  console.log("🧵 Menyelaraskan profil Brand (Atelier Nara)...");

  await prisma.asset.deleteMany({
    where: {
      actorId: brand2Id,
      category: AssetCategory.PORTFOLIO_WORK,
    },
  });

  const brand2Attributes = {
    design_dna: "Deconstructed Tailoring, Silk Organza & Sustainable Nusantara Fibers",
    sample_sizes_ready: "S & M (14 Looks Sample Lengkap)",
    sample_skus_count: 14,
    fabric_materials: ["Mulberry Silk Organza", "Raw Cotton Tenun ATBM", "Cupro Twill", "Plant-dyed Tencel"],
    capacity_monthly: "800 pcs/bulan (Artisanal Small-Batch)",
    brand_category: ["Avant-Garde Ready-to-Wear", "Designer Independent", "Artisanal Tailoring"],
    product_types: ["Architectural Blazers", "Pleated Skirts", "Draped Silk Blouses", "Statement Vests"],
    target_market: ["Kolektor Mode & Kurator Seni Visual", "Pencinta Pakaian Berkelanjutan"],
    budget_range: "Rp 4.000.000 - Rp 12.000.000 per kampanye",
    collab_timeline: "2 - 4 Minggu pra-rilis koleksi",
    collab_types: [
      "Co-Branding & Kolaborasi Koleksi",
      "Resource Sharing / Content Exchange",
      "Product Seeding / Gifting",
    ],
  };

  const existingBrand2Asset = await prisma.asset.findFirst({
    where: { actorId: brand2Id, category: AssetCategory.WARDROBE_PROP },
  });

  if (existingBrand2Asset) {
    await prisma.asset.update({
      where: { id: existingBrand2Asset.id },
      data: {
        name: "Koleksi Kapsul Busana Deconstructed Silk Organza (14 Looks)",
        subtype: "Sampel Busana Koleksi",
        description: "Rancangan busana eksperimental dengan siluet avant-garde dan bahan serat alami sutra organza, siap untuk kolaborasi visual berkonsep tinggi.",
        attributes: brand2Attributes,
      },
    });
  } else {
    await prisma.asset.create({
      data: {
        actorId: brand2Id,
        category: AssetCategory.WARDROBE_PROP,
        subtype: "Sampel Busana Koleksi",
        name: "Koleksi Kapsul Busana Deconstructed Silk Organza (14 Looks)",
        description: "Rancangan busana eksperimental dengan siluet avant-garde dan bahan serat alami sutra organza, siap untuk kolaborasi visual berkonsep tinggi.",
        roles: [AssetRole.RESOURCE],
        attributes: brand2Attributes,
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE,
      },
    });
  }

  const brand2Portfolios = [
    {
      name: "Deconstructed Silk Organza — Avant-Garde Collection",
      subtype: "Koleksi Avant-Garde",
      description: "Eksplorasi dekonstruksi pola blazer dengan panel kain transparan sutra organza yang memukau di bawah cahaya spotlight studio.",
      imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80",
    },
    {
      name: "Monochrome Drapery & Woven Structural Blazers",
      subtype: "Koleksi Runway",
      description: "Potongan blazer monokrom dengan drapery kain wol tenun tangan yang menonjolkan kekuatan siluet arsitektural.",
      imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80",
    },
    {
      name: "Capsule Collection Spring/Summer — 'Arsitektur Kain'",
      subtype: "Katalog Koleksi",
      description: "Koleksi kapsul musim panas dengan palet warna pasir pantai dan bahan tenun katun bertekstur alami.",
      imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=80",
    },
    {
      name: "Handmade Tenun Jepara Contemporary Outerwear",
      subtype: "Wastra Kontemporer",
      description: "Outerwear uniseks berbahan tenun tangan tradisional dengan potongan oversize modern dan kancing tanduk kerbau alami.",
      imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80",
    },
  ];

  for (const p of brand2Portfolios) {
    await prisma.asset.create({
      data: {
        actorId: brand2Id,
        category: AssetCategory.PORTFOLIO_WORK,
        subtype: p.subtype,
        name: p.name,
        description: p.description,
        roles: [AssetRole.CREATIVE_ELEMENT],
        attributes: {
          image_url: p.imageUrl,
          media_type: "IMAGE",
          aspect_ratio: "4:5",
        },
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE,
      },
    });
  }

  console.log("✅ Berhasil! Seluruh 6 aktor di 5 peran resmi telah diperkaya secara autentik, presisi, dan sesuai rolenya!");
}

main()
  .catch((e) => {
    console.error("❌ Gagal menyelaraskan data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
