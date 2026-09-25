import { prisma } from "@/infrastructure/database/prisma";
import {
  CollaborationPlanStatus,
  CollaborationStatus,
  ParticipantCollaborationStatus,
  TaskStatus,
  TaskPriority,
  MilestoneStatus,
  Prisma,
} from "@prisma/client";

function getCollaborationBlueprint(patternCode: string, opp: any, initiatorActorId: string) {
  const code = patternCode || opp.pattern?.code || "";
  const otherActorId = opp.participants?.find((p: any) => p.actorId !== initiatorActorId)?.actorId || initiatorActorId;

  if (code === "DESIGN_TO_PRODUCTION") {
    return {
      budget: {
        estimatedTotal: "Rp 25.000.000",
        costSharingModel: "Biaya kain ditanggung desainer, ongkos jahit atelier per potong (CMT)",
        notes: "Uji coba batch perdana 20-30 potong busana sebelum produksi lanjutan.",
      },
      timeline: {
        estimatedDuration: "4-5 Minggu",
        targetLaunch: "Bulan Depan",
        phases: [
          "Fase 1: Penyelarasan Sketsa & Pemilihan Bahan Kain",
          "Fase 2: Pembuatan Pola & Sampel Busana (Toile)",
          "Fase 3: Sesi Fitting Sampel & Revisi Jahitan",
          "Fase 4: Pengerjaan Batch Busana Terbatas",
          "Fase 5: Quality Control & Peluncuran Koleksi",
        ],
      },
      revenueModel: {
        modelType: "REVENUE_SHARE",
        description: "Bagi hasil margin penjualan atau sistem fee produksi atelier per helai busana.",
        proposedSplit: "Proporsional sesuai kesepakatan produksi busana",
      },
      ownershipRules: {
        brandModel: "Brand Desainer (Powered by Atelier Workshop)",
        guidelines: "Desain dipasarkan di bawah nama label perancang dengan kredit atelier pembuat.",
      },
      ipRules: {
        originalIp: "Hak cipta desain busana & pola potongan tetap milik eksklusif perancang busana.",
        derivativeWorks: "Atelier dilarang mereproduksi pola atau desain serupa untuk pihak ketiga.",
      },
      tasks: [
        {
          title: "Penyelarasan Sketsa Teknis & Pilihan Kain",
          description: "Menyerahkan lembar kerja desain, spesifikasi ukuran, dan sampel material kain ke atelier.",
          priority: TaskPriority.HIGH,
          assignedActorId: initiatorActorId,
        },
        {
          title: "Pembuatan Pola Dasar & Jahit Sampel Awal (Toile)",
          description: "Atelier membuat pola busana fisik dan menjahit satu prototipe pertama untuk uji coba siluet.",
          priority: TaskPriority.HIGH,
          assignedActorId: otherActorId,
        },
        {
          title: "Sesi Fitting Model & Penyesuaian Jahitan",
          description: "Mencoba prototipe pada tubuh model/manekin untuk memastikan kenyamanan dan jatuh kain.",
          priority: TaskPriority.HIGH,
          assignedActorId: initiatorActorId,
        },
        {
          title: "Pengerjaan Produksi Batch Busana Terbatas",
          description: "Eksekusi pemotongan kain dan penjahitan seluruh batch sesuai standar kerapihan butik.",
          priority: TaskPriority.MEDIUM,
          assignedActorId: otherActorId,
        },
        {
          title: "Pemeriksaan Kualitas Akhir (Final QC) & Packaging",
          description: "Pengecekan benang, kancing, label pakaian, dan pengepakan rapi siap kirim.",
          priority: TaskPriority.MEDIUM,
          assignedActorId: initiatorActorId,
        },
      ],
      milestones: [
        {
          title: "Sketsa Teknis & Material Disepakati",
          description: "Spesifikasi desain dan bahan kain telah diterima atelier.",
          status: MilestoneStatus.IN_PROGRESS,
        },
        {
          title: "Sampel Fisik Pertama (Toile) Disetujui",
          description: "Fitting prototipe berhasil tanpa revisi pola mayor.",
          status: MilestoneStatus.PENDING,
        },
        {
          title: "Batch Koleksi Selesai Dijahit & Lolos QC",
          description: "Seluruh kuantitas pakaian selesai dengan standar butik.",
          status: MilestoneStatus.PENDING,
        },
        {
          title: "Koleksi Busana Siap Rilis ke Pasar",
          description: "Pakaian siap dikirim ke pembeli atau dipajang di butik/katalog.",
          status: MilestoneStatus.PENDING,
        },
      ],
    };
  }

  if (code === "PRODUCT_LAUNCH") {
    return {
      budget: {
        estimatedTotal: "Rp 35.000.000",
        costSharingModel: "Bagi rata sewa venue pameran/runway dan akomodasi acara",
        notes: "Mencakup sound system, lighting runway, dan konsumsi tamu VIP.",
      },
      timeline: {
        estimatedDuration: "3-4 Minggu",
        targetLaunch: "Akhir Bulan",
        phases: [
          "Fase 1: Kurasi Tema Runway & Penentuan Venue Show",
          "Fase 2: Casting Model & Fitting Panggung",
          "Fase 3: Gladi Bersih (Rehearsal) & Setup Panggung",
          "Fase 4: Pelaksanaan Event Runway / Trunk Show",
          "Fase 5: Rekap Media & Pembukaan Penjualan Pop-Up",
        ],
      },
      revenueModel: {
        modelType: "REVENUE_SHARE",
        description: "Penjualan tiket showcase, sponsor bersama, dan pembagian hasil stan pop-up.",
        proposedSplit: "50% Label Kolaborator 1 : 50% Label Kolaborator 2",
      },
      ownershipRules: {
        brandModel: "Joint Showcase & Co-Host Event",
        guidelines: "Kedua brand berbagi panggung dan materi promosi dengan visibilitas setara.",
      },
      ipRules: {
        originalIp: "Koleksi pakaian milik masing-masing label independen.",
        derivativeWorks: "Dokumentasi foto dan video event menjadi aset promosi bersama kedua belah pihak.",
      },
      tasks: [
        {
          title: "Penyusunan Rundown Acara & Kurasi Look Runway",
          description: "Menetapkan urutan jalan peraga busana dan tema musik pengiring catwalk.",
          priority: TaskPriority.HIGH,
          assignedActorId: initiatorActorId,
        },
        {
          title: "Casting Model, Fitting Busana, & Briefing MUA",
          description: "Mencocokkan look pakaian setiap model dan arahan riasan wajah untuk panggung.",
          priority: TaskPriority.HIGH,
          assignedActorId: otherActorId,
        },
        {
          title: "Setup Panggung, Pencahayaan, & Gladi Bersih",
          description: "Uji coba pencahayaan panggung runway dan gladi bersih langkah model.",
          priority: TaskPriority.HIGH,
          assignedActorId: initiatorActorId,
        },
        {
          title: "Pelaksanaan Hari-H Runway / Trunk Show",
          description: "Eksekusi acara utama, penerimaan tamu undangan, dan showcase koleksi.",
          priority: TaskPriority.HIGH,
          assignedActorId: initiatorActorId,
        },
        {
          title: "Distribusi Liputan Media & Penjualan Koleksi",
          description: "Kirim siaran pers foto runway ke media fashion dan rilis koleksi ke publik.",
          priority: TaskPriority.MEDIUM,
          assignedActorId: otherActorId,
        },
      ],
      milestones: [
        {
          title: "Venue & Rundown Acara Terkonfirmasi",
          description: "Lokasi acara, izin venue, dan susunan show terkunci.",
          status: MilestoneStatus.IN_PROGRESS,
        },
        {
          title: "Fitting Seluruh Model Tuntas",
          description: "Seluruh busana pas di model dan urutan jalan siap.",
          status: MilestoneStatus.PENDING,
        },
        {
          title: "Acara Runway Berhasil Diselenggarakan",
          description: "Peragaan busana berjalan sukses disaksikan audiens dan media.",
          status: MilestoneStatus.PENDING,
        },
        {
          title: "Publikasi Media & Penjualan Resmi Dibuka",
          description: "Liputan foto runway tersebar dan pesanan dibuka.",
          status: MilestoneStatus.PENDING,
        },
      ],
    };
  }

  if (code === "CREATIVE_CAMPAIGN") {
    return {
      budget: {
        estimatedTotal: "Rp 20.000.000",
        costSharingModel: "Proporsional sesuai kesepakatan produksi fashion film",
        notes: "Mencakup sewa kamera sinema, lighting kit, dan sound design.",
      },
      timeline: {
        estimatedDuration: "3 Minggu",
        targetLaunch: "Bulan Depan",
        phases: [
          "Fase 1: Storyboard Naratif & Treatment Sinematik",
          "Fase 2: Pemilihan Lokasi (Scouting) & Wardrobe",
          "Fase 3: Shooting Day Fashion Film",
          "Fase 4: Video Editing, Color Grading & Sound Scoring",
          "Fase 5: Premiere & Rilis Video Kampanye",
        ],
      },
      revenueModel: {
        modelType: "REVENUE_SHARE",
        description: "Lisensi video komersial brand dan kredit karya di festival film mode.",
        proposedSplit: "Sesuai kesepakatan hak pakai materi visual",
      },
      ownershipRules: {
        brandModel: "Brand Campaign Directed by Videografer",
        guidelines: "Video dirilis sebagai kampanye resmi brand dengan kredit videografer.",
      },
      ipRules: {
        originalIp: "Desain busana milik label; master visual film milik kreator video.",
        derivativeWorks: "Brand memiliki hak penayangan global untuk kebutuhan komersial.",
      },
      tasks: [
        {
          title: "Penyusunan Storyboard & Shot List Sinematik",
          description: "Menyusun alur visual adegan per adegan dan referensi pergerakan kamera.",
          priority: TaskPriority.HIGH,
          assignedActorId: initiatorActorId,
        },
        {
          title: "Scouting Lokasi, Izin Tempat & Fitting Pakaian",
          description: "Memastikan lokasi shooting siap pakai dan busana pas dengan konsep adegan.",
          priority: TaskPriority.HIGH,
          assignedActorId: otherActorId,
        },
        {
          title: "Hari Pengambilan Gambar (Shooting Day)",
          description: "Pengambilan rekaman video sinematik dengan model dan busana sesuai shot list.",
          priority: TaskPriority.HIGH,
          assignedActorId: otherActorId,
        },
        {
          title: "Penyuntingan Video, Color Grading & Musik",
          description: "Editing potongan video, penyesuaian warna estetika, dan sinkronisasi audio.",
          priority: TaskPriority.MEDIUM,
          assignedActorId: otherActorId,
        },
        {
          title: "Rilis Fashion Film ke Publik & Media Sosial",
          description: "Penayangan perdana video kampanye di platform digital dan promosi bersama.",
          priority: TaskPriority.MEDIUM,
          assignedActorId: initiatorActorId,
        },
      ],
      milestones: [
        {
          title: "Storyboard & Lokasi Shooting Terkunci",
          description: "Konsep adegan dan izin lokasi shooting telah disetujui.",
          status: MilestoneStatus.IN_PROGRESS,
        },
        {
          title: "Seluruh Rekaman Video Berhasil Diambil",
          description: "Shooting day selesai dengan semua adegan terekam aman.",
          status: MilestoneStatus.PENDING,
        },
        {
          title: "Final Cut & Grading Video Disetujui",
          description: "Video selesai diedit dan disetujui oleh kedua belah pihak.",
          status: MilestoneStatus.PENDING,
        },
        {
          title: "Video Kampanye Resmi Mengudara",
          description: "Fashion film dirilis dan disaksikan audiens target.",
          status: MilestoneStatus.PENDING,
        },
      ],
    };
  }

  // DEFAULT: FASHION_CAPSULE / PRODUCT_PHOTOSHOOT / PREMIUM_GIFT_SET (EDITORIAL LOOKBOOK)
  return {
    budget: {
      estimatedTotal: "Rp 15.000.000",
      costSharingModel: "Proporsional sesuai kesepakatan produksi editorial",
      notes: "Mencakup sewa studio, talenta model, dan akomodasi produksi visual.",
    },
    timeline: {
      estimatedDuration: "2-3 Minggu",
      targetLaunch: "Bulan Depan",
      phases: [
        "Fase 1: Penyelarasan Moodboard & Call Sheet",
        "Fase 2: Fitting Wardrobe & Penjadwalan Studio",
        "Fase 3: Hari Pemotretan / Production Day",
        "Fase 4: Kurasi Foto & Retouching High-Res",
        "Fase 5: Peluncuran Lookbook & Rilis Kampanye",
      ],
    },
    revenueModel: {
      modelType: "REVENUE_SHARE",
      description: "Kompensasi kredit publikasi, hak lisensi visual editorial, dan pembagian hasil penjualan koleksi.",
      proposedSplit: "50% Label Busana : 50% Tim Visual & Kreatif (Bisa Dinegosiasikan)",
    },
    ownershipRules: {
      brandModel: "Co-Branding Bersama",
      guidelines: "Karya dirilis di bawah kredit kolaboratif bersama (Label Busana × Studio Visual).",
    },
    ipRules: {
      originalIp: "Hak cipta busana & rancangan tetap milik desainer; hak cipta foto karya milik fotografer.",
      derivativeWorks: "Hak pakai komersial untuk materi promosi digital, lookbook e-commerce, dan editorial bersama.",
    },
    tasks: [
      {
        title: "Penyelarasan Moodboard & Arah Gaya",
        description: "Menyepakati konsep visual, palet warna, referensi pencahayaan, dan call sheet sesi pemotretan.",
        priority: TaskPriority.HIGH,
        assignedActorId: initiatorActorId,
      },
      {
        title: "Fitting Wardrobe & Konfirmasi Talenta",
        description: "Pengecekan ukuran busana pada model, penataan aksesori, dan kepastian jadwal tim MUA.",
        priority: TaskPriority.HIGH,
        assignedActorId: initiatorActorId,
      },
      {
        title: "Sesi Pemotretan / Shooting Day Studio",
        description: "Pelaksanaan pemotretan editorial lookbook di studio/lokasi sesuai daftar look (shot list).",
        priority: TaskPriority.HIGH,
        assignedActorId: opp.participants?.find((p: any) => p.roleCode?.includes("VISUAL") || p.roleCode?.includes("PHOTO"))?.actorId || otherActorId,
      },
      {
        title: "Kurasi Foto & Retouching High-Res",
        description: "Pemilihan foto terbaik (selects), koreksi warna, dan ekspor aset resolusi tinggi untuk katalog.",
        priority: TaskPriority.MEDIUM,
        assignedActorId: opp.participants?.find((p: any) => p.roleCode?.includes("VISUAL") || p.roleCode?.includes("PHOTO"))?.actorId || otherActorId,
      },
      {
        title: "Peluncuran Lookbook & Rilis Kampanye",
        description: "Publikasi karya visual di media sosial, lookbook digital, dan materi promosi kedua pihak.",
        priority: TaskPriority.MEDIUM,
        assignedActorId: initiatorActorId,
      },
    ],
    milestones: [
      {
        title: "Moodboard & Call Sheet Disepakati",
        description: "Arah visual, shot list busana, dan jadwal studio telah dikonfirmasi seluruh tim.",
        status: MilestoneStatus.IN_PROGRESS,
      },
      {
        title: "Fitting & Persiapan Wardrobe Selesai",
        description: "Koleksi busana siap pakai dan model terkonfirmasi hadir.",
        status: MilestoneStatus.PENDING,
      },
      {
        title: "Sesi Pemotretan Berhasil Terlaksana",
        description: "Seluruh shot list terambil dan sesi foto selesai sesuai jadwal.",
        status: MilestoneStatus.PENDING,
      },
      {
        title: "Master Aset Visual & Lookbook Diterima",
        description: "Foto final high-res selesai diretouch dan siap dipublikasikan.",
        status: MilestoneStatus.PENDING,
      },
    ],
  };
}

export async function initiateCollaborationFromOpportunity(
  opportunityId: string,
  initiatorActorId: string
) {
  const existingPlan = await prisma.collaborationPlan.findFirst({
    where: { opportunityId },
    include: {
      collaboration: true,
      roles: true,
    },
  });

  if (existingPlan && existingPlan.collaboration) {
    return {
      success: true,
      collaborationId: existingPlan.collaboration.id,
      planId: existingPlan.id,
      isNew: false,
    };
  }

  const opp = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
    include: {
      pattern: true,
      participants: {
        include: { actor: true },
      },
      assets: {
        include: { asset: true },
      },
    },
  });

  if (!opp) {
    throw new Error("Peluang (Opportunity) tidak ditemukan.");
  }

  const blueprint = getCollaborationBlueprint(opp.patternCode, opp, initiatorActorId);

  const plan = await prisma.collaborationPlan.create({
    data: {
      opportunityId: opp.id,
      createdByActorId: initiatorActorId,
      title: opp.title,
      objective: opp.description,
      expectedOutputs: (opp.expectedOutputs as unknown as Prisma.InputJsonValue) || [],
      budget: blueprint.budget as unknown as Prisma.InputJsonValue,
      timeline: blueprint.timeline as unknown as Prisma.InputJsonValue,
      revenueModel: blueprint.revenueModel as unknown as Prisma.InputJsonValue,
      ownershipRules: blueprint.ownershipRules as unknown as Prisma.InputJsonValue,
      ipRules: blueprint.ipRules as unknown as Prisma.InputJsonValue,
      status: CollaborationPlanStatus.PROPOSED,
    },
  });

  const isInitiatorInParticipants = opp.participants.some((p) => p.actorId === initiatorActorId);

  for (const p of opp.participants) {
    await prisma.collaborationRole.create({
      data: {
        collaborationPlanId: plan.id,
        actorId: p.actorId,
        roleCode: p.roleCode,
        responsibility: p.roleLabel || p.roleCode,
        contribution: p.contribution || "Menyediakan aset dan kapabilitas kolaborasi",
        status: p.actorId === initiatorActorId ? "ACCEPTED" : "PENDING",
      },
    });
  }

  if (!isInitiatorInParticipants) {
    await prisma.collaborationRole.create({
      data: {
        collaborationPlanId: plan.id,
        actorId: initiatorActorId,
        roleCode: "INITIATOR",
        responsibility: "Inisiator Proyek & Fasilitator Kolaborasi",
        contribution: "Menginisiasi pembentukan ruang kolaborasi dan koordinasi tim",
        status: "ACCEPTED",
      },
    });
  }

  const collaboration = await prisma.collaboration.create({
    data: {
      collaborationPlanId: plan.id,
      title: opp.title,
      description: opp.description,
      status: CollaborationStatus.ACTIVE,
      startedAt: new Date(),
    },
  });

  for (const p of opp.participants) {
    await prisma.collaborationParticipant.create({
      data: {
        collaborationId: collaboration.id,
        actorId: p.actorId,
        roleCode: p.roleCode,
        status: ParticipantCollaborationStatus.ACTIVE,
      },
    });
  }

  if (!isInitiatorInParticipants) {
    await prisma.collaborationParticipant.create({
      data: {
        collaborationId: collaboration.id,
        actorId: initiatorActorId,
        roleCode: "INITIATOR",
        status: ParticipantCollaborationStatus.ACTIVE,
      },
    });
  }

  for (const t of blueprint.tasks) {
    await prisma.task.create({
      data: {
        collaborationId: collaboration.id,
        title: t.title,
        description: t.description,
        status: TaskStatus.TODO,
        priority: t.priority,
        assignedActorId: t.assignedActorId,
      },
    });
  }

  for (const m of blueprint.milestones) {
    await prisma.milestone.create({
      data: {
        collaborationId: collaboration.id,
        title: m.title,
        description: m.description,
        status: m.status,
      },
    });
  }

  await prisma.decision.create({
    data: {
      collaborationId: collaboration.id,
      title: "Persetujuan Inisiasi Proyek Kolaboratif",
      decision: `Membentuk ruang kerja kolaborasi berdasarkan rekomendasi Opportunity Engine pola "${opp.pattern?.name || opp.patternCode}".`,
      reason: "Komplementaritas aset dan keselarasan sasaran usaha dinilai memenuhi kriteria kelayakan.",
      agreedByActors: opp.participants.map((p) => p.actorId) as unknown as Prisma.InputJsonValue,
    },
  });

  return {
    success: true,
    collaborationId: collaboration.id,
    planId: plan.id,
    isNew: true,
  };
}

export async function getCollaborationsForActor(actorId: string) {
  return prisma.collaboration.findMany({
    where: {
      OR: [
        {
          participants: {
            some: { actorId },
          },
        },
        {
          plan: {
            createdByActorId: actorId,
          },
        },
      ],
    },
    include: {
      plan: {
        include: {
          opportunity: {
            include: { pattern: true },
          },
        },
      },
      participants: {
        include: { actor: true },
      },
      tasks: {
        select: { id: true, status: true },
      },
      milestones: {
        select: { id: true, status: true },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getCollaborationWorkspace(collaborationId: string) {
  if (!collaborationId || !UUID_REGEX.test(collaborationId)) {
    return null;
  }

  try {
    return await prisma.collaboration.findUnique({
      where: { id: collaborationId },
    include: {
      plan: {
        include: {
          opportunity: {
            include: {
              pattern: true,
              assets: { include: { asset: true } },
            },
          },
          roles: {
            include: { actor: true },
          },
        },
      },
      participants: {
        include: {
          actor: {
            include: {
              assets: { where: { status: "ACTIVE" } },
            },
          },
        },
      },
      tasks: {
        include: { assignedActor: true },
        orderBy: [{ status: "asc" }, { createdAt: "asc" }],
      },
      milestones: {
        orderBy: { createdAt: "asc" },
      },
      decisions: {
        orderBy: { createdAt: "desc" },
      },
      outcomes: {
        orderBy: { createdAt: "desc" },
      },
      feedbacks: {
        include: { actor: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  } catch (error) {
    console.error("Error fetching collaboration workspace:", error);
    return null;
  }
}
