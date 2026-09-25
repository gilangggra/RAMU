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
  // 2. Actor: Nala The Label
  // ─────────────────────────────────────
  const nala = await prisma.actor.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      ownerUserId: demoProfile.id,
      name: "Nala The Label",
      actorType: ActorType.STUDIO,
      sector: "Fashion Designer / Label",
      location: "Jakarta Selatan",
      description:
        "Brand fashion lokal dengan gaya contemporary ready-to-wear, fokus pada siluet modern dan keberlanjutan.",
      contactEmail: "hello@nalathelabel.com",
      status: ActorStatus.ACTIVE,
    },
  });

  // Assets — Nala The Label
  await prisma.asset.createMany({
    skipDuplicates: true,
    data: [
      {
        actorId: nala.id,
        category: AssetCategory.WARDROBE_PROP,
        subtype: "Sisa Kain & Material Deadstock",
        name: "Sisa Kain Produksi & Material Deadstock Berkualitas",
        description: "Sisa material dari koleksi sebelumnya yang masih bisa di-upcycle atau dijadikan aksen",
        roles: [AssetRole.INPUT, AssetRole.COMPONENT],
        attributes: { capacity: 50, unit: "kg/bulan" },
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE,
      },
      {
        actorId: nala.id,
        category: AssetCategory.SKILL_TALENT,
        subtype: "Desain Fashion",
        name: "Desain Fashion & Pattern Making",
        description: "Tim desainer berpengalaman dalam merancang pola siluet kontemporer",
        roles: [AssetRole.CAPABILITY, AssetRole.ENABLER],
        attributes: { team_size: 4, experience_years: 5 },
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE,
      },
    ],
  });

  // Goals — Nala The Label
  const nalaGoal = await prisma.goal.create({
    data: {
      actorId: nala.id,
      category: GoalCategory.BRAND_AWARENESS,
      title: "Membangun kampanye lookbook visual yang kuat untuk peluncuran koleksi Summer 2027",
      description: "Meningkatkan brand awareness melalui visual editorial yang estetis",
      priority: 5,
      status: GoalStatus.ACTIVE,
    },
  });

  // Needs — Nala The Label
  await prisma.need.createMany({
    data: [
      {
        actorId: nala.id,
        relatedGoalId: nalaGoal.id,
        category: NeedCategory.CREW_NEED,
        title: "Fotografer editorial & studio cyclorama",
        description: "Dibutuhkan sesi pemotretan katalog koleksi Summer 2027",
        priority: 5,
        status: NeedStatus.ACTIVE,
      },
      {
        actorId: nala.id,
        relatedGoalId: nalaGoal.id,
        category: NeedCategory.CREW_NEED,
        title: "Model profesional untuk lookbook",
        priority: 5,
        status: NeedStatus.ACTIVE,
      },
    ],
  });

  // Constraints — Nala The Label
  await prisma.constraint.createMany({
    data: [
      {
        actorId: nala.id,
        type: ConstraintType.BUDGET,
        value: 15000000,
        unit: "IDR",
        severity: ConstraintSeverity.HARD,
        negotiability: Negotiability.FIXED,
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        notes: "Kapasitas budget photoshoot maksimal Rp 15 juta",
      },
      {
        actorId: nala.id,
        type: ConstraintType.LOCATION,
        value: "Jakarta",
        severity: ConstraintSeverity.SOFT,
        negotiability: Negotiability.NEGOTIABLE,
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.MEDIUM,
        notes: "Lebih disukai pemotretan di area Jakarta",
      },
    ],
  });
  console.log(`✓ Aktor selesai: ${nala.name}`);

  // ─────────────────────────────────────
  // 3. Actor: Studio Imaji & Co.
  // ─────────────────────────────────────
  const imaji = await prisma.actor.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      ownerUserId: demoProfile.id,
      name: "Studio Imaji & Co.",
      actorType: ActorType.STUDIO,
      sector: "Creative & Art Director",
      location: "Bandung, Jawa Barat",
      description:
        "Studio creative direction yang merancang konsep kampanye visual, set design, dan keseluruhan art direction untuk brand lifestyle.",
      contactEmail: "hello@studioimaji.co",
      status: ActorStatus.ACTIVE,
    },
  });

  await prisma.asset.createMany({
    skipDuplicates: true,
    data: [
      {
        actorId: imaji.id,
        category: AssetCategory.SKILL_TALENT,
        subtype: "Creative Direction",
        name: "Creative Direction & Set Design",
        description: "Konseptualisasi kampanye, perancangan set dekorasi, dan art direction pemotretan",
        roles: [AssetRole.CAPABILITY, AssetRole.ENABLER],
        attributes: { team_size: 5 },
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE,
      },
      {
        actorId: imaji.id,
        category: AssetCategory.EQUIPMENT,
        subtype: "Props Studio",
        name: "Props Studio & Dekorasi Set",
        description: "Koleksi props, background set, dan elemen dekoratif untuk editorial visual",
        roles: [AssetRole.RESOURCE, AssetRole.ENABLER],
        attributes: { capacity: 100, unit: "items" },
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE,
      },
    ],
  });

  const imajiGoal = await prisma.goal.create({
    data: {
      actorId: imaji.id,
      category: GoalCategory.BRAND_AWARENESS,
      title: "Membangun portofolio kampanye fashion editorial dan video komersial",
      priority: 5,
      status: GoalStatus.ACTIVE,
    },
  });

  await prisma.need.create({
    data: {
      actorId: imaji.id,
      relatedGoalId: imajiGoal.id,
      category: NeedCategory.CREW_NEED,
      title: "Kolaborasi dengan brand fashion untuk eksekusi kampanye visual",
      priority: 5,
      status: NeedStatus.ACTIVE,
    },
  });

  await prisma.constraint.create({
    data: {
      actorId: imaji.id,
      type: ConstraintType.CAPACITY,
      value: 2,
      unit: "kolaborasi/bulan",
      severity: ConstraintSeverity.HARD,
      negotiability: Negotiability.FIXED,
      sourceType: SourceType.SELF_REPORTED,
      confidenceLevel: ConfidenceLevel.HIGH,
    },
  });
  console.log(`✓ Aktor selesai: ${imaji.name}`);

  // ─────────────────────────────────────
  // 4. Actor: Glow & Form Artistry
  // ─────────────────────────────────────
  const makeup = await prisma.actor.upsert({
    where: { id: "00000000-0000-0000-0000-000000000003" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000003",
      ownerUserId: demoProfile.id,
      name: "Glow & Form Artistry",
      actorType: ActorType.STUDIO,
      sector: "Makeup & Hair Artist (MUA)",
      location: "Jakarta Pusat",
      description:
        "Tim profesional MUA dan Hair Stylist spesialis pemotretan editorial, fashion show, dan kampanye komersial.",
      contactEmail: "info@glowandform.id",
      status: ActorStatus.ACTIVE,
    },
  });

  await prisma.asset.createMany({
    skipDuplicates: true,
    data: [
      {
        actorId: makeup.id,
        category: AssetCategory.SKILL_TALENT,
        subtype: "Editorial Makeup",
        name: "Editorial Makeup & Avant-Garde Hair Styling",
        description: "Layanan makeup artis dan penataan rambut untuk kebutuhan photoshoot fashion dan runway",
        roles: [AssetRole.CAPABILITY, AssetRole.CREATIVE_ELEMENT],
        attributes: { team_size: 3 },
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE,
      },
    ],
  });

  await prisma.goal.create({
    data: {
      actorId: makeup.id,
      category: GoalCategory.PORTFOLIO_BUILDING,
      title: "Menjadi mitra tetap untuk pemotretan fashion editorial brand lokal premium",
      priority: 4,
      status: GoalStatus.ACTIVE,
    },
  });

  await prisma.need.create({
    data: {
      actorId: makeup.id,
      category: NeedCategory.PUBLICATION_NEED,
      title: "Akses ke fotografer fashion dan creative director untuk proyek kolaborasi",
      priority: 5,
      status: NeedStatus.ACTIVE,
    },
  });
  console.log(`✓ Aktor selesai: ${makeup.name}`);

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
        category: AssetCategory.SKILL_TALENT,
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
        category: AssetCategory.EQUIPMENT,
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
      category: GoalCategory.PORTFOLIO_BUILDING,
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
