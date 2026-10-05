import { PrismaClient, ActorType, ActorStatus, AssetCategory, AssetRole, AssetStatus, GoalCategory, GoalStatus, NeedCategory, NeedStatus, ConstraintType, ConstraintSeverity, Negotiability, SourceType, ConfidenceLevel } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== RESET & SETUP: SISAKAN BERNADYA (ADMIN) & 1 AKUN PER ROLE ===");

  // 1. SETUP / PRESERVE BERNADYA (ADMIN)
  console.log("\n1. Mengamankan Akun Admin: bernadya");
  let bernadyaProfile = await prisma.profile.findFirst({
    where: { email: { equals: "bernadya@gmail.com", mode: "insensitive" } },
  });

  if (!bernadyaProfile) {
    bernadyaProfile = await prisma.profile.create({
      data: {
        email: "bernadya@gmail.com",
        displayName: "bernadya",
        bio: "Platform Administrator RAMU Ecosystem",
      },
    });
  } else {
    bernadyaProfile = await prisma.profile.update({
      where: { id: bernadyaProfile.id },
      data: {
        displayName: "bernadya",
        bio: "Platform Administrator RAMU Ecosystem",
      },
    });
  }

  const bernadyaActor = await prisma.actor.upsert({
    where: { id: "457ab232-2e9f-4fbb-9df2-34b30b0d137b" },
    update: {
      ownerUserId: bernadyaProfile.id,
      name: "bernadya",
      actorType: ActorType.INDIVIDUAL,
      sector: "Platform Administrator",
      description: "Platform Administrator RAMU Ecosystem",
      location: "Jakarta Selatan, Indonesia",
      contactEmail: "bernadya@gmail.com",
      status: ActorStatus.ACTIVE,
    },
    create: {
      id: "457ab232-2e9f-4fbb-9df2-34b30b0d137b",
      ownerUserId: bernadyaProfile.id,
      name: "bernadya",
      actorType: ActorType.INDIVIDUAL,
      sector: "Platform Administrator",
      description: "Platform Administrator RAMU Ecosystem",
      location: "Jakarta Selatan, Indonesia",
      contactEmail: "bernadya@gmail.com",
      status: ActorStatus.ACTIVE,
    },
  });
  console.log(`✓ Admin siap: ${bernadyaActor.name} (${bernadyaProfile.email})`);

  // 2. SETUP 6 ROLES (1 AKUN PER ROLE)
  console.log("\n2. Membuat 1 Akun Resmi per Role (Total 6 Role):");

  const SIX_ROLES_CONFIG = [
    {
      actorId: "00000000-0000-0000-0000-000000000001",
      email: "brand@ramu.id",
      displayName: "Nala The Label",
      actorType: ActorType.BRAND,
      sector: "Fashion Brand/UMKM",
      location: "Jakarta Selatan, DKI Jakarta",
      description: "Brand fashion lokal dengan gaya contemporary ready-to-wear, fokus pada siluet modern dan keberlanjutan.",
      contactEmail: "hello@nalathelabel.com",
      aestheticStyles: ["Minimalist", "High-Fashion", "Editorial"],
      compensationModels: ["PAID", "REVENUE_SHARE"],
      experienceLevel: "ESTABLISHED",
      assets: [
        {
          category: AssetCategory.WARDROBE_PROP,
          subtype: "Material Deadstock",
          name: "Sisa Kain Produksi & Material Deadstock Berkualitas",
          description: "Material linen dan katun premium dari koleksi sebelumnya siap kolaborasi upcycling",
          roles: [AssetRole.INPUT, AssetRole.COMPONENT],
          attributes: { capacity: 50, unit: "kg/bulan" },
        },
        {
          category: AssetCategory.PORTFOLIO_WORK,
          subtype: "Koleksi Lookbook",
          name: "Katalog Koleksi Musim Gugur (15 Looks)",
          description: "Siluet busana ready-to-wear kontemporer siap pakai untuk kampanye editorial komersial",
          roles: [AssetRole.CREATIVE_ELEMENT, AssetRole.OUTPUT],
          attributes: {
            starting_rate: "Sesuai Brief",
            turnaround_time: "2 – 3 Minggu",
            is_featured_cover: true,
            image_url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop",
            service_packages: [
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
            ],
          },
        },
      ],
    },
    {
      actorId: "00000000-0000-0000-0000-000000000006",
      email: "designer@ramu.id",
      displayName: "Atelier Nara",
      actorType: ActorType.INDIVIDUAL,
      sector: "Fashion Designer",
      location: "Bandung, Jawa Barat",
      description: "Perancang busana avant-garde dan pattern maker independen yang merancang siluet kontemporer dengan bahan silk organza dan tenun.",
      contactEmail: "nara@ateliernara.design",
      aestheticStyles: ["High-Fashion", "Avant-Garde", "Minimalist"],
      compensationModels: ["PAID", "REVENUE_SHARE"],
      experienceLevel: "PROFESSIONAL",
      assets: [
        {
          category: AssetCategory.PORTFOLIO_WORK,
          subtype: "Koleksi Busana Ready-to-Wear",
          name: "Koleksi Kapsul Busana Deconstructed Silk Organza",
          description: "Koleksi 12 busana siap pakai dengan eksplorasi draperi modern untuk editorial lookbook",
          roles: [AssetRole.INPUT, AssetRole.COMPONENT],
          attributes: {
            starting_rate: "Mulai Rp 2,5 Jt / koleksi",
            turnaround_time: "7 – 14 Hari Kerja",
            is_featured_cover: true,
            image_url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
            service_packages: [
              {
                title: "Desain Koleksi Busana & Tech-Pack",
                subtitle: "Pengembangan konsep busana siap jahit dan spesifikasi garmen pabrik",
                price: "Rp 3.500.000",
                unit: "per koleksi",
                popular: true,
                features: [
                  "Riset tren & moodboard konsep koleksi (5-8 outfit)",
                  "Sketsa desain digital 2D (tampak depan & belakang)",
                  "Lembar spesifikasi teknis lengkap ukuran & bahan",
                  "Gratis 2x putaran revisi teknis",
                ],
              },
            ],
          },
        },
      ],
    },
    {
      actorId: "00000000-0000-0000-0000-000000000004",
      email: "photographer@ramu.id",
      displayName: "Lensa Kreatif Studio",
      actorType: ActorType.INDIVIDUAL,
      sector: "Photographer",
      location: "Surabaya, Jawa Timur",
      description: "Fotografer fashion komersial dan visual production spesialis katalog produk fesyen, lookbook, dan kampanye digital.",
      contactEmail: "studio@lensakreatif.com",
      aestheticStyles: ["Commercial", "Minimalist", "Editorial"],
      compensationModels: ["PAID"],
      experienceLevel: "PROFESSIONAL",
      assets: [
        {
          category: AssetCategory.SKILL_TALENT,
          subtype: "Fotografi Produk Komersial",
          name: "Kapabilitas Fotografi Produk Fashion & Lookbook",
          description: "Full-service: konsep, lighting, shooting, retouching untuk katalog fashion",
          roles: [AssetRole.CAPABILITY, AssetRole.ENABLER, AssetRole.OUTPUT],
          attributes: {
            starting_rate: "Mulai Rp 1,5 Jt / sesi",
            turnaround_time: "3 – 5 Hari Kerja",
            is_featured_cover: true,
            image_url: "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?q=80&w=800&auto=format&fit=crop",
            service_packages: [
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
                ],
              },
            ],
          },
        },
      ],
    },
    {
      actorId: "00000000-0000-0000-0000-000000000005",
      email: "model@ramu.id",
      displayName: "Go Young Jung",
      actorType: ActorType.INDIVIDUAL,
      sector: "Model",
      location: "Jakarta Selatan, DKI Jakarta",
      description: "Talenta dan model fesyen profesional spesialis katalog lookbook, kampanye editorial, dan video komersial rilis busana.",
      contactEmail: "talent@goyoungjung.me",
      aestheticStyles: ["High-Fashion", "Editorial", "Minimalist"],
      compensationModels: ["PAID"],
      experienceLevel: "PROFESSIONAL",
      assets: [
        {
          category: AssetCategory.SKILL_TALENT,
          subtype: "Fashion Modeling",
          name: "Pemodelan Lookbook & Editorial Fashion",
          description: "Talenta model editorial busana dengan pengalaman kampanye lookbook lokal dan internasional",
          roles: [AssetRole.CAPABILITY, AssetRole.CREATIVE_ELEMENT],
          attributes: {
            starting_rate: "Mulai Rp 1,0 Jt / sesi",
            turnaround_time: "Selesai Sesi Pemotretan",
            is_featured_cover: true,
            image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
            height_cm: 174,
            shoes_size: 39,
            service_packages: [
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
                  "Hak guna media sosial & website 1 tahun",
                ],
              },
            ],
          },
        },
      ],
    },
    {
      actorId: "00000000-0000-0000-0000-000000000003",
      email: "mua@ramu.id",
      displayName: "Glow & Form Artistry",
      actorType: ActorType.INDIVIDUAL,
      sector: "MUA/Stylist",
      location: "Jakarta Pusat, DKI Jakarta",
      description: "Tim profesional MUA dan Hair Stylist spesialis pemotretan editorial, fashion show, dan kampanye komersial.",
      contactEmail: "info@glowandform.id",
      aestheticStyles: ["Editorial", "High-Fashion", "Minimalist"],
      compensationModels: ["PAID"],
      experienceLevel: "PROFESSIONAL",
      assets: [
        {
          category: AssetCategory.SKILL_TALENT,
          subtype: "Editorial Makeup",
          name: "Editorial Makeup & Avant-Garde Hair Styling",
          description: "Layanan makeup artis dan penataan rambut untuk kebutuhan photoshoot fashion dan runway",
          roles: [AssetRole.CAPABILITY, AssetRole.CREATIVE_ELEMENT],
          attributes: {
            starting_rate: "Mulai Rp 800rb / sesi",
            turnaround_time: "Selesai On-Set Hari-H",
            is_featured_cover: true,
            image_url: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop",
            service_packages: [
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
                  "Standby touch-up aktif selama 4 jam kerja",
                ],
              },
            ],
          },
        },
      ],
    },
    {
      actorId: "00000000-0000-0000-0000-000000000002",
      email: "studio@ramu.id",
      displayName: "Studio Imaji & Co.",
      actorType: ActorType.STUDIO,
      sector: "Studio",
      location: "Bandung, Jawa Barat",
      description: "Fasilitas studio foto daylight, ruang produksi kreatif, dan penyewaan properti set kampanye busana.",
      contactEmail: "hello@studioimaji.co",
      aestheticStyles: ["Minimalist", "Editorial"],
      compensationModels: ["PAID"],
      experienceLevel: "PROFESSIONAL",
      assets: [
        {
          category: AssetCategory.STUDIO_SPACE,
          subtype: "Studio Foto & Cyclorama",
          name: "Studio Daylight Loft dengan Cyclorama Wall",
          description: "Studio foto seluas 120m² dengan cyclorama putih, daya listrik 16.500 Watt (3-Phase), dan AC dingin",
          roles: [AssetRole.RESOURCE, AssetRole.ENABLER],
          attributes: {
            starting_rate: "Mulai Rp 200rb / jam (Shift Rp 750rb)",
            turnaround_time: "Instan / Slot Booking",
            is_featured_cover: true,
            image_url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop",
            service_packages: [
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
            ],
          },
        },
      ],
    },
  ];

  const allowedActorIds = [bernadyaActor.id, ...SIX_ROLES_CONFIG.map((r) => r.actorId)];
  const allowedProfileEmails = ["bernadya@gmail.com", ...SIX_ROLES_CONFIG.map((r) => r.email)];

  for (const roleConf of SIX_ROLES_CONFIG) {
    let profile = await prisma.profile.findFirst({
      where: { email: { equals: roleConf.email, mode: "insensitive" } },
    });

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          email: roleConf.email,
          displayName: roleConf.displayName,
          bio: roleConf.description,
        },
      });
    } else {
      profile = await prisma.profile.update({
        where: { id: profile.id },
        data: {
          displayName: roleConf.displayName,
          bio: roleConf.description,
        },
      });
    }

    const actor = await prisma.actor.upsert({
      where: { id: roleConf.actorId },
      update: {
        ownerUserId: profile.id,
        name: roleConf.displayName,
        actorType: roleConf.actorType,
        sector: roleConf.sector,
        location: roleConf.location,
        description: roleConf.description,
        contactEmail: roleConf.contactEmail,
        status: ActorStatus.ACTIVE,
        aestheticStyles: roleConf.aestheticStyles,
        compensationModels: roleConf.compensationModels,
        experienceLevel: roleConf.experienceLevel,
      },
      create: {
        id: roleConf.actorId,
        ownerUserId: profile.id,
        name: roleConf.displayName,
        actorType: roleConf.actorType,
        sector: roleConf.sector,
        location: roleConf.location,
        description: roleConf.description,
        contactEmail: roleConf.contactEmail,
        status: ActorStatus.ACTIVE,
        aestheticStyles: roleConf.aestheticStyles,
        compensationModels: roleConf.compensationModels,
        experienceLevel: roleConf.experienceLevel,
      },
    });

    // Delete existing assets for this actor and re-create clean assets
    await prisma.asset.deleteMany({ where: { actorId: actor.id } });
    for (const assetData of roleConf.assets) {
      await prisma.asset.create({
        data: {
          actorId: actor.id,
          category: assetData.category,
          subtype: assetData.subtype,
          name: assetData.name,
          description: assetData.description,
          roles: assetData.roles,
          attributes: assetData.attributes,
          sourceType: SourceType.SELF_REPORTED,
          confidenceLevel: ConfidenceLevel.HIGH,
          status: AssetStatus.ACTIVE,
        },
      });
    }

    console.log(`✓ Role siap: [${roleConf.sector}] -> ${actor.name} (${roleConf.email})`);
  }

  // 3. HAPUS SEMUA DATA & AKUN LAINNYA
  console.log("\n3. Membersihkan seluruh data & akun lain...");

  // Hapus pesan direct_messages yang bukan milik aktor resmi
  await prisma.$executeRawUnsafe(`
    DELETE FROM direct_messages 
    WHERE sender_actor_id NOT IN (${allowedActorIds.map((id) => `'${id}'`).join(",")})
       OR recipient_actor_id NOT IN (${allowedActorIds.map((id) => `'${id}'`).join(",")});
  `).catch(() => {});

  // Hapus notifications
  await prisma.$executeRawUnsafe(`
    DELETE FROM notifications 
    WHERE actor_id NOT IN (${allowedActorIds.map((id) => `'${id}'`).join(",")});
  `).catch(() => {});

  // Hapus booking_requests selain dari/ke aktor resmi
  await prisma.bookingRequest.deleteMany({
    where: {
      OR: [
        { requesterId: { notIn: allowedActorIds } },
        { targetId: { notIn: allowedActorIds } },
      ],
    },
  });

  // Hapus collaboration_interests
  await prisma.collaborationInterest.deleteMany({
    where: { actorId: { notIn: allowedActorIds } },
  });

  // Hapus project_briefs
  await prisma.projectBrief.deleteMany({
    where: { creatorActorId: { notIn: allowedActorIds } },
  });

  // Hapus tasks
  await prisma.task.deleteMany({
    where: { assignedActorId: { notIn: allowedActorIds } },
  });

  // Hapus feedbacks
  await prisma.feedback.deleteMany({
    where: { actorId: { notIn: allowedActorIds } },
  });

  // Hapus aktor-aktor lain
  const deletedActors = await prisma.actor.deleteMany({
    where: { id: { notIn: allowedActorIds } },
  });
  console.log(`✓ Berhasil menghapus ${deletedActors.count} aktor tak terpakai.`);

  // Hapus profil-profil lain
  const deletedProfiles = await prisma.profile.deleteMany({
    where: { email: { notIn: allowedProfileEmails } },
  });
  console.log(`✓ Berhasil menghapus ${deletedProfiles.count} akun profil tak terpakai.`);

  // 4. BUAT CONTOH DIRECT MESSAGES & PROJECT BRIEF LENGKAP
  console.log("\n4. Mengisi simulasi percakapan in-app & project brief resmi...");

  // In-app conversation: Nala The Label -> Go Young Jung
  await prisma.$executeRawUnsafe(`
    ALTER TABLE direct_messages ALTER COLUMN id SET DEFAULT gen_random_uuid();
  `).catch(() => {});

  await prisma.$executeRawUnsafe(`
    INSERT INTO direct_messages (id, sender_actor_id, recipient_actor_id, content, message_type, metadata, is_read, created_at)
    VALUES 
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000005'::uuid, 'Halo Go Young Jung! Kami dari tim Nala The Label sangat menyukai portofolio editorial Anda di direktori RAMU.', 'TEXT', '{}'::jsonb, true, NOW() - INTERVAL '3 hours'),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000005'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Halo Nala The Label! Terima kasih banyak. Konsep busana linen koleksi terbaru kalian juga terlihat sangat segar dan elegan.', 'TEXT', '{}'::jsonb, true, NOW() - INTERVAL '2 hours 45 minutes'),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000005'::uuid, 'Kami berencana pemotretan katalog lookbook 15 look untuk rilis Musim Gugur 2026. Apakah Anda tersedia di hari Sabtu, 24 Oktober 2026?', 'TEXT', '{}'::jsonb, true, NOW() - INTERVAL '2 hours 10 minutes'),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000005'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Tanggal 24 Oktober saya masih tersedia untuk full-day session. Untuk paket katalog 15 look, standar saya sudah termasuk fitting 1 jam sebelumnya.', 'TEXT', '{}'::jsonb, true, NOW() - INTERVAL '1 hour 30 minutes'),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000005'::uuid, '📑 TAWARAN PROYEK RESMI: Pemotretan Lookbook Koleksi Musim Gugur (Rp 1.800.000)', 'OFFER', $1::jsonb, false, NOW() - INTERVAL '30 minutes')
    ON CONFLICT DO NOTHING;
  `, JSON.stringify({
    title: "Pemotretan Lookbook Koleksi Musim Gugur 2026",
    budget: "Rp 1.800.000",
    sessionDate: "2026-10-24",
    outputDetails: "15 Outfit Looks • Hak Cipta Komersial Digital 1 Tahun",
    notes: "Lokasi: Studio Imaji Bandung. Disediakan MUA dan konsumsi kru.",
    offerStatus: "PENDING",
    sentAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  }));

  // Buat 1 Project Brief resmi dari Nala The Label
  const brief = await prisma.projectBrief.create({
    data: {
      creatorActorId: "00000000-0000-0000-0000-000000000001",
      title: "Lookbook Kampanye Fesyen Musim Gugur: Ethereal Linen",
      description: "Produksi visual lookbook terpadu 15 look untuk peluncuran koleksi pakaian linen ramah lingkungan.",
      projectType: "Campaign Iklan",
      targetOutput: "15 Foto High-Res Retouch + 2 Video Reels 9:16 + Lookbook PDF",
      location: "Bandung / Jakarta",
      timeline: { estimatedDuration: "1 Hari Sesi Pemotretan", targetLaunch: "24 Oktober 2026" },
      budget: { estimatedTotal: "Rp 8.500.000", costSharingModel: "Didanai Penuh oleh Nala The Label" },
      aestheticStyle: "Minimalist",
      compensationModel: "PAID",
      status: "OPEN",
      neededRoles: {
        create: [
          {
            roleLabel: "Fashion Designer",
            assetCategory: AssetCategory.PORTFOLIO_WORK,
            description: "Desainer pendamping untuk styling dan kurasi siluet potongan busana",
            maxCollaborators: 1,
          },
          {
            roleLabel: "Photographer",
            assetCategory: AssetCategory.SKILL_TALENT,
            description: "Fotografer editorial fashion untuk sesi daylight lookbook",
            maxCollaborators: 1,
          },
          {
            roleLabel: "Model",
            assetCategory: AssetCategory.SKILL_TALENT,
            description: "Model editorial muse dengan ekspresi tenang dan elegan",
            maxCollaborators: 1,
          },
          {
            roleLabel: "MUA/Stylist",
            assetCategory: AssetCategory.SKILL_TALENT,
            description: "Penata rias natural glass skin dan wardrobe stylist on-set",
            maxCollaborators: 1,
          },
          {
            roleLabel: "Studio",
            assetCategory: AssetCategory.STUDIO_SPACE,
            description: "Studio foto sewa dengan cyclorama wall dan natural daylight",
            maxCollaborators: 1,
          },
        ],
      },
    },
  });
  console.log(`✓ Project Brief dibuat: "${brief.title}"`);

  console.log("\n=== SELESAI: DATABASE BERSIH DENGAN 1 ADMIN & 1 AKUN PER ROLE ===");
}

main()
  .catch((e) => {
    console.error("Gagal menjalankan cleanup:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
