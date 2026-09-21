const { PrismaClient, AssetCategory, AssetRole, SourceType, ConfidenceLevel, AssetStatus } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🌟 Memperkaya data atribut spesifik peran (Model, Studio, Brand, Stylist)...");

  // 1. Nadia Larasati (Model)
  const modelActor = await prisma.actor.findFirst({
    where: { name: "Nadia Larasati" },
  });

  if (modelActor) {
    // Upsert / update asset modeling
    const existingAsset = await prisma.asset.findFirst({
      where: { actorId: modelActor.id, subtype: { contains: "Model" } },
    });

    const modelAttributes = {
      height_cm: 175,
      weight_kg: 52,
      bust_waist_hips: "84-60-89 cm",
      clothing_size: "S / 36 EU",
      shoe_size: "39 EU",
      hair_color: "Black / Natural Wave",
      eye_color: "Dark Brown",
      skin_undertone: "Warm Olive / Neutral",
      experience_years: 6,
      specialties: [
        "Editorial Fashion",
        "Lookbook & Catalog",
        "Traditional Wastra & Batik",
        "Commercial Beauty",
        "Runway / Catwalk",
      ],
      comp_card: [
        {
          type: "Headshot / Close-up",
          url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
          caption: "Polaroid Clean Headshot (Natural Lighting, No Makeup)",
        },
        {
          type: "Profile / 45° Angle",
          url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
          caption: "Side Profile Facial Geometry & Jawline",
        },
        {
          type: "Full Body Polaroid",
          url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
          caption: "Full Body Proportion (Minimalist Black Bodysuit)",
        },
      ],
      portfolio_gallery: [
        {
          title: "Editorial Lookbook — Wastra Kontemporer",
          url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80",
          role: "Lead Model",
          client: "Sekar Wangi x Lensa Kreatif",
        },
        {
          title: "High-Fashion Editorial & Drapery",
          url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80",
          role: "Editorial Muse",
          client: "Indonesia Fashion Week Lookbook",
        },
        {
          title: "Minimalist Modern Tailored Suit",
          url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80",
          role: "Commercial Fashion",
          client: "Urban Studio Campaign",
        },
        {
          title: "Heritage Jewelry & Metallic Accents",
          url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=80",
          role: "Macro Beauty Model",
          client: "Kotagede Filigree Campaign",
        },
      ],
      video_reel_title: "Runway & Motion Lookbook 2026 Showreel (0:45)",
    };

    if (existingAsset) {
      await prisma.asset.update({
        where: { id: existingAsset.id },
        data: { attributes: modelAttributes },
      });
    } else {
      await prisma.asset.create({
        data: {
          actorId: modelActor.id,
          category: AssetCategory.CAPABILITY,
          subtype: "Model Lookbook & Commercial",
          name: "Kapabilitas Modeling Editorial & Pose Katalog Fashion",
          description: "Pengalaman modeling busana siap pakai, wastra tradisional, dan high-fashion lookbook",
          roles: [AssetRole.CAPABILITY, AssetRole.CREATIVE_ELEMENT],
          attributes: modelAttributes,
          sourceType: SourceType.SELF_REPORTED,
          confidenceLevel: ConfidenceLevel.HIGH,
          status: AssetStatus.ACTIVE,
        },
      });
    }
    console.log("✓ Nadia Larasati: Comp Card & Measurements diperbarui!");
  }

  // 2. Lensa Kreatif Studio (Studio Foto & Cyclorama)
  const studioActor = await prisma.actor.findFirst({
    where: { name: "Lensa Kreatif Studio" },
  });

  if (studioActor) {
    const studioAsset = await prisma.asset.findFirst({
      where: {
        actorId: studioActor.id,
        OR: [{ category: "RESOURCE" }, { subtype: { contains: "Studio" } }, { name: { contains: "Studio" } }],
      },
    });

    const studioAttributes = {
      area_sqm: 120,
      ceiling_height_m: 4.5,
      cyclorama_type: "Seamless White L-Curve (8m x 6m x 4.5m)",
      electrical_capacity: "16,500 Watt (3-Phase Industrial)",
      floor_type: "Epoxy Matte White (Anti-Slip)",
      facilities: [
        "Ruang Rias Hollywood Lights (2 Kursi Hidrolik & Cermin Lampu 5500K)",
        "Fitting Room Pribadi + Garment Steamer Philips Pro 2200W",
        "Tethering Station (Apple Studio Display 27\" + Mac Mini M2 Pro + Capture One 23)",
        "Client Lounge Berpendingin AC + Bar Espresso & Kulkas Minuman",
        "Area Parkir Khusus Kru (Muat 4 Mobil & Area Bongkar Muat)",
        "Koneksi Internet Dedicated Fiber 150 Mbps",
      ],
      gear_included: [
        "3x Godox QT600 III High-Speed Sync Strobe (Bowens Mount)",
        "2x Aputure Amaran 200d Bi-Color (Lampu Video Kontinu)",
        "1x Octabox 120cm dengan Grid Honeycomb",
        "2x Stripbox 35x160cm dengan Grid",
        "1x Beauty Dish 55cm dengan Diffuser & Grid",
        "6x Heavy-Duty C-Stand Kupo dengan Grip Arm",
        "1x Avenger Heavy Boom Stand 3.5m",
        "4x Polyfoam V-Flat (Hitam/Putih)",
        "6x Roll Background Seamless Paper (Super White, Black, Neutral Grey, Terracotta, Tan, Mocca)",
      ],
      studio_gallery: [
        {
          title: "Cyclorama Curve Utama (Seamless White)",
          url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1000&q=80",
          caption: "Area kurva cyclorama 8x6m dengan tinggi plafon 4.5m, ideal untuk pemotretan multi-model dan lookbook fashion.",
        },
        {
          title: "Overhead Boom & Strobe Setup",
          url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80",
          caption: "Peralatan lampu studio Godox & Aputure siap pakai dengan kontrol trigger nirkabel.",
        },
        {
          title: "Makeup & Styling Station Berlampu",
          url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=80",
          caption: "Area rias ber-AC dengan pencahayaan akurat (CRI 98+) untuk kesiapan model sebelum on-set.",
        },
        {
          title: "Behind-The-Scenes Sesi Pemotretan Lookbook",
          url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1000&q=80",
          caption: "Alur kerja kolaborasi profesional antara kru fotografer, stylist, dan model.",
        },
      ],
    };

    if (studioAsset) {
      await prisma.asset.update({
        where: { id: studioAsset.id },
        data: { attributes: studioAttributes },
      });
    } else {
      await prisma.asset.create({
        data: {
          actorId: studioActor.id,
          category: AssetCategory.RESOURCE,
          subtype: "Studio Foto Cyclorama",
          name: "Studio Foto Indoor Lengkap dengan Cyclorama 120m²",
          description: "Studio 120m² dengan cyclorama putih, lighting profesional, makeup station, dan set area",
          roles: [AssetRole.RESOURCE, AssetRole.ENABLER],
          attributes: studioAttributes,
          sourceType: SourceType.SELF_REPORTED,
          confidenceLevel: ConfidenceLevel.HIGH,
          status: AssetStatus.ACTIVE,
        },
      });
    }
    console.log("✓ Lensa Kreatif Studio: Spesifikasi Cyclorama & Gear diperbarui!");
  }

  // 3. Sanggar Batik Sekar Wangi (Desainer & Brand Fesyen Wastra)
  const batikActor = await prisma.actor.findFirst({
    where: { name: "Sanggar Batik Sekar Wangi" },
  });

  if (batikActor) {
    const batikAsset = await prisma.asset.findFirst({
      where: { actorId: batikActor.id },
    });

    const batikAttributes = {
      design_dna: "Batik Tulis Motif Klasik & Pewarna Alam Kontemporer",
      sample_sizes_ready: "Ukuran S & M (Tersedia 15 set busana sampel siap pemotretan)",
      fabric_materials: ["Sutra Habutai", "Katun Primissima Halus", "Linen Organik"],
      capacity_monthly: "300 lembar kain / 50 busana jadi",
      lead_time_days: 21,
      brand_gallery: [
        {
          title: "Koleksi Lookbook 'Parang Kontemporer' 2026",
          url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80",
          caption: "Pewarnaan alam indigo & manggis pada siluet gaun modern.",
        },
        {
          title: "Detail Canting Tulis Motif Kawung Halus",
          url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80",
          caption: "Pengerjaan presisi handmade oleh pengrajin berpengalaman 15+ tahun.",
        },
        {
          title: "Kimono Outerwear Etnik Urban",
          url: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1000&q=80",
          caption: "Rancangan busana siap pakai untuk kolaborasi kampanye generasi muda.",
        },
      ],
    };

    if (batikAsset) {
      await prisma.asset.update({
        where: { id: batikAsset.id },
        data: { attributes: batikAttributes },
      });
      console.log("✓ Sanggar Batik Sekar Wangi: Brand & Material DNA diperbarui!");
    }
  }

  // 4. Aruna Visual & Styling Studio (Fashion Stylist)
  const stylistActor = await prisma.actor.findFirst({
    where: { name: "Aruna Visual & Styling Studio" },
  });

  if (stylistActor) {
    const stylistAsset = await prisma.asset.findFirst({
      where: { actorId: stylistActor.id, subtype: { contains: "Styling" } },
    });

    const stylistAttributes = {
      styling_specialties: ["Editorial Lookbook", "Contemporary Wastra Mix", "Streetwear High-Fashion", "Color Theory Moodboard"],
      wardrobe_archive_count: 200,
      styling_gallery: [
        {
          title: "Moodboard Konsep & Palet Warna Lookbook",
          url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80",
          caption: "Pengarahan gaya perpaduan kain tradisional nusantara dengan siluet monokromatis.",
        },
        {
          title: "Archive Wardrobe & Koleksi Aksesoris On-Set",
          url: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=80",
          caption: "200+ potong koleksi pakaian arsip vintage dan aksesoris etnik siap pinjam untuk pemotretan.",
        },
      ],
    };

    if (stylistAsset) {
      await prisma.asset.update({
        where: { id: stylistAsset.id },
        data: { attributes: stylistAttributes },
      });
      console.log("✓ Aruna Visual & Styling Studio: Styling Gallery diperbarui!");
    }
  }

  // 5. Commercial Photographer: Baskara Visuals
  const photogActor = await prisma.actor.findFirst({
    where: { name: "Baskara Visuals" },
  });

  if (photogActor) {
    const photogAsset = await prisma.asset.findFirst({
      where: { actorId: photogActor.id, subtype: { contains: "Photography" } },
    });

    const photogAttributes = {
      primary_camera: "Sony A7RV (61MP) & G-Master Lenses",
      secondary_camera: "Sony A7SIII (4K 120fps)",
      lenses: ["Sony 90mm f/2.8 Macro G OSS", "Sony 24-70mm f/2.8 GM II", "Sony 35mm f/1.4 GM", "Sony 85mm f/1.4 GM"],
      lighting_gear: ["2x Godox AD600 Pro", "3x Aputure LS 300d II", "Softboxes & Modifiers (Octa, Strip, Snoot)"],
      drone_aerial: true,
      video_format: "4K 10-bit 4:2:2 (S-Log3)",
      editing_software: ["Capture One Pro", "Adobe Photoshop", "DaVinci Resolve Studio"],
      specialties: ["Product / Beverage Commercials", "Fashion Editorial", "Lifestyle Kampanye Brand"],
      delivery_time_days: 7,
      rate_starting_at: "Rp 3.500.000 / Day",
      portfolio_gallery: [
        {
          title: "Kampanye Peluncuran Minuman Artisan 'Kopi Senja'",
          url: "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=1000&q=80",
          role: "Lead Photographer",
          client: "Kopi Senja Roastery",
          caption: "Komersial foto produk dengan cipratan air (splash photography) menggunakan high-speed sync.",
        },
        {
          title: "Editorial Lookbook Musim Panas",
          url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=80",
          role: "Director of Photography",
          client: "Studio Mode Lokal",
          caption: "Pemotretan fashion editorial di lokasi luar ruangan dengan pencahayaan natural dan reflektor.",
        },
      ],
    };

    if (photogAsset) {
      await prisma.asset.update({
        where: { id: photogAsset.id },
        data: { attributes: photogAttributes },
      });
      console.log("✓ Baskara Visuals: Photography Specs diperbarui!");
    }
  }

  // 6. Graphic & Brand Designer: Kreatif Jiwa Studio
  const designerActor = await prisma.actor.findFirst({
    where: { name: "Kreatif Jiwa Studio" },
  });

  if (designerActor) {
    const designerAsset = await prisma.asset.findFirst({
      where: { actorId: designerActor.id, subtype: { contains: "Design" } },
    });

    const designerAttributes = {
      primary_software: ["Adobe Illustrator", "Adobe Photoshop", "Figma", "Blender 3D"],
      design_disciplines: ["Brand Identity & Logo", "Packaging & Label Design", "Key Visual (KV) Advertising", "Social Media Templates"],
      deliverables: ["Vector Master Files (AI/EPS)", "Brand Guidelines (PDF)", "Print-Ready PDF", "3D Product Mockups"],
      style_dna: "Minimalis, Urban Kontemporer, dan Tipografi Eksperimental dengan Palet Warna Vibran.",
      rate_starting_at: "Rp 5.000.000 / Project",
      portfolio_gallery: [
        {
          title: "Rebranding & Kemasan Minuman 'Tropis Botani'",
          url: "https://images.unsplash.com/photo-1559564106-9b578c772058?auto=format&fit=crop&w=1000&q=80",
          role: "Art Director & Designer",
          client: "Tropis Botani F&B",
          caption: "Desain identitas visual menyeluruh termasuk label botol kaca, kardus kemasan, dan panduan palet merek.",
        },
        {
          title: "Key Visual Festival Kriya Nusantara",
          url: "https://images.unsplash.com/photo-1628102491629-77858ab5721d?auto=format&fit=crop&w=1000&q=80",
          role: "Graphic Designer",
          client: "Yayasan Kriya Budaya",
          caption: "Desain poster, tiket, dan identitas digital untuk acara festival kerajinan tangan nasional.",
        },
      ],
    };

    if (designerAsset) {
      await prisma.asset.update({
        where: { id: designerAsset.id },
        data: { attributes: designerAttributes },
      });
      console.log("✓ Kreatif Jiwa Studio: Design Specs diperbarui!");
    }
  }

  console.log("🎉 Selesai memperkaya data demo portofolio dan spesifikasi peran!");
}

main()
  .catch((e) => {
    console.error("Error seeding rich specs:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
