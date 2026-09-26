const { PrismaClient, AssetCategory, AssetRole, SourceType, ConfidenceLevel, AssetStatus } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("📸 Memperkaya data bukti fisik kamera, lensa, dan aset visual...");

  const gearShowcase = [
    {
      id: "gear-cam-1",
      name: "Sony Alpha A7R V (61MP Full-Frame)",
      category: "Kamera Utama",
      specs: "Sensor 61MP Exmor R BSI CMOS • 8K 24p / 4K 60p 10-bit 4:2:2 • AI Autofocus Real-Time Tracking • Dual Slot CFexpress Type-A",
      tag: "Body Kamera Utama",
      condition: "Kondisi Prima (Mint 10/10) • Sensor Cleaned",
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: "gear-lens-1",
      name: "Sony FE 24-70mm f/2.8 GM II",
      category: "Lensa Zoom Unggulan",
      specs: "Aperture f/2.8 Constant • Elemen XA (Extreme Aspherical) • Nano AR Coating II • Linear XD Motor • Filter 82mm",
      tag: "Lensa Kerja Fleksibel",
      condition: "Optik Bersih Bebas Jamur / Debu • Kalibrasi Presisi",
      imageUrl: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: "gear-lens-2",
      name: "Sony FE 85mm f/1.4 GM (Portrait Prime)",
      category: "Lensa Prime Portrait",
      specs: "Aperture f/1.4 Ultra-Fast • 11-Blade Circular Bokeh • ED Glass Element • Ideal untuk Foto Fashion & Beauty Editorial",
      tag: "Lensa Karakter Editorial",
      condition: "Creamy Bokeh • Resolusi Sudut-ke-Sudut Maksimal",
      imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: "gear-lens-3",
      name: "Sony FE 90mm f/2.8 Macro G OSS",
      category: "Lensa Makro & Detail",
      specs: "Rasio Perbesaran 1:1 True Macro • Optical SteadyShot • Resolusi Ekstrem untuk Tekstur Kain & Perhiasan",
      tag: "Lensa Detail Tekstur",
      condition: "Fokus Internal • Direct Drive SSM",
      imageUrl: "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: "gear-light-1",
      name: "Godox AD600 Pro TTL Strobe Kit (x2)",
      category: "Lighting & Modifiers",
      specs: "Daya 600Ws • High-Speed Sync 1/8000s • Bowens Mount • 120cm Octabox Grid & Stripbox 35x160cm • Heavy C-Stand Kupo",
      tag: "Pencahayaan Studio & Lokasi",
      condition: "Wireless Trigger XPro-S • Baterai Lithium 360 Full Flash",
      imageUrl: "https://images.unsplash.com/photo-1520697830682-bbb6e85e2b0b?auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: "gear-tether-1",
      name: "Tethering Station & Capture One Pro",
      category: "Digital Workstation",
      specs: "Apple MacBook Pro M3 Max • EIZO ColorEdge 27\" Calibrated Display • TetherPro High-Visibility USB-C • Capture One Pro 23 Live Feed",
      tag: "Live Client Preview",
      condition: "Kalibrasi Warna Delta-E < 1 • Real-Time Grading On-Set",
      imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80"
    }
  ];

  const portfolioGallery = [
    {
      title: "Lookbook Editorial — Koleksi Wastra Nusantara 2026",
      url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80",
      role: "Lead Fashion Photographer",
      client: "Atelier Mode x Sekar Wangi",
      caption: "Pemotretan editorial fashion di studio cyclorama dengan pencahayaan dramatis dan tekstur kain yang tajam."
    },
    {
      title: "Kampanye High-Fashion Editorial 'Monochrome Drapery'",
      url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80",
      role: "Director of Photography",
      client: "Harper & Modus Magazine",
      caption: "Komposisi siluet kontemporer dengan lensa 85mm f/1.4 GM pada bukaan lebar."
    },
    {
      title: "Catalog Komersial Busana Siap Pakai",
      url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80",
      role: "Commercial Photographer",
      client: "Urban Tailored Lookbook",
      caption: "Akurasi warna bahan dan draping busana yang siap untuk materi promosi e-commerce dan billboard."
    }
  ];

  // Update Atelier Test Studio (ID: c4b4851e-52b7-43cb-8888-4dd396963fae)
  const atelierActor = await prisma.actor.findUnique({
    where: { id: "c4b4851e-52b7-43cb-8888-4dd396963fae" }
  });

  if (atelierActor) {
    const existingPhotoAsset = await prisma.asset.findFirst({
      where: {
        actorId: atelierActor.id,
        category: "EQUIPMENT"
      }
    });

    const photoAttributes = {
      primary_camera: "Sony Alpha A7R V (61MP Full-Frame BSI)",
      secondary_camera: "Sony Alpha A7 IV (33MP Backup Body)",
      lenses: [
        "Sony FE 24-70mm f/2.8 GM II",
        "Sony FE 85mm f/1.4 GM",
        "Sony FE 90mm f/2.8 Macro G OSS"
      ],
      lighting_gear: [
        "2x Godox AD600 Pro (600Ws TTL Strobe)",
        "Octabox 120cm Honeycomb Grid",
        "2x Stripbox 35x160cm",
        "Aputure Amaran 200x Bi-Color LED"
      ],
      drone_aerial: true,
      video_format: "4K 60fps 10-bit 4:2:2 (S-Log3 / S-Cinetone)",
      editing_software: ["Capture One Pro 23", "Adobe Photoshop CC", "DaVinci Resolve Studio"],
      specialties: ["Fashion Editorial", "Commercial Lookbook", "Beauty & Jewelry Macro", "High-End Retouching"],
      delivery_time_days: 5,
      rate_starting_at: "Rp 3.500.000 / Sesi",
      gear_showcase: gearShowcase,
      portfolio_gallery: portfolioGallery
    };

    if (existingPhotoAsset) {
      await prisma.asset.update({
        where: { id: existingPhotoAsset.id },
        data: {
          name: "Kit Kamera Full-Frame Sony A7R V & Lensa G-Master Lengkap",
          description: "Kamera 61MP, lensa portrait 85mm f/1.4, lensa zoom 24-70mm f/2.8, makro 90mm, dan lighting strobe studio siap on-set",
          attributes: photoAttributes,
          roles: [AssetRole.INPUT, AssetRole.RESOURCE, AssetRole.CAPABILITY]
        }
      });
    } else {
      await prisma.asset.create({
        data: {
          actorId: atelierActor.id,
          category: AssetCategory.EQUIPMENT,
          subtype: "Kamera & Lensa Produksi",
          name: "Kit Kamera Full-Frame Sony A7R V & Lensa G-Master Lengkap",
          description: "Kamera 61MP, lensa portrait 85mm f/1.4, lensa zoom 24-70mm f/2.8, makro 90mm, dan lighting strobe studio siap on-set",
          roles: [AssetRole.INPUT, AssetRole.RESOURCE, AssetRole.CAPABILITY],
          attributes: photoAttributes,
          sourceType: SourceType.SELF_REPORTED,
          confidenceLevel: ConfidenceLevel.HIGH,
          status: AssetStatus.ACTIVE
        }
      });
    }

    // Juga perbarui asset skills agar memiliki preview gambar
    const skillAssets = await prisma.asset.findMany({
      where: { actorId: atelierActor.id, category: "SKILL_TALENT" }
    });

    for (const skill of skillAssets) {
      const isAnalog = skill.name.toLowerCase().includes("analog");
      await prisma.asset.update({
        where: { id: skill.id },
        data: {
          description: isAnalog 
            ? "Penguasaan teknik kamera analog film 35mm dan medium format (Hasselblad / Mamiya) untuk visual berkarakter estetika grain autentik."
            : "Pengalaman mengarahkan pemotretan editorial fashion majalah, lookbook desainer, dan kampanye komersial dengan standar pencahayaan profesional.",
          attributes: {
            ...((skill.attributes && typeof skill.attributes === "object") ? skill.attributes : {}),
            image_url: isAnalog
              ? "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80"
              : "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80",
            verified_badge: "Terverifikasi Ekosistem"
          }
        }
      });
    }

    console.log("✓ Atelier Test Studio: Gear & Foto Kamera Lensa Berhasil Diperkaya!");
  }

  // Update Test Creative 99 & Nadia jika ada
  const otherPhotogs = await prisma.actor.findMany({
    where: {
      OR: [
        { name: "Test Creative 99" },
        { name: "Nadia" },
        { sector: { contains: "Photographer" } }
      ],
      id: { not: "c4b4851e-52b7-43cb-8888-4dd396963fae" }
    }
  });

  for (const photog of otherPhotogs) {
    const existingAsset = await prisma.asset.findFirst({
      where: { actorId: photog.id, category: "EQUIPMENT" }
    });

    const photoAttributes = {
      primary_camera: "Canon EOS R5 (45MP Full-Frame)",
      secondary_camera: "Canon EOS R6 Mark II",
      lenses: [
        "Canon RF 28-70mm f/2L USM",
        "Canon RF 85mm f/1.2L USM DS",
        "Canon RF 100mm f/2.8L Macro IS USM"
      ],
      lighting_gear: [
        "Profoto B10X Plus (500Ws) Duo Kit",
        "Profoto OCF Beauty Dish Silver",
        "2x Profoto Softbox 1x3'"
      ],
      drone_aerial: true,
      video_format: "4K 60fps 10-bit 4:2:2 C-Log3",
      editing_software: ["Capture One Pro", "Adobe Photoshop CC"],
      specialties: ["Fashion Editorial", "Commercial Beauty", "Brand Lookbook"],
      delivery_time_days: 7,
      rate_starting_at: "Rp 4.000.000 / Hari",
      gear_showcase: gearShowcase,
      portfolio_gallery: portfolioGallery
    };

    if (existingAsset) {
      await prisma.asset.update({
        where: { id: existingAsset.id },
        data: { attributes: photoAttributes }
      });
    } else {
      await prisma.asset.create({
        data: {
          actorId: photog.id,
          category: AssetCategory.EQUIPMENT,
          subtype: "Kamera & Lensa Produksi",
          name: "Kit Kamera Canon EOS R5 & Lensa L-Series Lengkap",
          description: "Kamera 45MP, lensa RF 28-70mm f/2L, 85mm f/1.2L, dan lighting Profoto B10X siap on-set",
          roles: [AssetRole.INPUT, AssetRole.RESOURCE, AssetRole.CAPABILITY],
          attributes: photoAttributes,
          sourceType: SourceType.SELF_REPORTED,
          confidenceLevel: ConfidenceLevel.HIGH,
          status: AssetStatus.ACTIVE
        }
      });
    }
    console.log(`✓ ${photog.name}: Gear & Foto Kamera Diperbarui!`);
  }

  console.log("🎉 Selesai memperkaya data bukti fisik peralatan!");
}

main()
  .catch((e) => {
    console.error("Error enriching gear:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
