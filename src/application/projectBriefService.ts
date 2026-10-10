import { prisma } from '@/infrastructure/database/prisma';
import { createNotification } from '@/application/notificationService';
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
  budget?: { estimatedTotal?: string; roleFees?: Record<string, string>; notes?: string };
  aestheticStyle?: string;
  compensationModel?: string;
  neededRoles: {
    roleLabel: string;
    assetCategory: string;
    description?: string;
    fee?: string;
    maxCollaborators?: number;
  }[];
}

export interface CrewCandidate {
  actor: {
    id: string;
    name: string;
    sector: string;
    location: string | null;
    description: string | null;
    aestheticStyles: string[];
    compensationModels: string[];
    owner?: { avatarUrl: string | null } | null;
  };
  matchScore: number;
  matchReasons: string[];
}

export interface CrewRecommendation {
  roleId: string;
  roleLabel: string;
  assetCategory: string;
  isFilled: boolean;
  candidates: CrewCandidate[];
}

export const recommendationsCache = new Map<string, { data: CrewRecommendation[]; timestamp: number }>();

export function clearRecommendationsCache(briefId?: string) {
  if (briefId) {
    recommendationsCache.delete(briefId);
  } else {
    recommendationsCache.clear();
  }
}

export async function createProjectBrief(
  creatorActorId: string,
  input: CreateProjectBriefInput
) {
  const roleFees: Record<string, string> = {
    ...((input.budget as any)?.roleFees || {}),
  };
  input.neededRoles.forEach((r) => {
    if (r.fee) {
      roleFees[r.roleLabel] = r.fee;
    }
  });

  const finalBudget = {
    ...(input.budget || {}),
    roleFees,
  };

  const brief = await prisma.projectBrief.create({
    data: {
      creatorActorId,
      title: input.title,
      description: input.description,
      projectType: input.projectType,
      targetOutput: input.targetOutput,
      location: input.location || null,
      timeline: (input.timeline || {}) as unknown as Prisma.InputJsonValue,
      budget: finalBudget as unknown as Prisma.InputJsonValue,
      aestheticStyle: input.aestheticStyle || null,
      compensationModel: input.compensationModel || "PAID",
      status: ProjectBriefStatus.OPEN,
      neededRoles: {
        create: input.neededRoles.map((r) => ({
          roleLabel: r.roleLabel,
          assetCategory: r.assetCategory as any,
          description: r.fee
            ? (r.description ? `${r.description} • [Honor: ${r.fee}]` : `Honor: ${r.fee}`)
            : (r.description || null),
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

export async function updateProjectBrief(
  briefId: string,
  actorId: string,
  input: Partial<CreateProjectBriefInput>
) {
  const brief = await prisma.projectBrief.findUnique({
    where: { id: briefId },
    select: { creatorActorId: true, status: true },
  });

  if (!brief) throw new Error('Brief tidak ditemukan.');
  if (brief.creatorActorId !== actorId) throw new Error('Hanya inisiator yang dapat mengedit brief.');
  if (brief.status === 'CLOSED' || brief.status === 'CANCELLED') {
    throw new Error('Brief yang sudah ditutup tidak dapat diedit.');
  }

  recommendationsCache.delete(briefId);

  return prisma.projectBrief.update({
    where: { id: briefId },
    data: {
      ...(input.title && { title: input.title }),
      ...(input.description && { description: input.description }),
      ...(input.projectType && { projectType: input.projectType }),
      ...(input.targetOutput && { targetOutput: input.targetOutput }),
      ...(input.location !== undefined && { location: input.location || null }),
      ...(input.timeline && { timeline: input.timeline as unknown as Prisma.InputJsonValue }),
      ...(input.budget && { budget: input.budget as unknown as Prisma.InputJsonValue }),
      ...(input.aestheticStyle !== undefined && { aestheticStyle: input.aestheticStyle || null }),
      ...(input.compensationModel !== undefined && { compensationModel: input.compensationModel || null }),
    },
  });
}

export async function closeProjectBrief(briefId: string, actorId: string) {
  const brief = await prisma.projectBrief.findUnique({
    where: { id: briefId },
    select: { creatorActorId: true, status: true },
  });

  if (!brief) throw new Error('Brief tidak ditemukan.');
  if (brief.creatorActorId !== actorId) throw new Error('Hanya inisiator yang dapat menutup brief.');

  recommendationsCache.delete(briefId);

  return prisma.projectBrief.update({
    where: { id: briefId },
    data: { status: ProjectBriefStatus.CLOSED },
  });
}

export async function deleteProjectBrief(briefId: string, actorId: string) {
  const brief = await prisma.projectBrief.findUnique({
    where: { id: briefId },
    include: {
      interests: { select: { status: true } },
    },
  });

  if (!brief) throw new Error('Brief tidak ditemukan.');
  if (brief.creatorActorId !== actorId) throw new Error('Hanya inisiator yang dapat menghapus brief.');

  const hasAccepted = brief.interests.some((i) => i.status === 'ACCEPTED');
  if (hasAccepted) {
    throw new Error('Brief dengan kolaborator yang sudah diterima tidak dapat dihapus. Gunakan fitur "Tutup Brief" sebagai gantinya.');
  }

  recommendationsCache.delete(briefId);

  // Hapus cascade: interests, roles, lalu brief
  await prisma.collaborationInterest.deleteMany({ where: { briefId } });
  await prisma.projectBriefRole.deleteMany({ where: { briefId } });
  await prisma.projectBrief.delete({ where: { id: briefId } });

  return { success: true };
}

export async function getProjectBriefs(filter?: {
  status?: ProjectBriefStatus;
  creatorActorId?: string;
  search?: string;
  roleCategory?: string;
  location?: string;
  compensationModel?: string;
}) {
  const where: Prisma.ProjectBriefWhereInput = {};
  const andConditions: Prisma.ProjectBriefWhereInput[] = [];

  if (filter?.status) {
    where.status = filter.status;
  }
  if (filter?.creatorActorId) {
    where.creatorActorId = filter.creatorActorId;
  }
  if (filter?.location && filter.location !== "ALL") {
    andConditions.push({
      OR: [
        { location: { contains: filter.location, mode: "insensitive" } },
        { creatorActor: { location: { contains: filter.location, mode: "insensitive" } } },
      ],
    });
  }
  if (filter?.compensationModel && filter.compensationModel !== "ALL") {
    const comp = filter.compensationModel.toUpperCase();
    if (comp === "PAID") {
      andConditions.push({
        OR: [
          { compensationModel: { equals: "PAID", mode: "insensitive" } },
          { compensationModel: { contains: "Paid", mode: "insensitive" } },
          { compensationModel: { contains: "Berbayar", mode: "insensitive" } },
        ],
      });
    } else if (comp === "BARTER" || comp === "RESOURCE_SHARING" || comp === "KOMPLEMENTER") {
      andConditions.push({
        OR: [
          { compensationModel: { equals: "BARTER", mode: "insensitive" } },
          { compensationModel: { contains: "Barter", mode: "insensitive" } },
          { compensationModel: { contains: "Resource Sharing", mode: "insensitive" } },
          { compensationModel: { contains: "Komplementer", mode: "insensitive" } },
          { compensationModel: { equals: "VOLUNTEER", mode: "insensitive" } },
          { compensationModel: { contains: "Gotong Royong", mode: "insensitive" } },
        ],
      });
    } else if (comp === "TFP") {
      andConditions.push({
        OR: [
          { compensationModel: { equals: "TFP", mode: "insensitive" } },
          { compensationModel: { contains: "TFP", mode: "insensitive" } },
          { compensationModel: { contains: "Trade for", mode: "insensitive" } },
        ],
      });
    } else if (comp === "REVENUE_SHARE") {
      andConditions.push({
        OR: [
          { compensationModel: { equals: "REVENUE_SHARE", mode: "insensitive" } },
          { compensationModel: { contains: "Revenue", mode: "insensitive" } },
          { compensationModel: { contains: "Bagi Hasil", mode: "insensitive" } },
        ],
      });
    } else {
      andConditions.push({
        compensationModel: { contains: filter.compensationModel, mode: "insensitive" },
      });
    }
  }
  if (filter?.search && filter.search.trim()) {
    const term = filter.search.trim();
    andConditions.push({
      OR: [
        { title: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
        { location: { contains: term, mode: "insensitive" } },
        { targetOutput: { contains: term, mode: "insensitive" } },
        {
          neededRoles: {
            some: {
              roleLabel: { contains: term, mode: "insensitive" },
            },
          },
        },
        {
          creatorActor: {
            name: { contains: term, mode: "insensitive" },
          },
        },
      ],
    });
  }
  if (filter?.roleCategory && filter.roleCategory !== "ALL") {
    const rc = filter.roleCategory.toLowerCase();
    const roleConditions: Prisma.ProjectBriefRoleWhereInput[] = [
      { roleLabel: { contains: filter.roleCategory, mode: "insensitive" } },
    ];

    if (rc.includes("studio")) {
      roleConditions.push({ assetCategory: "STUDIO_SPACE" });
      roleConditions.push({ roleLabel: { contains: "venue", mode: "insensitive" } });
    } else if (rc.includes("foto")) {
      roleConditions.push({ roleLabel: { contains: "photographer", mode: "insensitive" } });
      roleConditions.push({ roleLabel: { contains: "fotografi", mode: "insensitive" } });
      roleConditions.push({ roleLabel: { contains: "kamera", mode: "insensitive" } });
    } else if (rc.includes("model")) {
      roleConditions.push({ roleLabel: { contains: "talent", mode: "insensitive" } });
      roleConditions.push({ roleLabel: { contains: "muse", mode: "insensitive" } });
      roleConditions.push({ roleLabel: { contains: "peraga", mode: "insensitive" } });
    } else if (rc.includes("stylist") || rc.includes("wardrobe") || rc.includes("gaya")) {
      roleConditions.push({ roleLabel: { contains: "stylist", mode: "insensitive" } });
      roleConditions.push({ roleLabel: { contains: "wardrobe", mode: "insensitive" } });
      roleConditions.push({ roleLabel: { contains: "penata", mode: "insensitive" } });
    } else if (rc.includes("mua") || rc.includes("makeup") || rc.includes("rias") || rc.includes("hair")) {
      roleConditions.push({ roleLabel: { contains: "mua", mode: "insensitive" } });
      roleConditions.push({ roleLabel: { contains: "makeup", mode: "insensitive" } });
      roleConditions.push({ roleLabel: { contains: "rias", mode: "insensitive" } });
      roleConditions.push({ roleLabel: { contains: "hair", mode: "insensitive" } });
    } else if (rc.includes("brand") || rc.includes("umkm") || rc.includes("label")) {
      roleConditions.push({ roleLabel: { contains: "brand", mode: "insensitive" } });
      roleConditions.push({ roleLabel: { contains: "umkm", mode: "insensitive" } });
      roleConditions.push({ roleLabel: { contains: "label", mode: "insensitive" } });
    } else if (rc.includes("props") || rc.includes("set")) {
      roleConditions.push({ assetCategory: "WARDROBE_PROP" });
      roleConditions.push({ roleLabel: { contains: "properti", mode: "insensitive" } });
    } else if (rc.includes("director")) {
      roleConditions.push({ roleLabel: { contains: "art", mode: "insensitive" } });
    }

    andConditions.push({
      neededRoles: {
        some: {
          OR: roleConditions,
        },
      },
    });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  return prisma.projectBrief.findMany({
    where,
    include: {
      creatorActor: {
        select: {
          id: true,
          name: true,
          sector: true,
          actorType: true,
          location: true,
          owner: { select: { avatarUrl: true } },
        },
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
    orderBy: { createdAt: "desc" },
  });
}

export async function getProjectBriefById(id: string) {
  return prisma.projectBrief.findUnique({
    where: { id },
    include: {
      creatorActor: { include: { owner: { select: { avatarUrl: true } } } },
      neededRoles: {
        include: {
          interests: {
            include: {
              actor: {
                include: {
                  owner: { select: { avatarUrl: true } },
                  assets: { where: { status: 'ACTIVE' } },
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      },
      interests: {
        include: { actor: { include: { owner: { select: { avatarUrl: true } } } }, role: true },
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
  const brief = await prisma.projectBrief.findUnique({
    where: { id: briefId },
    select: { id: true, title: true, creatorActorId: true, status: true },
  });
  if (!brief) {
    throw new Error('Brief proyek tidak ditemukan.');
  }
  if (brief.creatorActorId === actorId) {
    throw new Error('Anda tidak dapat mendaftar pada brief yang Anda buat sendiri.');
  }
  if (brief.status !== 'OPEN') {
    throw new Error('Brief proyek ini sudah tidak menerima pendaftaran baru.');
  }

  const role = await prisma.projectBriefRole.findUnique({ where: { id: roleId } });
  if (!role || role.isFilled) {
    throw new Error('Peran ini sudah terisi atau tidak ditemukan.');
  }
  if (role.briefId !== briefId) {
    throw new Error('Peran yang dipilih tidak sesuai dengan brief proyek ini.');
  }

  const existing = await prisma.collaborationInterest.findUnique({
    where: { briefId_actorId_roleId: { briefId, actorId, roleId } },
  });

  let result;
  if (existing) {
    if (existing.status === InterestStatus.WITHDRAWN || existing.status === InterestStatus.DECLINED) {
      result = await prisma.collaborationInterest.update({
        where: { id: existing.id },
        data: {
          status: InterestStatus.PENDING,
          message: message || null,
          proposedAssets: (proposedAssetIds || []) as unknown as Prisma.InputJsonValue,
        },
      });
    } else {
      throw new Error('Anda sudah menyatakan minat untuk peran ini.');
    }
  } else {
    result = await prisma.collaborationInterest.create({
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

  // Two-way notification: Notify brief initiator about the new applicant
  try {
    const brief = await prisma.projectBrief.findUnique({
      where: { id: briefId },
      select: { title: true, creatorActorId: true },
    });
    const candidate = await prisma.actor.findUnique({
      where: { id: actorId },
      select: { name: true },
    });

    if (brief && candidate && brief.creatorActorId !== actorId) {
      await createNotification({
        actorId: brief.creatorActorId,
        title: "Peminat Kolaborasi Baru",
        message: `${candidate.name} mengajukan minat untuk peran "${role.roleLabel}" pada brief proyek "${brief.title}".`,
        type: "INTEREST_RECEIVED",
        link: `/projects/${briefId}/interests`,
        metadata: { briefId, roleId, candidateActorId: actorId },
      });
    }
  } catch (notifErr) {
    console.error("Failed to notify initiator of new interest:", notifErr);
  }

  return result;
}

export async function acceptCollaborator(interestId: string, initiatorActorId: string) {
  const interest = await prisma.collaborationInterest.findUnique({
    where: { id: interestId },
    include: {
      brief: {
        include: {
          creatorActor: true,
          neededRoles: true,
        },
      },
      role: true,
      actor: true,
    },
  });

  if (!interest) throw new Error('Interest tidak ditemukan.');
  if (interest.brief.creatorActorId !== initiatorActorId) {
    throw new Error('Hanya pembuat brief yang dapat menerima kolaborator.');
  }
  if (interest.brief.status !== 'OPEN') {
    throw new Error('Brief ini sudah ditutup atau tidak aktif.');
  }
  if (interest.status !== InterestStatus.PENDING) {
    throw new Error('Lamaran ini sudah tidak dalam status menunggu konfirmasi.');
  }
  if (interest.role.isFilled) {
    throw new Error('Peran ini sudah terisi.');
  }

  // Find other candidates for this role to notify them that the slot is filled
  const otherPendingInterests = await prisma.collaborationInterest.findMany({
    where: {
      roleId: interest.roleId,
      briefId: interest.briefId,
      id: { not: interestId },
      status: InterestStatus.PENDING,
    },
    select: { id: true, actorId: true },
  });

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

  const updatedBrief = await prisma.projectBrief.findUnique({
    where: { id: interest.briefId },
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

  const isAllRolesFilled = Boolean(
    updatedBrief &&
    updatedBrief.neededRoles.length > 0 &&
    updatedBrief.neededRoles.every((r) => r.isFilled)
  );

  let collaborationId: string | null = updatedBrief?.collaborationId || null;

  if (isAllRolesFilled) {
    // 1. Brief status becomes FILLED
    await prisma.projectBrief.update({
      where: { id: interest.briefId },
      data: { status: ProjectBriefStatus.FILLED },
    });

    // 2. AUTO-CREATE COLLABORATION WORKSPACE
    try {
      const colResult = await formCollaborationFromBrief(interest.briefId, initiatorActorId);
      if (colResult?.collaborationId) {
        collaborationId = colResult.collaborationId;
      }
    } catch (err) {
      console.error("Auto formation of collaboration failed in acceptCollaborator:", err);
    }

    // 3. TWO-WAY NOTIFICATIONS:
    // a. Notify Initiator
    try {
      await createNotification({
        actorId: initiatorActorId,
        title: "Tim Kolaborasi Lengkap & Workspace Aktif!",
        message: `Seluruh peran pada brief "${interest.brief.title}" telah terisi. Ruang kerja kolaborasi resmi telah dibentuk dan siap digunakan bersama seluruh tim.`,
        type: "COLLABORATION_STARTED",
        link: collaborationId ? `/collaborations/${collaborationId}` : `/projects/${interest.briefId}`,
        metadata: { briefId: interest.briefId, collaborationId },
      });
    } catch (e) {
      console.error("Failed to notify initiator:", e);
    }

    // b. Notify newly accepted collaborator
    try {
      await createNotification({
        actorId: interest.actorId,
        title: "Lamaran Diterima & Tim Lengkap!",
        message: `Selamat! Anda resmi diterima sebagai ${interest.role.roleLabel} pada proyek "${interest.brief.title}" oleh ${interest.brief.creatorActor.name}. Seluruh peran tim telah lengkap dan ruang kolaborasi kini aktif.`,
        type: "COLLABORATION_STARTED",
        link: collaborationId ? `/collaborations/${collaborationId}` : `/projects/${interest.briefId}`,
        metadata: { briefId: interest.briefId, collaborationId },
      });
    } catch (e) {
      console.error("Failed to notify accepted candidate:", e);
    }

    // c. Notify all other previously accepted collaborators for other roles
    const otherAcceptedActorIds = new Set<string>();
    for (const role of updatedBrief?.neededRoles || []) {
      for (const acceptedInt of role.interests) {
        if (acceptedInt.actorId !== interest.actorId && acceptedInt.actorId !== initiatorActorId) {
          otherAcceptedActorIds.add(acceptedInt.actorId);
        }
      }
    }

    for (const otherActorId of otherAcceptedActorIds) {
      try {
        await createNotification({
          actorId: otherActorId,
          title: "Tim Proyek Lengkap & Workspace Aktif!",
          message: `Seluruh peran untuk proyek "${interest.brief.title}" telah terisi lengkap. Ruang kolaborasi resmi kini aktif dan siap dieksekusi bersama.`,
          type: "COLLABORATION_STARTED",
          link: collaborationId ? `/collaborations/${collaborationId}` : `/projects/${interest.briefId}`,
          metadata: { briefId: interest.briefId, collaborationId },
        });
      } catch (e) {
        console.error("Failed to notify existing accepted team member:", e);
      }
    }
  } else {
    // If not all roles are filled yet, but collaboration already existed from manual start, sync this new collaborator
    if (updatedBrief?.collaborationId) {
      try {
        const colResult = await formCollaborationFromBrief(interest.briefId, initiatorActorId);
        if (colResult?.collaborationId) {
          collaborationId = colResult.collaborationId;
        }
      } catch (err) {
        console.error("Sync to existing collaboration failed:", err);
      }
    }

    // NOTIFICATION 1: Notify accepted candidate
    try {
      await createNotification({
        actorId: interest.actorId,
        title: "Lamaran Kolaborasi Diterima!",
        message: `Selamat! Anda resmi diterima sebagai ${interest.role.roleLabel} pada proyek "${interest.brief.title}" oleh ${interest.brief.creatorActor.name}. Menunggu peran tim lainnya terisi sebelum ruang kolaborasi resmi dimulai.`,
        type: "INTEREST_ACCEPTED",
        link: collaborationId ? `/collaborations/${collaborationId}` : `/projects/${interest.briefId}`,
        metadata: { briefId: interest.briefId, collaborationId },
      });
    } catch (e) {
      console.error("Failed to notify accepted candidate:", e);
    }

    // NOTIFICATION 2: Notify initiator
    const filledCount = updatedBrief?.neededRoles.filter((r) => r.isFilled).length || 1;
    const totalCount = updatedBrief?.neededRoles.length || 1;
    try {
      await createNotification({
        actorId: initiatorActorId,
        title: `Kolaborator Diterima (${filledCount}/${totalCount})`,
        message: `${interest.actor.name} telah diterima untuk peran ${interest.role.roleLabel} pada proyek "${interest.brief.title}". Masih menunggu sisa peran terisi.`,
        type: "INFO",
        link: `/projects/${interest.briefId}`,
        metadata: { briefId: interest.briefId, candidateActorId: interest.actorId },
      });
    } catch (e) {
      console.error("Failed to notify initiator:", e);
    }
  }

  // NOTIFICATION TO OTHER PENDING CANDIDATES THAT ROLE IS FILLED
  for (const other of otherPendingInterests) {
    try {
      await createNotification({
        actorId: other.actorId,
        title: "Update Lamaran Proyek",
        message: `Slot peran ${interest.role.roleLabel} pada proyek "${interest.brief.title}" telah terisi oleh kandidat lain. Terima kasih telah mengajukan minat.`,
        type: "INTEREST_DECLINED",
        link: `/projects/${interest.briefId}`,
        metadata: { briefId: interest.briefId },
      });
    } catch (e) {
      console.error("Failed to notify other candidate:", e);
    }
  }

  recommendationsCache.delete(interest.briefId);
  return { success: true, isFilled: isAllRolesFilled, collaborationId };
}

export async function declineCollaborator(interestId: string, initiatorActorId: string) {
  const interest = await prisma.collaborationInterest.findUnique({
    where: { id: interestId },
    include: { brief: true, role: true },
  });

  if (!interest) throw new Error('Interest tidak ditemukan.');
  if (interest.brief.creatorActorId !== initiatorActorId) {
    throw new Error('Hanya pembuat brief yang dapat menolak kolaborator.');
  }
  if (interest.status !== InterestStatus.PENDING) {
    throw new Error('Lamaran ini sudah tidak dalam status menunggu respon.');
  }

  await prisma.collaborationInterest.update({
    where: { id: interestId },
    data: { status: InterestStatus.DECLINED },
  });

  recommendationsCache.delete(interest.briefId);

  try {
    await createNotification({
      actorId: interest.actorId,
      title: "Update Lamaran Proyek",
      message: `Inisiator proyek "${interest.brief.title}" belum dapat melanjutkan kolaborasi untuk peran ${interest.role.roleLabel} saat ini.`,
      type: "INTEREST_DECLINED",
      link: `/projects/${interest.briefId}`,
      metadata: { briefId: interest.briefId },
    });
  } catch (e) {
    console.error("Failed to notify declined candidate:", e);
  }

  return { success: true };
}

export async function withdrawInterest(interestId: string, actorId: string) {
  const interest = await prisma.collaborationInterest.findUnique({ where: { id: interestId } });

  if (!interest) throw new Error('Interest tidak ditemukan.');
  if (interest.actorId !== actorId) throw new Error('Bukan milik Anda.');
  if (interest.status !== InterestStatus.PENDING) {
    throw new Error('Lamaran ini sudah tidak dalam status menunggu respon.');
  }

  await prisma.collaborationInterest.update({
    where: { id: interestId },
    data: { status: InterestStatus.WITHDRAWN },
  });

  recommendationsCache.delete(interest.briefId);
  return { success: true };
}

export async function inviteActorToBriefRole(
  initiatorActorId: string,
  targetActorId: string,
  briefId: string,
  roleId: string,
  customMessage?: string
) {
  if (targetActorId === initiatorActorId) {
    throw new Error('Anda tidak dapat mengundang diri Anda sendiri ke peran ini.');
  }

  const initiator = await prisma.actor.findUnique({
    where: { id: initiatorActorId },
    select: { id: true, name: true },
  });
  if (!initiator) throw new Error('Inisiator tidak ditemukan.');

  const brief = await prisma.projectBrief.findUnique({
    where: { id: briefId },
    select: { id: true, title: true, creatorActorId: true, status: true },
  });
  if (!brief) throw new Error('Brief tidak ditemukan.');
  if (brief.creatorActorId !== initiatorActorId) {
    throw new Error('Hanya inisiator proyek yang dapat mengundang kolaborator.');
  }
  if (brief.status !== 'OPEN') {
    throw new Error('Brief proyek ini tidak sedang dalam status aktif/terbuka.');
  }

  const role = await prisma.projectBriefRole.findUnique({
    where: { id: roleId },
  });
  if (!role || role.isFilled) {
    throw new Error('Peran ini sudah terisi atau tidak ditemukan.');
  }
  if (role.briefId !== briefId) {
    throw new Error('Peran yang dipilih tidak sesuai dengan brief proyek ini.');
  }

  const targetActor = await prisma.actor.findUnique({
    where: { id: targetActorId },
    select: { id: true, name: true },
  });
  if (!targetActor) throw new Error('Kreator target tidak ditemukan.');

  const existing = await prisma.collaborationInterest.findUnique({
    where: { briefId_actorId_roleId: { briefId, actorId: targetActorId, roleId } },
  });

  const inviteMessage =
    customMessage ||
    `Undangan Kolaborasi dari Inisiator\n\nAnda direkomendasikan oleh Smart Crew Builder RAMU dan secara khusus diundang oleh inisiator proyek "${brief.title}" untuk bergabung dalam peran "${role.roleLabel}". Silakan tinjau dan tanggapi undangan ini.`;

  let interestRecord;
  if (existing) {
    if (existing.status === InterestStatus.PENDING) {
      throw new Error('Kreator ini sudah memiliki status minat/undangan aktif untuk peran ini.');
    }
    if (existing.status === InterestStatus.ACCEPTED) {
      throw new Error('Kreator ini sudah resmi diterima dalam peran ini.');
    }
    interestRecord = await prisma.collaborationInterest.update({
      where: { id: existing.id },
      data: {
        status: InterestStatus.PENDING,
        isInvited: true,
        message: inviteMessage,
        proposedAssets: [] as unknown as Prisma.InputJsonValue,
      },
    });
  } else {
    interestRecord = await prisma.collaborationInterest.create({
      data: {
        briefId,
        roleId,
        actorId: targetActorId,
        isInvited: true,
        message: inviteMessage,
        proposedAssets: [] as unknown as Prisma.InputJsonValue,
        status: InterestStatus.PENDING,
      },
    });
  }

  recommendationsCache.delete(briefId);

  try {
    await createNotification({
      actorId: targetActorId,
      title: "Undangan Kolaborasi Proyek",
      message: `${initiator.name} mengundang Anda untuk bergabung dalam peran "${role.roleLabel}" pada proyek "${brief.title}". Mari tinjau rincian proyek dan tanggapi undangan ini!`,
      type: "INTEREST_RECEIVED",
      link: `/projects/${briefId}`,
      metadata: {
        briefId,
        roleId,
        interestId: interestRecord.id,
        isInvited: true,
        initiatorActorId,
      },
    });
  } catch (notifErr) {
    console.error("Failed to notify invited actor:", notifErr);
  }

  return { success: true, interestId: interestRecord.id };
}

export async function respondToProjectInvitation(
  interestId: string,
  actorId: string,
  response: "ACCEPT" | "DECLINE"
) {
  const interest = await prisma.collaborationInterest.findUnique({
    where: { id: interestId },
    include: {
      brief: {
        include: {
          creatorActor: true,
          neededRoles: true,
        },
      },
      role: true,
      actor: true,
    },
  });

  if (!interest) throw new Error('Undangan tidak ditemukan.');
  if (interest.actorId !== actorId) {
    throw new Error('Anda tidak memiliki izin untuk menanggapi undangan ini.');
  }
  if (!interest.isInvited) {
    throw new Error('Ini adalah pengajuan mandiri, bukan undangan inisiator.');
  }
  if (interest.status !== InterestStatus.PENDING) {
    throw new Error('Undangan ini sudah tidak dalam status menunggu respon.');
  }
  if (interest.brief.status !== 'OPEN') {
    throw new Error('Brief proyek ini sudah ditutup atau tidak aktif.');
  }

  if (response === 'DECLINE') {
    await prisma.collaborationInterest.update({
      where: { id: interestId },
      data: { status: InterestStatus.DECLINED },
    });

    recommendationsCache.delete(interest.briefId);

    try {
      await createNotification({
        actorId: interest.brief.creatorActorId,
        title: "Undangan Kolaborasi Ditolak",
        message: `${interest.actor.name} belum dapat menerima undangan untuk peran "${interest.role.roleLabel}" pada proyek "${interest.brief.title}".`,
        type: "INTEREST_DECLINED",
        link: `/projects/${interest.briefId}/interests`,
        metadata: { briefId: interest.briefId, roleId: interest.roleId, candidateActorId: actorId },
      });
    } catch (e) {
      console.error("Failed to notify initiator of declined invite:", e);
    }

    return { success: true, status: "DECLINED" };
  }

  // response === 'ACCEPT'
  const currentRole = await prisma.projectBriefRole.findUnique({
    where: { id: interest.roleId },
  });
  if (currentRole?.isFilled) {
    throw new Error('Peran ini sayangnya telah terisi oleh kolaborator lain.');
  }

  const otherPendingInterests = await prisma.collaborationInterest.findMany({
    where: {
      roleId: interest.roleId,
      briefId: interest.briefId,
      id: { not: interestId },
      status: InterestStatus.PENDING,
    },
    select: { id: true, actorId: true },
  });

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

  recommendationsCache.delete(interest.briefId);

  const updatedBrief = await prisma.projectBrief.findUnique({
    where: { id: interest.briefId },
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

  const isAllRolesFilled = Boolean(
    updatedBrief &&
    updatedBrief.neededRoles.length > 0 &&
    updatedBrief.neededRoles.every((r) => r.isFilled)
  );

  let collaborationId: string | null = updatedBrief?.collaborationId || null;

  if (isAllRolesFilled) {
    await prisma.projectBrief.update({
      where: { id: interest.briefId },
      data: { status: ProjectBriefStatus.FILLED },
    });

    try {
      const colResult = await formCollaborationFromBrief(interest.briefId, interest.brief.creatorActorId);
      if (colResult?.collaborationId) {
        collaborationId = colResult.collaborationId;
      }
    } catch (err) {
      console.error("Auto formation of collaboration failed in respondToProjectInvitation:", err);
    }

    try {
      await createNotification({
        actorId: interest.brief.creatorActorId,
        title: "Undangan Diterima & Tim Lengkap!",
        message: `${interest.actor.name} menerima undangan Anda. Seluruh peran pada proyek "${interest.brief.title}" kini telah lengkap dan ruang kolaborasi resmi aktif!`,
        type: "COLLABORATION_STARTED",
        link: collaborationId ? `/collaborations/${collaborationId}` : `/projects/${interest.briefId}`,
        metadata: { briefId: interest.briefId, collaborationId },
      });
    } catch (e) {
      console.error("Failed to notify initiator:", e);
    }

    try {
      await createNotification({
        actorId: interest.actorId,
        title: "Kolaborasi Resmi Dimulai!",
        message: `Selamat! Anda resmi bergabung dalam peran ${interest.role.roleLabel} pada proyek "${interest.brief.title}". Seluruh tim telah lengkap dan workspace telah dibuka!`,
        type: "COLLABORATION_STARTED",
        link: collaborationId ? `/collaborations/${collaborationId}` : `/projects/${interest.briefId}`,
        metadata: { briefId: interest.briefId, collaborationId },
      });
    } catch (e) {
      console.error("Failed to notify accepted invitee:", e);
    }

    const otherAcceptedActorIds = new Set<string>();
    for (const role of updatedBrief?.neededRoles || []) {
      for (const acceptedInt of role.interests) {
        if (acceptedInt.actorId !== interest.actorId && acceptedInt.actorId !== interest.brief.creatorActorId) {
          otherAcceptedActorIds.add(acceptedInt.actorId);
        }
      }
    }

    for (const otherActorId of otherAcceptedActorIds) {
      try {
        await createNotification({
          actorId: otherActorId,
          title: "Tim Proyek Lengkap & Workspace Aktif!",
          message: `Seluruh peran untuk proyek "${interest.brief.title}" telah terisi lengkap. Ruang kolaborasi resmi kini aktif dan siap dieksekusi bersama.`,
          type: "COLLABORATION_STARTED",
          link: collaborationId ? `/collaborations/${collaborationId}` : `/projects/${interest.briefId}`,
          metadata: { briefId: interest.briefId, collaborationId },
        });
      } catch (e) {
        console.error("Failed to notify existing team member:", e);
      }
    }
  } else {
    if (updatedBrief?.collaborationId) {
      try {
        const colResult = await formCollaborationFromBrief(interest.briefId, interest.brief.creatorActorId);
        if (colResult?.collaborationId) {
          collaborationId = colResult.collaborationId;
        }
      } catch (err) {
        console.error("Sync to existing collaboration failed:", err);
      }
    }

    try {
      await createNotification({
        actorId: interest.brief.creatorActorId,
        title: "Undangan Kolaborasi Diterima!",
        message: `${interest.actor.name} telah menerima undangan Anda untuk peran "${interest.role.roleLabel}" pada proyek "${interest.brief.title}".`,
        type: "INTEREST_ACCEPTED",
        link: `/projects/${interest.briefId}`,
        metadata: { briefId: interest.briefId, candidateActorId: interest.actorId },
      });
    } catch (e) {
      console.error("Failed to notify initiator of accepted invite:", e);
    }

    try {
      await createNotification({
        actorId: interest.actorId,
        title: "Undangan Kolaborasi Berhasil Diterima!",
        message: `Anda resmi bergabung sebagai ${interest.role.roleLabel} pada proyek "${interest.brief.title}". Menunggu peran tim lainnya terisi sebelum ruang kolaborasi resmi dimulai.`,
        type: "INTEREST_ACCEPTED",
        link: `/projects/${interest.briefId}`,
        metadata: { briefId: interest.briefId },
      });
    } catch (e) {
      console.error("Failed to notify invitee:", e);
    }
  }

  for (const other of otherPendingInterests) {
    try {
      await createNotification({
        actorId: other.actorId,
        title: "Update Lamaran Proyek",
        message: `Slot peran ${interest.role.roleLabel} pada proyek "${interest.brief.title}" telah terisi. Terima kasih telah mengajukan minat.`,
        type: "INTEREST_DECLINED",
        link: `/projects/${interest.briefId}`,
        metadata: { briefId: interest.briefId },
      });
    } catch (e) {
      console.error("Failed to notify other candidate:", e);
    }
  }

  return { success: true, status: "ACCEPTED", isFilled: isAllRolesFilled, collaborationId };
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

  // If collaboration already exists, sync any newly accepted participants
  if (brief.collaborationId) {
    const existingParticipants = await prisma.collaborationParticipant.findMany({
      where: { collaborationId: brief.collaborationId },
    });
    const existingActorIds = new Set(existingParticipants.map((p) => p.actorId));

    const plan = await prisma.collaborationPlan.findFirst({
      where: { collaboration: { id: brief.collaborationId } },
    });
    const budgetData = (brief.budget as Record<string, any>) || {};
    const roleFees = (budgetData.roleFees as Record<string, string>) || {};

    for (const role of brief.neededRoles) {
      for (const interest of role.interests) {
        if (!existingActorIds.has(interest.actorId)) {
          await prisma.collaborationParticipant.create({
            data: {
              collaborationId: brief.collaborationId,
              actorId: interest.actorId,
              roleCode: role.assetCategory,
              status: ParticipantCollaborationStatus.ACTIVE,
            },
          });
          if (plan) {
            const feeForRole = roleFees[role.roleLabel] || roleFees[role.assetCategory] || null;
            await prisma.collaborationRole.create({
              data: {
                collaborationPlanId: plan.id,
                actorId: interest.actorId,
                roleCode: role.assetCategory,
                responsibility: role.roleLabel,
                contribution: feeForRole
                  ? `Alokasi Honor: ${feeForRole} (Termin DP 50% & Pelunasan 50%)`
                  : 'Menyediakan aset dan kapabilitas sesuai peran dalam kolaborasi',
                status: 'ACCEPTED',
              },
            });
          }
          existingActorIds.add(interest.actorId);
        }
      }
    }
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

  const budgetData = (brief.budget as Record<string, any>) || {};
  const timelineData = (brief.timeline as Record<string, any>) || {};
  const roleFees = (budgetData.roleFees as Record<string, string>) || {};

  const plan = await prisma.collaborationPlan.create({
    data: {
      createdByActorId: initiatorActorId,
      title: brief.title,
      objective: brief.description,
      expectedOutputs: [brief.targetOutput] as unknown as Prisma.InputJsonValue,
      budget: {
        estimatedTotal: budgetData?.estimatedTotal || 'Disepakati bersama',
        costSharingModel: 'Honorarium Profesional Flat per Peran (Termin DP 50% & Pelunasan 50%)',
        roleFees,
        notes: budgetData?.notes || '',
      } as unknown as Prisma.InputJsonValue,
      timeline: {
        estimatedDuration: timelineData?.estimatedDuration || 'Sesuai kesepakatan',
        targetLaunch: timelineData?.targetLaunch || 'Bulan Depan',
      } as unknown as Prisma.InputJsonValue,
      revenueModel: {
        modelType: 'FIXED_FEE',
        description: 'Honorarium profesional per peran dengan termin pembayaran DP 50% di muka dan pelunasan 50% pasca-produksi.',
        roleFees,
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
    const feeForRole = roleFees[p.roleLabel] || roleFees[p.roleCode] || null;
    await prisma.collaborationRole.create({
      data: {
        collaborationPlanId: plan.id,
        actorId: p.actorId,
        roleCode: p.roleCode,
        responsibility: p.roleLabel,
        contribution: feeForRole
          ? `Alokasi Honor: ${feeForRole} (Termin DP 50% & Pelunasan 50%)`
          : 'Menyediakan aset dan kapabilitas sesuai peran dalam kolaborasi',
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

  await prisma.decision.create({
    data: {
      collaborationId: collaboration.id,
      title: 'Pembentukan Kolaborasi dari Project Brief',
      decision: `Kolaborasi terbentuk dari Project Brief "${brief.title}" yang diinisiasi oleh ${brief.creatorActor.name}.`,
      reason: 'Semua peran yang dibutuhkan telah terisi oleh kolaborator yang dipilih oleh initiator.',
      agreedByActors: participants.map((p) => p.actorId) as unknown as Prisma.InputJsonValue,
    },
  });

  const isAllRolesFilled = brief.neededRoles.every((r) => r.isFilled);

  await prisma.projectBrief.update({
    where: { id: briefId },
    data: {
      collaborationId: collaboration.id,
      status: isAllRolesFilled ? ProjectBriefStatus.FILLED : brief.status,
    },
  });

  for (const p of participants) {
    if (p.actorId !== initiatorActorId) {
      try {
        await createNotification({
          actorId: p.actorId,
          title: "Ruang Kolaborasi Aktif!",
          message: `${brief.creatorActor.name} telah meluncurkan ruang kerja kolaborasi untuk proyek "${brief.title}". Mari berkoordinasi bersama!`,
          type: "COLLABORATION_STARTED",
          link: `/collaborations/${collaboration.id}`,
          metadata: { briefId, collaborationId: collaboration.id },
        });
      } catch (err) {
        console.error("Failed to notify participant in formCollaborationFromBrief:", err);
      }
    }
  }

  return { success: true, collaborationId: collaboration.id, isNew: true };
}

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
    take: 5,
    include: {
      creatorActor: {
        select: {
          id: true,
          name: true,
          sector: true,
          location: true,
          owner: { select: { avatarUrl: true } },
        },
      },
      neededRoles: {
        select: { id: true, roleLabel: true, isFilled: true, assetCategory: true },
      },
    },
  });

  return { openBriefCount, pendingInterestCount, myBriefCount, recentOpenBriefs };
}

export async function getCrewRecommendationsForBrief(
  briefId: string,
  preloadedBrief?: any
): Promise<CrewRecommendation[]> {
  const cached = recommendationsCache.get(briefId);

  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
    return cached.data;
  }

  const brief = preloadedBrief ?? await getProjectBriefById(briefId);
  if (!brief) return [];

  const neededCategories = Array.from(new Set(brief.neededRoles.map((r: any) => r.assetCategory).filter(Boolean)));

  const actors = await prisma.actor.findMany({
    where: {
      status: 'ACTIVE',
      id: { not: brief.creatorActorId },
    },
    select: {
      id: true,
      name: true,
      sector: true,
      actorType: true,
      location: true,
      description: true,
      aestheticStyles: true,
      compensationModels: true,
      owner: { select: { avatarUrl: true } },
      assets: {
        where: { status: 'ACTIVE' },
        select: { category: true, subtype: true },
      },
    },
  });

  const activeByRole = new Map<string, Set<string>>();
  for (const role of brief.neededRoles) {
    const activeActorIds = new Set<string>(
      (role.interests || [])
        .filter((i: any) => i.status === InterestStatus.ACCEPTED || i.status === InterestStatus.PENDING)
        .map((i: any) => String(i.actorId))
    );
    activeByRole.set(role.id, activeActorIds);
  }

  const results: CrewRecommendation[] = [];

  for (const role of brief.neededRoles) {
    const alreadyActive = activeByRole.get(role.id) ?? new Set<string>();

    const candidates = actors
      .filter((actor) => !alreadyActive.has(actor.id))
      .map((actor) => {
        let score = 0;
        const matchReasons: string[] = [];
        const actorCategories = actor.assets.map((a) => a.category);

        if (actorCategories.includes(role.assetCategory)) {
          score += 50;
          matchReasons.push('Kategori Aset Cocok');
        } else {
          // Fallback matching: analisa keselarasan sektor dan profil ke peran brief
          const roleLabelLower = (role.roleLabel || '').toLowerCase();
          const categoryLower = (role.assetCategory || '').toLowerCase();
          const sectorLower = (actor.sector || '').toLowerCase();
          const descLower = (actor.description || '').toLowerCase();

          const isDirectSectorMatch =
            sectorLower.includes(roleLabelLower) ||
            roleLabelLower.includes(sectorLower) ||
            descLower.includes(roleLabelLower);

          const isDomainSynonymMatch =
            (roleLabelLower.includes('foto') && sectorLower.includes('foto')) ||
            (roleLabelLower.includes('model') && (sectorLower.includes('model') || sectorLower.includes('talent') || sectorLower.includes('muse'))) ||
            (roleLabelLower.includes('styl') && (sectorLower.includes('styl') || sectorLower.includes('mua'))) ||
            (roleLabelLower.includes('mua') && (sectorLower.includes('mua') || sectorLower.includes('make') || sectorLower.includes('styl'))) ||
            ((roleLabelLower.includes('wardrobe') || roleLabelLower.includes('penata')) && (sectorLower.includes('stylist') || sectorLower.includes('mua'))) ||
            (roleLabelLower.includes('studio') && (sectorLower.includes('studio') || actor.actorType === 'STUDIO')) ||
            ((roleLabelLower.includes('brand') || roleLabelLower.includes('umkm') || roleLabelLower.includes('label')) && (sectorLower.includes('brand') || sectorLower.includes('umkm') || actor.actorType === 'BRAND')) ||
            (categoryLower.includes('talent') && (sectorLower.includes('model') || sectorLower.includes('kreator'))) ||
            (categoryLower.includes('studio') && actor.actorType === 'STUDIO');

          if (isDirectSectorMatch || isDomainSynonymMatch) {
            score += 35;
            matchReasons.push('Sektor Talenta Sesuai');
          }
        }

        if (
          brief.aestheticStyle &&
          actor.aestheticStyles.includes(brief.aestheticStyle)
        ) {
          score += 20;
          matchReasons.push('Gaya Visual Sesuai');
        }

        if (brief.location && actor.location) {
          const briefLoc = brief.location.toLowerCase();
          const actorLoc = actor.location.toLowerCase();
          if (
            actorLoc.includes(briefLoc) ||
            briefLoc.includes(actorLoc) ||
            briefLoc.includes('remote') ||
            actorLoc.includes('remote')
          ) {
            score += 15;
            matchReasons.push('Lokasi Sesuai');
          }
        }

        if (
          brief.compensationModel &&
          actor.compensationModels.includes(brief.compensationModel)
        ) {
          score += 15;
          matchReasons.push('Model Kompensasi Sesuai');
        }

        return { actor, matchScore: score, matchReasons };
      })
      .filter((c) => c.matchScore >= 35)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 4);

    results.push({
      roleId: role.id,
      roleLabel: role.roleLabel,
      assetCategory: role.assetCategory,
      isFilled: role.isFilled,
      candidates,
    });
  }

  recommendationsCache.set(briefId, { data: results, timestamp: Date.now() });
  return results;
}

export async function getRecommendedActorsForBrief(briefId: string) {
  const perRole = await getCrewRecommendationsForBrief(briefId);

  const seen = new Set<string>();
  const flat: { actor: CrewCandidate['actor']; matchScore: number; matchReasons: string[] }[] = [];
  for (const rec of perRole) {
    for (const c of rec.candidates) {
      if (!seen.has(c.actor.id)) {
        seen.add(c.actor.id);
        flat.push(c);
      }
    }
  }
  return flat.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
}
