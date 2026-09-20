import {
  PrismaClient,
  ActorStatus,
  ActorType,
  AssetCategory,
  AssetRole,
  AssetStatus,
  GoalCategory,
  GoalStatus,
  NeedCategory,
  NeedStatus,
  ConstraintType,
  ConstraintSeverity,
  Negotiability,
  SourceType,
  ConfidenceLevel,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Menjalankan Seeding Dataset Golden Demo (Phase 1 + Phase 2)...");

  const demoProfile = await prisma.profile.upsert({
    where: { email: "demo@ramu.id" },
    update: {},
    create: {
      email: "demo@ramu.id",
      displayName: "Demo Curator",
      bio: "Kurator & Administrator Golden Demo Skenario RAMU",
    },
  });
  console.log(`✓ Profile: ${demoProfile.displayName} (${demoProfile.id})`);

  // ─────────────────────────────────────
  // 2. Actor: Sanggar Batik Sekar Wangi
  // ─────────────────────────────────────
  const batik = await prisma.actor.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      ownerUserId: demoProfile.id,
      name: "Sanggar Batik Sekar Wangi",
      actorType: ActorType.STUDIO,
      sector: "Fashion / Kriya Tekstil",
      location: "DI Yogyakarta",
      description:
        "Produsen batik tulis dan cap tradisional dengan motif klasik Yogyakarta. Kapasitas workshop mandiri dan fokus ekspansi ke pasar generasi muda.",
      contactEmail: "kontak@batiksekarwangi.id",
      status: ActorStatus.ACTIVE,
    },
  });

  // Assets — Batik
  await prisma.asset.createMany({
    skipDuplicates: true,
    data: [
      {
        actorId: batik.id,
        category: AssetCategory.MATERIAL,
        subtype: "Batik Tulis",
        name: "Kain Batik Tulis Motif Parang & Kawung",
        description: "Batik tulis premium motif klasik Yogyakarta dengan pewarna alam",
        roles: [AssetRole.INPUT, AssetRole.COMPONENT, AssetRole.CREATIVE_ELEMENT],
        attributes: { capacity: 300, unit: "lembar/bulan", minimum_order: 50, lead_time_days: 21 },
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE,
      },
      {
        actorId: batik.id,
        category: AssetCategory.CAPABILITY,
        subtype: "Keahlian Membatik",
        name: "Keahlian Membatik Tulis & Cap Tradisional",
        description: "Tim pengrajin berpengalaman 15+ tahun dalam teknik batik tulis dan cap",
        roles: [AssetRole.CAPABILITY, AssetRole.ENABLER],
        attributes: { team_size: 8, experience_years: 15 },
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE,
      },
    ],
  });

  // Goals — Batik
  const batikGoal = await prisma.goal.create({
    data: {
      actorId: batik.id,
      category: GoalCategory.MARKET_EXPANSION,
      title: "Menjangkau pasar konsumen muda (Gen-Z & Millennial) via fashion kontemporer",
      description: "Target: 30% peningkatan penjualan ke segmen 18–35 tahun dalam 12 bulan",
      priority: 5,
      status: GoalStatus.ACTIVE,
    },
  });

  // Needs — Batik
  await prisma.need.createMany({
    data: [
      {
        actorId: batik.id,
        relatedGoalId: batikGoal.id,
        category: NeedCategory.CREATIVE_NEED,
        title: "Fotografer produk profesional untuk lookbook koleksi batik kontemporer",
        description: "Dibutuhkan sesi pemotretan katalog 2x per tahun",
        priority: 4,
        status: NeedStatus.ACTIVE,
      },
      {
        actorId: batik.id,
        category: NeedCategory.MARKET_NEED,
        title: "Akses ke platform fashion digital dan marketplace premium",
        priority: 3,
        status: NeedStatus.ACTIVE,
      },
    ],
  });

  // Constraints — Batik
  await prisma.constraint.createMany({
    data: [
      {
        actorId: batik.id,
        type: ConstraintType.CAPACITY,
        value: 300,
        unit: "lembar/bulan",
        severity: ConstraintSeverity.HARD,
        negotiability: Negotiability.FIXED,
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        notes: "Kapasitas workshop saat ini maksimum 300 lembar per bulan",
      },
      {
        actorId: batik.id,
        type: ConstraintType.LOCATION,
        value: "DI Yogyakarta",
        severity: ConstraintSeverity.SOFT,
        negotiability: Negotiability.NEGOTIABLE,
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.MEDIUM,
        notes: "Produksi utama di Yogyakarta, pengiriman ke seluruh Jawa",
      },
    ],
  });
  console.log(`✓ Aktor selesai: ${batik.name}`);

  // ─────────────────────────────────────
  // 3. Actor: Kriya Kulit Mandiri
  // ─────────────────────────────────────
  const kulit = await prisma.actor.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      ownerUserId: demoProfile.id,
      name: "Kriya Kulit Mandiri",
      actorType: ActorType.MSME,
      sector: "Kriya / Fesyen Kulit",
      location: "Magetan, Jawa Timur",
      description:
        "Pengrajin kulit sapi nabati spesialis aksesoris, tas, dan komponen fesyen berkualitas tinggi.",
      contactEmail: "halo@kulitmandiri.co.id",
      status: ActorStatus.ACTIVE,
    },
  });

  await prisma.asset.createMany({
    skipDuplicates: true,
    data: [
      {
        actorId: kulit.id,
        category: AssetCategory.MATERIAL,
        subtype: "Kulit Sapi Nabati",
        name: "Kulit Sapi Nabati Full-Grain Berkualitas Tinggi",
        description: "Kulit nabati grade A dari hewan lokal, proses penyamakan tradisional",
        roles: [AssetRole.INPUT, AssetRole.COMPONENT],
        attributes: { capacity: 500, unit: "lembar/bulan", minimum_order: 20 },
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE,
      },
      {
        actorId: kulit.id,
        category: AssetCategory.CAPABILITY,
        subtype: "Keahlian Kriya Kulit",
        name: "Keahlian Penjahitan & Pembentukan Kulit Manual",
        description: "Pengerjaan custom komponen kulit: gesper, handle tas, detail aksesori",
        roles: [AssetRole.CAPABILITY, AssetRole.ENABLER],
        attributes: { team_size: 12 },
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE,
      },
    ],
  });

  const kulitGoal = await prisma.goal.create({
    data: {
      actorId: kulit.id,
      category: GoalCategory.PRODUCT_DEVELOPMENT,
      title: "Mengembangkan lini produk kolaborasi fesyen batik-kulit premium",
      priority: 5,
      status: GoalStatus.ACTIVE,
    },
  });

  await prisma.need.create({
    data: {
      actorId: kulit.id,
      relatedGoalId: kulitGoal.id,
      category: NeedCategory.MATERIAL_NEED,
      title: "Kain batik premium sebagai material kombinasi untuk produk fesyen kulit",
      priority: 5,
      status: NeedStatus.ACTIVE,
    },
  });

  await prisma.constraint.create({
    data: {
      actorId: kulit.id,
      type: ConstraintType.MINIMUM_ORDER,
      value: 20,
      unit: "pcs",
      severity: ConstraintSeverity.HARD,
      negotiability: Negotiability.FIXED,
      sourceType: SourceType.SELF_REPORTED,
      confidenceLevel: ConfidenceLevel.HIGH,
    },
  });
  console.log(`✓ Aktor selesai: ${kulit.name}`);

  // ─────────────────────────────────────
  // 4. Actor: Nusantara Silver & Gem
  // ─────────────────────────────────────
  const silver = await prisma.actor.upsert({
    where: { id: "00000000-0000-0000-0000-000000000003" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000003",
      ownerUserId: demoProfile.id,
      name: "Nusantara Silver & Gem",
      actorType: ActorType.INDIVIDUAL,
      sector: "Kriya / Perhiasan Logam",
      location: "Kotagede, DI Yogyakarta",
      description:
        "Studio perhiasan perak filigree dan perhiasan kontemporer berbasis teknik kriya logam tradisional.",
      contactEmail: "info@nusantarasilver.id",
      status: ActorStatus.ACTIVE,
    },
  });

  await prisma.asset.createMany({
    skipDuplicates: true,
    data: [
      {
        actorId: silver.id,
        category: AssetCategory.PRODUCT,
        subtype: "Perhiasan Perak Filigree",
        name: "Perhiasan Perak Filigree Motif Nusantara",
        description: "Aksesori perhiasan perak teknik filigree tradisional Kotagede",
        roles: [AssetRole.OUTPUT, AssetRole.COMPONENT, AssetRole.CREATIVE_ELEMENT],
        attributes: { capacity: 150, unit: "pcs/bulan" },
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE,
      },
    ],
  });

  await prisma.goal.create({
    data: {
      actorId: silver.id,
      category: GoalCategory.BRAND_GROWTH,
      title: "Membangun brand perhiasan Nusantara sebagai aksesori koleksi fashion premium",
      priority: 4,
      status: GoalStatus.ACTIVE,
    },
  });

  await prisma.need.create({
    data: {
      actorId: silver.id,
      category: NeedCategory.MARKET_NEED,
      title: "Akses ke desainer fashion dan brand pakaian premium untuk kolaborasi aksesori",
      priority: 5,
      status: NeedStatus.ACTIVE,
    },
  });
  console.log(`✓ Aktor selesai: ${silver.name}`);

  // ─────────────────────────────────────
  // 5. Actor: Lensa Kreatif Studio
  // ─────────────────────────────────────
  const lensa = await prisma.actor.upsert({
    where: { id: "00000000-0000-0000-0000-000000000004" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000004",
      ownerUserId: demoProfile.id,
      name: "Lensa Kreatif Studio",
      actorType: ActorType.STUDIO,
      sector: "Fotografi / Visual Production",
      location: "Surabaya, Jawa Timur",
      description:
        "Studio fotografi komersial dan visual production spesialis katalog produk fesyen, lookbook, dan kampanye digital.",
      contactEmail: "studio@lensakreatif.com",
      status: ActorStatus.ACTIVE,
    },
  });

  await prisma.asset.createMany({
    skipDuplicates: true,
    data: [
      {
        actorId: lensa.id,
        category: AssetCategory.CAPABILITY,
        subtype: "Fotografi Produk Komersial",
        name: "Kapabilitas Fotografi Produk Fashion & Lookbook",
        description: "Full-service: konsep, styling, shooting, retouching untuk katalog fashion",
        roles: [AssetRole.CAPABILITY, AssetRole.ENABLER, AssetRole.OUTPUT],
        attributes: { capacity: 8, unit: "sesi/bulan", lead_time_days: 7 },
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE,
      },
      {
        actorId: lensa.id,
        category: AssetCategory.RESOURCE,
        subtype: "Studio Foto",
        name: "Studio Foto Indoor Lengkap dengan Cyclorama",
        description: "Studio 120m² dengan cyclorama putih, lighting profesional, dan set area",
        roles: [AssetRole.RESOURCE, AssetRole.ENABLER],
        attributes: { area_sqm: 120 },
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE,
      },
    ],
  });

  await prisma.goal.create({
    data: {
      actorId: lensa.id,
      category: GoalCategory.NETWORK_EXPANSION,
      title: "Membangun portofolio klien fashion brand lokal dan ekraf untuk retainer jangka panjang",
      priority: 4,
      status: GoalStatus.ACTIVE,
    },
  });

  await prisma.constraint.create({
    data: {
      actorId: lensa.id,
      type: ConstraintType.CAPACITY,
      value: 8,
      unit: "sesi/bulan",
      severity: ConstraintSeverity.HARD,
      negotiability: Negotiability.FIXED,
      sourceType: SourceType.SELF_REPORTED,
      confidenceLevel: ConfidenceLevel.HIGH,
      notes: "Maksimum 8 sesi foto per bulan dengan tim yang ada",
    },
  });
  console.log(`✓ Aktor selesai: ${lensa.name}`);

  console.log("\n✅ Seeding Phase 1 + 2 selesai!");
  console.log("   4 Aktor | Assets, Goals, Needs, Constraints Golden Demo siap untuk Engine.");
}

main()
  .catch((e) => {
    console.error("❌ Gagal menjalankan seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
