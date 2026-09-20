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

  const defaultBudget = {
    estimatedTotal: "Rp 15.000.000",
    costSharingModel: "Proporsional sesuai kontribusi porsi produksi",
    notes: "Dapat disesuaikan berdasarkan skala produksi batch perdana.",
  };

  const defaultTimeline = {
    estimatedDuration: "6 Minggu",
    targetLaunch: "Bulan Depan",
    phases: [
      "Minggu 1: Penyelarasan Konsep & Sampel",
      "Minggu 2-4: Fabrikasi & Produksi Bersama",
      "Minggu 5: Dokumentasi Visual & Foto Katalog",
      "Minggu 6: Peluncuran Bersama",
    ],
  };

  const defaultRevenueModel = {
    modelType: "REVENUE_SHARE",
    description: "Bagi hasil penjualan bersih proporsional sesuai peran kriya dan material.",
    proposedSplit: "50% Produsen Utama : 50% Mitra Kolaborator (Bisa Dinegosiasikan)",
  };

  const defaultOwnershipRules = {
    brandModel: "Co-Branding Bersama",
    guidelines: "Produk diluncurkan di bawah nama kolaborasi bersama kedua brand.",
  };

  const defaultIpRules = {
    originalIp: "Hak cipta motif/desain/formula tetap menjadi milik eksklusif pencipta asli.",
    derivativeWorks: "Desain turunan kolaboratif dilindungi hak pakai bersama selama proyek aktif.",
  };

  const plan = await prisma.collaborationPlan.create({
    data: {
      opportunityId: opp.id,
      createdByActorId: initiatorActorId,
      title: opp.title,
      objective: opp.description,
      expectedOutputs: (opp.expectedOutputs as unknown as Prisma.InputJsonValue) || [],
      budget: defaultBudget as unknown as Prisma.InputJsonValue,
      timeline: defaultTimeline as unknown as Prisma.InputJsonValue,
      revenueModel: defaultRevenueModel as unknown as Prisma.InputJsonValue,
      ownershipRules: defaultOwnershipRules as unknown as Prisma.InputJsonValue,
      ipRules: defaultIpRules as unknown as Prisma.InputJsonValue,
      status: CollaborationPlanStatus.PROPOSED,
    },
  });

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

  const initialTasks = [
    {
      title: "Penyelarasan Konsep & Sampel Awal",
      description: "Menyepakati detail motif, kombinasi bahan, dan ukuran sampel fisik pertama.",
      priority: TaskPriority.HIGH,
      assignedActorId: initiatorActorId,
    },
    {
      title: "Penyusunan Anggaran & Skema Pembagian Hasil",
      description: "Menetapkan rincian biaya produksi dan kesepakatan pembagian pendapatan secara tertulis.",
      priority: TaskPriority.HIGH,
      assignedActorId: initiatorActorId,
    },
    {
      title: "Pengerjaan Produksi Batch Perdana",
      description: "Pelaksanaan produksi batch pertama sesuai standar mutu yang telah disepakati.",
      priority: TaskPriority.MEDIUM,
      assignedActorId: opp.participants[1]?.actorId || initiatorActorId,
    },
    {
      title: "Sesi Dokumentasi Visual & Katalog Komersial",
      description: "Pemotretan produk untuk materi e-commerce, media sosial, dan penawaran pembeli.",
      priority: TaskPriority.MEDIUM,
      assignedActorId: opp.participants.find((p) => p.roleCode.includes("VISUAL") || p.roleCode.includes("PHOTO"))?.actorId || initiatorActorId,
    },
    {
      title: "Peluncuran & Promosi Lintas Kanal",
      description: "Membuka penawaran dan kampanye bersama ke basis audiens masing-masing mitra.",
      priority: TaskPriority.MEDIUM,
      assignedActorId: initiatorActorId,
    },
  ];

  for (const t of initialTasks) {
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

  const initialMilestones = [
    {
      title: "Konsep & Spesifikasi Disetujui",
      description: "Semua mitra telah menyetujui arah estetika, material, dan peran kerja.",
      status: MilestoneStatus.IN_PROGRESS,
    },
    {
      title: "Prototipe / Sampel Fisik Terverifikasi",
      description: "Sampel pertama selesai dan lolos evaluasi kualitas.",
      status: MilestoneStatus.PENDING,
    },
    {
      title: "Batch Produksi Selesai & Lolos QC",
      description: "Produk siap untuk didokumentasikan dan dikemas.",
      status: MilestoneStatus.PENDING,
    },
    {
      title: "Peluncuran Resmi ke Pasar",
      description: "Katalog dirilis dan penjualan perdana dibuka.",
      status: MilestoneStatus.PENDING,
    },
  ];

  for (const m of initialMilestones) {
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
      participants: {
        some: { actorId },
      },
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

export async function getCollaborationWorkspace(collaborationId: string) {
  return prisma.collaboration.findUnique({
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
}
