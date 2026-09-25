import { prisma } from '@/infrastructure/database/prisma';
import {
  ProjectBriefStatus,
  InterestStatus,
  CollaborationPlanStatus,
  CollaborationStatus,
  ParticipantCollaborationStatus,
  TaskStatus,
  TaskPriority,
  MilestoneStatus,
  Prisma,
} from '@prisma/client';

export interface CreateProjectBriefInput {
  title: string;
  description: string;
  projectType: string;
  targetOutput: string;
  location?: string;
  timeline?: { estimatedDuration?: string; targetLaunch?: string };
  budget?: { estimatedTotal?: string; notes?: string };
  aestheticStyle?: string;
  compensationModel?: string;
  neededRoles: {
    roleLabel: string;
    assetCategory: string;
    description?: string;
    maxCollaborators?: number;
  }[];
}

export async function createProjectBrief(
  creatorActorId: string,
  input: CreateProjectBriefInput
) {
  const brief = await prisma.projectBrief.create({
    data: {
      creatorActorId,
      title: input.title,
      description: input.description,
      projectType: input.projectType,
      targetOutput: input.targetOutput,
      location: input.location || null,
      timeline: (input.timeline || {}) as unknown as Prisma.InputJsonValue,
      budget: (input.budget || {}) as unknown as Prisma.InputJsonValue,
      aestheticStyle: input.aestheticStyle || null,
      compensationModel: input.compensationModel || null,
      status: ProjectBriefStatus.OPEN,
      neededRoles: {
        create: input.neededRoles.map((r) => ({
          roleLabel: r.roleLabel,
          assetCategory: r.assetCategory as any,
          description: r.description || null,
          maxCollaborators: r.maxCollaborators ?? 1,
        })),
      },
    },
    include: {
      neededRoles: true,
      creatorActor: true,
    },
  });

  return brief;
}

export async function getProjectBriefs(filter?: {
  status?: ProjectBriefStatus;
  creatorActorId?: string;
}) {
  const where: Prisma.ProjectBriefWhereInput = {};

  if (filter?.status) {
    where.status = filter.status;
  }
  if (filter?.creatorActorId) {
    where.creatorActorId = filter.creatorActorId;
  }

  return prisma.projectBrief.findMany({
    where,
    include: {
      creatorActor: {
        select: { id: true, name: true, sector: true, actorType: true, location: true },
      },
      neededRoles: {
        include: {
          interests: {
            where: { status: { not: InterestStatus.DECLINED } },
            select: { id: true, status: true, actorId: true },
          },
        },
      },
      interests: {
        select: { id: true, actorId: true, status: true, roleId: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getProjectBriefById(id: string) {
  return prisma.projectBrief.findUnique({
    where: { id },
    include: {
      creatorActor: true,
      neededRoles: {
        include: {
          interests: {
            include: {
              actor: {
                include: {
                  assets: { where: { status: 'ACTIVE' } },
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      },
      interests: {
        include: { actor: true, role: true },
        orderBy: { createdAt: 'desc' },
      },
      collaboration: {
        select: { id: true, status: true },
      },
    },
  });
}

export async function expressInterest(
  actorId: string,
  briefId: string,
  roleId: string,
  message?: string,
  proposedAssetIds?: string[]
) {
  const role = await prisma.projectBriefRole.findUnique({ where: { id: roleId } });
  if (!role || role.isFilled) {
    throw new Error('Peran ini sudah terisi atau tidak ditemukan.');
  }

  const existing = await prisma.collaborationInterest.findUnique({
    where: { briefId_actorId_roleId: { briefId, actorId, roleId } },
  });

  if (existing) {
    if (existing.status === InterestStatus.WITHDRAWN || existing.status === InterestStatus.DECLINED) {
      return prisma.collaborationInterest.update({
        where: { id: existing.id },
        data: {
          status: InterestStatus.PENDING,
          message: message || null,
          proposedAssets: (proposedAssetIds || []) as unknown as Prisma.InputJsonValue,
        },
      });
    }
    throw new Error('Anda sudah menyatakan minat untuk peran ini.');
  }

  return prisma.collaborationInterest.create({
    data: {
      briefId,
      roleId,
      actorId,
      message: message || null,
      proposedAssets: (proposedAssetIds || []) as unknown as Prisma.InputJsonValue,
      status: InterestStatus.PENDING,
    },
  });
}

export async function acceptCollaborator(interestId: string, initiatorActorId: string) {
  const interest = await prisma.collaborationInterest.findUnique({
    where: { id: interestId },
    include: { brief: true, role: true },
  });

  if (!interest) throw new Error('Interest tidak ditemukan.');
  if (interest.brief.creatorActorId !== initiatorActorId) {
    throw new Error('Hanya pembuat brief yang dapat menerima kolaborator.');
  }

  await prisma.$transaction([
    prisma.collaborationInterest.update({
      where: { id: interestId },
      data: { status: InterestStatus.ACCEPTED },
    }),
    prisma.projectBriefRole.update({
      where: { id: interest.roleId },
      data: { isFilled: true },
    }),
    prisma.collaborationInterest.updateMany({
      where: {
        roleId: interest.roleId,
        briefId: interest.briefId,
        id: { not: interestId },
        status: InterestStatus.PENDING,
      },
      data: { status: InterestStatus.DECLINED },
    }),
  ]);

  const brief = await prisma.projectBrief.findUnique({
    where: { id: interest.briefId },
    include: { neededRoles: true },
  });

  if (brief && brief.neededRoles.every((r) => r.isFilled)) {
    await prisma.projectBrief.update({
      where: { id: interest.briefId },
      data: { status: ProjectBriefStatus.FILLED },
    });
  }

  return { success: true };
}

export async function declineCollaborator(interestId: string, initiatorActorId: string) {
  const interest = await prisma.collaborationInterest.findUnique({
    where: { id: interestId },
    include: { brief: true },
  });

  if (!interest) throw new Error('Interest tidak ditemukan.');
  if (interest.brief.creatorActorId !== initiatorActorId) {
    throw new Error('Hanya pembuat brief yang dapat menolak kolaborator.');
  }

  await prisma.collaborationInterest.update({
    where: { id: interestId },
    data: { status: InterestStatus.DECLINED },
  });

  return { success: true };
}

export async function withdrawInterest(interestId: string, actorId: string) {
  const interest = await prisma.collaborationInterest.findUnique({ where: { id: interestId } });

  if (!interest) throw new Error('Interest tidak ditemukan.');
  if (interest.actorId !== actorId) throw new Error('Bukan milik Anda.');

  await prisma.collaborationInterest.update({
    where: { id: interestId },
    data: { status: InterestStatus.WITHDRAWN },
  });

  return { success: true };
}

export async function formCollaborationFromBrief(
  briefId: string,
  initiatorActorId: string
) {
  const brief = await prisma.projectBrief.findUnique({
    where: { id: briefId },
    include: {
      neededRoles: {
        include: {
          interests: {
            where: { status: InterestStatus.ACCEPTED },
            include: { actor: true },
          },
        },
      },
      creatorActor: true,
    },
  });

  if (!brief) throw new Error('Project Brief tidak ditemukan.');
  if (brief.creatorActorId !== initiatorActorId) {
    throw new Error('Hanya pembuat brief yang dapat membentuk kolaborasi.');
  }
  if (brief.collaborationId) {
    return { success: true, collaborationId: brief.collaborationId, isNew: false };
  }

  const participants: { actorId: string; roleCode: string; roleLabel: string }[] = [
    {
      actorId: initiatorActorId,
      roleCode: 'INITIATOR',
      roleLabel: 'Inisiator Proyek',
    },
  ];

  for (const role of brief.neededRoles) {
    for (const interest of role.interests) {
      if (!participants.find((p) => p.actorId === interest.actorId)) {
        participants.push({
          actorId: interest.actorId,
          roleCode: role.assetCategory,
          roleLabel: role.roleLabel,
        });
      }
    }
  }

  const budgetData = (brief.budget as Record<string, unknown>) || {};
  const timelineData = (brief.timeline as Record<string, unknown>) || {};

  const plan = await prisma.collaborationPlan.create({
    data: {
      createdByActorId: initiatorActorId,
      title: brief.title,
      objective: brief.description,
      expectedOutputs: [brief.targetOutput] as unknown as Prisma.InputJsonValue,
      budget: {
        estimatedTotal: budgetData?.estimatedTotal || 'Disepakati bersama',
        costSharingModel: 'Proporsional sesuai kontribusi peran',
        notes: budgetData?.notes || '',
      } as unknown as Prisma.InputJsonValue,
      timeline: {
        estimatedDuration: timelineData?.estimatedDuration || 'Sesuai kesepakatan',
        targetLaunch: timelineData?.targetLaunch || 'Bulan Depan',
      } as unknown as Prisma.InputJsonValue,
      revenueModel: {
        modelType: 'REVENUE_SHARE',
        description: 'Bagi hasil proporsional berdasarkan peran dan kontribusi masing-masing kolaborator.',
        proposedSplit: 'Dapat dinegosiasikan oleh seluruh pihak',
      } as unknown as Prisma.InputJsonValue,
      ownershipRules: {
        brandModel: 'Co-Branding Bersama',
        guidelines: `Karya hasil kolaborasi "${brief.title}" diluncurkan atas nama seluruh pihak yang terlibat.`,
      } as unknown as Prisma.InputJsonValue,
      ipRules: {
        originalIp: 'Hak cipta konten/karya asli tetap milik eksklusif pencipta asli.',
        derivativeWorks: 'Karya turunan kolaboratif dilindungi hak pakai bersama selama proyek aktif.',
      } as unknown as Prisma.InputJsonValue,
      status: CollaborationPlanStatus.PROPOSED,
    },
  });

  for (const p of participants) {
    await prisma.collaborationRole.create({
      data: {
        collaborationPlanId: plan.id,
        actorId: p.actorId,
        roleCode: p.roleCode,
        responsibility: p.roleLabel,
        contribution: 'Menyediakan aset dan kapabilitas sesuai peran dalam kolaborasi',
        status: p.actorId === initiatorActorId ? 'ACCEPTED' : 'PENDING',
      },
    });
  }

  const collaboration = await prisma.collaboration.create({
    data: {
      collaborationPlanId: plan.id,
      title: brief.title,
      description: brief.description,
      status: CollaborationStatus.ACTIVE,
      startedAt: new Date(),
    },
  });

  for (const p of participants) {
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
      title: 'Penyelarasan Konsep & Pembagian Peran',
      description: 'Semua kolaborator menyepakati detail konsep, ekspektasi output, dan peran masing-masing.',
      priority: TaskPriority.HIGH,
      assignedActorId: initiatorActorId,
    },
    {
      title: 'Penyusunan Anggaran & Skema Pembagian Hasil',
      description: 'Menetapkan rincian biaya dan kesepakatan pembagian pendapatan secara tertulis.',
      priority: TaskPriority.HIGH,
      assignedActorId: initiatorActorId,
    },
    {
      title: `Eksekusi: ${brief.targetOutput}`,
      description: `Pengerjaan output utama proyek: "${brief.targetOutput}".`,
      priority: TaskPriority.MEDIUM,
      assignedActorId: participants[1]?.actorId || initiatorActorId,
    },
    {
      title: 'Review & Finalisasi Karya',
      description: 'Semua pihak melakukan review final terhadap hasil kerja sebelum peluncuran.',
      priority: TaskPriority.MEDIUM,
      assignedActorId: initiatorActorId,
    },
    {
      title: 'Peluncuran & Distribusi Bersama',
      description: 'Publish karya ke seluruh kanal distribusi yang dimiliki masing-masing kolaborator.',
      priority: TaskPriority.LOW,
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

  // Pre-seed Milestones
  const initialMilestones = [
    { title: 'Konsep & Peran Disepakati', status: MilestoneStatus.IN_PROGRESS },
    { title: 'Proses Produksi Dimulai', status: MilestoneStatus.PENDING },
    { title: 'Draft / Prototipe Karya Selesai', status: MilestoneStatus.PENDING },
    { title: 'Peluncuran Resmi', status: MilestoneStatus.PENDING },
  ];

  for (const m of initialMilestones) {
    await prisma.milestone.create({
      data: {
        collaborationId: collaboration.id,
        title: m.title,
        status: m.status,
      },
    });
  }

  // Decision log awal
  await prisma.decision.create({
    data: {
      collaborationId: collaboration.id,
      title: 'Pembentukan Kolaborasi dari Project Brief',
      decision: `Kolaborasi terbentuk dari Project Brief "${brief.title}" yang diinisiasi oleh ${brief.creatorActor.name}.`,
      reason: 'Semua peran yang dibutuhkan telah terisi oleh kolaborator yang dipilih oleh initiator.',
      agreedByActors: participants.map((p) => p.actorId) as unknown as Prisma.InputJsonValue,
    },
  });

  // Update brief -> link ke collaboration & status FILLED
  await prisma.projectBrief.update({
    where: { id: briefId },
    data: {
      collaborationId: collaboration.id,
      status: ProjectBriefStatus.FILLED,
    },
  });

  return { success: true, collaborationId: collaboration.id, isNew: true };
}

// ----------------------------------------------------------------------------
// GET INTERESTS FOR ACTOR (minat yang pernah dinyatakan)
// ----------------------------------------------------------------------------

export async function getInterestsForActor(actorId: string) {
  return prisma.collaborationInterest.findMany({
    where: { actorId },
    include: {
      brief: {
        include: {
          creatorActor: { select: { name: true, sector: true } },
        },
      },
      role: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

// ----------------------------------------------------------------------------
// GET COUNTS FOR DASHBOARD WIDGETS
// ----------------------------------------------------------------------------

export async function getProjectBriefDashboardStats(actorId: string) {
  const [openBriefCount, pendingInterestCount, myBriefCount] = await Promise.all([
    prisma.projectBrief.count({ where: { status: ProjectBriefStatus.OPEN } }),
    prisma.collaborationInterest.count({
      where: { actorId, status: InterestStatus.PENDING },
    }),
    prisma.projectBrief.count({ where: { creatorActorId: actorId } }),
  ]);

  const recentOpenBriefs = await prisma.projectBrief.findMany({
    where: { status: ProjectBriefStatus.OPEN, creatorActorId: { not: actorId } },
    orderBy: { createdAt: 'desc' },
    take: 3,
    include: {
      creatorActor: { select: { name: true, sector: true } },
      neededRoles: {
        select: { id: true, roleLabel: true, isFilled: true },
      },
    },
  });

  return { openBriefCount, pendingInterestCount, myBriefCount, recentOpenBriefs };
}

// ----------------------------------------------------------------------------
// SMART MATCHING ALGORITHM
// ----------------------------------------------------------------------------

export async function getRecommendedActorsForBrief(briefId: string) {
  const brief = await getProjectBriefById(briefId);
  if (!brief) return [];

  const neededCategories = brief.neededRoles.map(r => r.assetCategory);
  
  // Ambil semua aktor aktif kecuali kreator brief
  const actors = await prisma.actor.findMany({
    where: { 
      status: 'ACTIVE',
      id: { not: brief.creatorActorId }
    },
    include: {
      assets: {
        select: { category: true }
      }
    }
  });

  const scoredActors = actors.map(actor => {
    let score = 0;
    const matchReasons: string[] = [];

    // 1. Role Match (40% - up to 40 points)
    const actorCategories = actor.assets.map(a => a.category);
    let roleMatches = 0;
    for (const cat of neededCategories) {
      if (actorCategories.includes(cat)) {
        roleMatches++;
      }
    }
    if (neededCategories.length > 0 && roleMatches > 0) {
      const roleScore = Math.round((roleMatches / neededCategories.length) * 40);
      score += roleScore;
      if (roleScore > 0) matchReasons.push("Kategori Aset Sesuai");
    }

    // 2. Aesthetic Match (25% - 25 points)
    if (brief.aestheticStyle && actor.aestheticStyles.includes(brief.aestheticStyle)) {
      score += 25;
      matchReasons.push("Gaya Visual Sesuai");
    }

    // 3. Location Match (20% - 20 points)
    if (brief.location && actor.location) {
      if (actor.location.toLowerCase().includes(brief.location.toLowerCase()) || 
          brief.location.toLowerCase().includes(actor.location.toLowerCase()) ||
          brief.location.toLowerCase().includes('remote')) {
        score += 20;
        matchReasons.push("Lokasi Sesuai");
      }
    }

    // 4. Compensation Match (15% - 15 points)
    if (brief.compensationModel && actor.compensationModels.includes(brief.compensationModel)) {
      score += 15;
      matchReasons.push("Model Kompensasi Sesuai");
    }

    return {
      actor,
      matchScore: score,
      matchReasons
    };
  });

  return scoredActors
    .filter(a => a.matchScore >= 20) // Minimum threshold
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5); // Return top 5
}
