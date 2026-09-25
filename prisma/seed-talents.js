const { PrismaClient, ActorType, AssetCategory, AssetRole, SourceType, ConfidenceLevel, AssetStatus, GoalCategory, GoalStatus, NeedCategory, NeedStatus } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const demoProfile = await prisma.profile.findFirst({
    where: { email: 'demo@ramu.id' }
  });

  if (!demoProfile) {
    console.log('Demo profile not found, skipping talent seed.');
    return;
  }

  // 1. Fashion Model: Nadia Larasati
  const modelActor = await prisma.actor.upsert({
    where: { id: '00000000-0000-0000-0000-000000000005' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000005',
      ownerUserId: demoProfile.id,
      name: 'Nadia Larasati',
      actorType: ActorType.INDIVIDUAL,
      sector: 'Modeling / Fashion Runway & Editorial',
      location: 'Jakarta Selatan',
      description: 'Model editorial dan lookbook profesional berpengalaman 6+ tahun dalam kampanye fashion brand lokal, Jakarta Fashion Week, dan katalog wastra nusantara.',
      contactEmail: 'nadia.larasati@talenta.ramu.id',
      status: 'ACTIVE'
    }
  });

  await prisma.asset.createMany({
    skipDuplicates: true,
    data: [
      {
        actorId: modelActor.id,
        category: AssetCategory.SKILL_TALENT,
        subtype: 'Model Lookbook & Commercial',
        name: 'Kapabilitas Modeling Editorial & Pose Katalog Fashion',
        description: 'Pengalaman modeling busana siap pakai, wastra tradisional, dan high-fashion lookbook',
        roles: [AssetRole.CAPABILITY, AssetRole.CREATIVE_ELEMENT],
        attributes: { height_cm: 175, lookbook_sessions_completed: 45 },
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE
      }
    ]
  });

  await prisma.goal.create({
    data: {
      actorId: modelActor.id,
      category: GoalCategory.BRAND_AWARENESS,
      title: 'Menjadi muse & model utama untuk kampanye wastra kontemporer nasional',
      description: 'Menargetkan 10 kolaborasi lookbook wastra berkualitas tinggi per tahun',
      priority: 5,
      status: GoalStatus.ACTIVE
    }
  });

  await prisma.need.create({
    data: {
      actorId: modelActor.id,
      category: NeedCategory.CREW_NEED,
      title: 'Kolaborasi dengan desainer busana & fotografer studio cyclorama',
      description: 'Sesi pemotretan lookbook tematik dengan arahan kreatif profesional',
      priority: 5,
      status: NeedStatus.ACTIVE
    }
  });

  // 2. Fashion Stylist & Direction: Aruna Styling Studio
  const stylistActor = await prisma.actor.upsert({
    where: { id: '00000000-0000-0000-0000-000000000006' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000006',
      ownerUserId: demoProfile.id,
      name: 'Aruna Visual & Styling Studio',
      actorType: ActorType.STUDIO,
      sector: 'Fashion Styling & Creative Direction',
      location: 'Bandung, Jawa Barat',
      description: 'Kolektif stylist dan pengarah gaya busana untuk kampanye editorial fashion, lookbook katalog, dan video sinematik brand lokal.',
      contactEmail: 'hello@arunastyling.id',
      status: 'ACTIVE'
    }
  });

  await prisma.asset.createMany({
    skipDuplicates: true,
    data: [
      {
        actorId: stylistActor.id,
        category: AssetCategory.SKILL_TALENT,
        subtype: 'Fashion Styling & Wardrobe Direction',
        name: 'Layanan Wardrobe Styling & Moodboard Konsep Visual',
        description: 'Kurasi busana, pencocokan aksesoris, dan pengarahan gaya on-set selama pemotretan',
        roles: [AssetRole.CAPABILITY, AssetRole.ENABLER],
        attributes: { team_size: 4, wardrobe_pieces_archived: 200 },
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE
      },
      {
        actorId: stylistActor.id,
        category: AssetCategory.EQUIPMENT,
        subtype: 'Koleksi Wardrobe & Aksesoris',
        name: 'Koleksi Wardrobe & Aksesoris Vintage / Etnik Kontemporer',
        description: 'Inventori pakaian dan pelengkap styling siap pakai untuk sesi pemotretan lookbook',
        roles: [AssetRole.RESOURCE, AssetRole.COMPONENT],
        attributes: { pieces_count: 150 },
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE
      }
    ]
  });

  await prisma.goal.create({
    data: {
      actorId: stylistActor.id,
      category: GoalCategory.PORTFOLIO_BUILDING,
      title: 'Membangun jejaring dengan 20+ studio foto dan desainer wastra di Jawa & Bali',
      description: 'Menjadi partner styling terpercaya untuk produksi lookbook profesional',
      priority: 4,
      status: GoalStatus.ACTIVE
    }
  });

  await prisma.need.create({
    data: {
      actorId: stylistActor.id,
      category: NeedCategory.LOCATION_NEED,
      title: 'Akses ke studio foto cyclorama indoor dengan tata cahaya profesional',
      description: 'Kebutuhan studio foto berukuran minimal 80m² untuk sesi styling lookbook',
      priority: 4,
      status: NeedStatus.ACTIVE
    }
  });

  // 3. Commercial Photographer & Videographer: Baskara Visuals
  const photogActor = await prisma.actor.upsert({
    where: { id: '00000000-0000-0000-0000-000000000007' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000007',
      ownerUserId: demoProfile.id,
      name: 'Baskara Visuals',
      actorType: ActorType.STUDIO,
      sector: 'Fotografi & Produksi Visual',
      location: 'Jakarta Selatan',
      description: 'Studio produksi visual spesialis fotografi produk komersial, editorial fashion, dan video kampanye sinematik.',
      contactEmail: 'hello@baskaravisuals.id',
      status: 'ACTIVE'
    }
  });

  await prisma.asset.createMany({
    skipDuplicates: true,
    data: [
      {
        actorId: photogActor.id,
        category: AssetCategory.SKILL_TALENT,
        subtype: 'Commercial Photography & Videography',
        name: 'Produksi Visual Resolusi Tinggi',
        description: 'Fotografi produk, lookbook fashion, dan produksi video iklan dengan standar industri',
        roles: [AssetRole.CAPABILITY, AssetRole.ENABLER],
        attributes: { team_size: 3 },
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE
      }
    ]
  });

  await prisma.goal.create({
    data: {
      actorId: photogActor.id,
      category: GoalCategory.REVENUE_GENERATION,
      title: 'Mendapatkan 5 klien korporat / brand besar di Q4',
      description: 'Fokus pada proyek kampanye komersial dengan budget premium',
      priority: 4,
      status: GoalStatus.ACTIVE
    }
  });

  await prisma.need.create({
    data: {
      actorId: photogActor.id,
      category: NeedCategory.CREW_NEED,
      title: 'Talenta Model & Fashion Stylist untuk portfolio in-house',
      description: 'Mencari model berkarakter dan stylist berpengalaman untuk pemotretan tes',
      priority: 3,
      status: NeedStatus.ACTIVE
    }
  });

  // 4. Brand & Graphic Designer: Kreatif Jiwa
  const designerActor = await prisma.actor.upsert({
    where: { id: '00000000-0000-0000-0000-000000000008' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000008',
      ownerUserId: demoProfile.id,
      name: 'Kreatif Jiwa Studio',
      actorType: ActorType.STUDIO,
      sector: 'Desain Komunikasi Visual',
      location: 'Bandung, Jawa Barat',
      description: 'Studio desain multidisiplin yang berfokus pada identitas merek, desain kemasan, dan arahan seni kampanye visual.',
      contactEmail: 'hi@kreatifjiwa.co',
      status: 'ACTIVE'
    }
  });

  await prisma.asset.createMany({
    skipDuplicates: true,
    data: [
      {
        actorId: designerActor.id,
        category: AssetCategory.SKILL_TALENT,
        subtype: 'Brand Identity & Packaging Design',
        name: 'Layanan Desain Grafis & Identitas Merek',
        description: 'Pembuatan logo, buku panduan merek, dan desain kemasan produk',
        roles: [AssetRole.CAPABILITY, AssetRole.CREATIVE_ELEMENT],
        attributes: { team_size: 2 },
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE
      }
    ]
  });

  await prisma.goal.create({
    data: {
      actorId: designerActor.id,
      category: GoalCategory.BRAND_AWARENESS,
      title: 'Ekspansi layanan ke sektor Fashion & Lifestyle premium',
      description: 'Menargetkan brand fesyen independen yang membutuhkan penyegaran visual identitas',
      priority: 5,
      status: GoalStatus.ACTIVE
    }
  });

  await prisma.need.create({
    data: {
      actorId: designerActor.id,
      category: NeedCategory.PUBLICATION_NEED,
      title: 'Klien Label Fashion & Studio yang siap rebranding',
      description: 'Membutuhkan akses langsung ke desainer dan pemilik label untuk menawarkan jasa identitas visual',
      priority: 4,
      status: NeedStatus.ACTIVE
    }
  });

  // 5. Videographer & Fashion Film Director: Sinema Visual
  const videographerActor = await prisma.actor.upsert({
    where: { id: '00000000-0000-0000-0000-000000000009' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000009',
      ownerUserId: demoProfile.id,
      name: 'Sinema Visual',
      actorType: ActorType.STUDIO,
      sector: 'Videografi & Fashion Film',
      location: 'Jakarta Selatan',
      description: 'Production house butik spesialis fashion film, music video, dan kampanye digital sinematik untuk brand fashion dan kecantikan.',
      contactEmail: 'contact@sinemavisual.id',
      status: 'ACTIVE'
    }
  });

  await prisma.asset.createMany({
    skipDuplicates: true,
    data: [
      {
        actorId: videographerActor.id,
        category: AssetCategory.SKILL_TALENT,
        subtype: 'Cinematography & Directing',
        name: 'Produksi Fashion Film & Video Komersial',
        description: 'Penyutradaraan, sinematografi dengan kamera RED/ARRI, dan post-production color grading',
        roles: [AssetRole.CAPABILITY, AssetRole.ENABLER],
        attributes: { team_size: 4 },
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE
      }
    ]
  });

  await prisma.goal.create({
    data: {
      actorId: videographerActor.id,
      category: GoalCategory.BRAND_AWARENESS,
      title: 'Berkolaborasi dengan brand streetwear dan high-fashion lokal untuk membuat fashion film',
      description: 'Menciptakan karya portfolio fashion film yang bisa diikutsertakan ke festival film pendek/fashion internasional',
      priority: 5,
      status: GoalStatus.ACTIVE
    }
  });

  await prisma.need.create({
    data: {
      actorId: videographerActor.id,
      category: NeedCategory.CREW_NEED,
      title: 'Fashion Brand & Creative Director untuk proyek kolaborasi',
      description: 'Mencari brand yang bersedia menyediakan wardrobe penuh untuk fashion film eksklusif',
      priority: 5,
      status: NeedStatus.ACTIVE
    }
  });

  console.log('✓ Sukses menambahkan Talenta & Studio (Model, Stylist, Fotografer, Desainer, Videografer)!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
