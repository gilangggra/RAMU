"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import {
  initiateCollaborationFromOpportunity,
} from "@/application/collaborationService";
import { createNotification } from "@/application/notificationService";
import {
  TaskStatus,
  TaskPriority,
  MilestoneStatus,
  CollaborationStatus,
  Prisma,
} from "@prisma/client";

async function getPrimaryActor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const actor = await prisma.actor.findFirst({
    where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    orderBy: { createdAt: "asc" },
  });

  if (!actor) redirect("/onboarding");
  return actor;
}

async function ensureCollaborationParticipant(collaborationId: string, actorId: string) {
  const collab = await prisma.collaboration.findUnique({
    where: { id: collaborationId },
    include: {
      participants: {
        where: { actorId, status: "ACTIVE" },
      },
    },
  });

  if (!collab) {
    throw new Error("Kolaborasi tidak ditemukan.");
  }

  if (collab.participants.length === 0) {
    throw new Error("Anda tidak terdaftar sebagai peserta aktif di kolaborasi ini.");
  }

  if (collab.status === CollaborationStatus.COMPLETED || collab.status === CollaborationStatus.CANCELLED) {
    throw new Error("Kolaborasi ini sudah ditutup dan tidak dapat dimodifikasi lagi.");
  }

  return collab;
}

export async function initiateCollaboration(opportunityId: string) {
  const actor = await getPrimaryActor();

  try {
    const res = await initiateCollaborationFromOpportunity(opportunityId, actor.id);
    revalidatePath("/collaborations");
    revalidatePath("/projects");
    revalidatePath(`/opportunities/${opportunityId}`);
    revalidatePath("/dashboard");
    return { success: true, collaborationId: res.collaborationId };
  } catch (error) {
    console.error("Error initiating collaboration:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menginisiasi kolaborasi.",
    };
  }
}

export async function updateCollaborationTerms(planId: string, formData: FormData) {
  const actor = await getPrimaryActor();

  const estimatedTotal = (formData.get("estimatedTotal") as string)?.trim();
  const costSharingModel = (formData.get("costSharingModel") as string)?.trim();
  const estimatedDuration = (formData.get("estimatedDuration") as string)?.trim();
  const targetLaunch = (formData.get("targetLaunch") as string)?.trim();
  const proposedSplit = (formData.get("proposedSplit") as string)?.trim();
  const brandModel = (formData.get("brandModel") as string)?.trim();
  const originalIp = (formData.get("originalIp") as string)?.trim();
  const derivativeWorks = (formData.get("derivativeWorks") as string)?.trim();

  try {
    const plan = await prisma.collaborationPlan.findUnique({
      where: { id: planId },
      include: {
        collaboration: {
          include: { participants: true },
        },
      },
    });

    if (!plan) throw new Error("Rencana kolaborasi tidak ditemukan.");

    const isAuthorized =
      plan.createdByActorId === actor.id ||
      plan.collaboration?.participants.some((p) => p.actorId === actor.id);

    if (!isAuthorized) {
      throw new Error("Anda tidak memiliki izin untuk mengubah ketentuan rencana ini.");
    }

    const budget = {
      estimatedTotal: estimatedTotal || "Rp 15.000.000",
      costSharingModel: costSharingModel || "Proporsional sesuai kontribusi",
    };

    const timeline = {
      estimatedDuration: estimatedDuration || "6 Minggu",
      targetLaunch: targetLaunch || "Bulan Depan",
    };

    const revenueModel = {
      modelType: "REVENUE_SHARE",
      proposedSplit: proposedSplit || "50% : 50%",
    };

    const ownershipRules = {
      brandModel: brandModel || "Co-Branding Bersama",
    };

    const ipRules = {
      originalIp: originalIp || "Hak cipta tetap milik pencipta asli",
      derivativeWorks: derivativeWorks || "Hak pakai bersama selama proyek aktif",
    };

    await prisma.collaborationPlan.update({
      where: { id: planId },
      data: {
        budget: budget as unknown as Prisma.InputJsonValue,
        timeline: timeline as unknown as Prisma.InputJsonValue,
        revenueModel: revenueModel as unknown as Prisma.InputJsonValue,
        ownershipRules: ownershipRules as unknown as Prisma.InputJsonValue,
        ipRules: ipRules as unknown as Prisma.InputJsonValue,

        status: plan.status,
      },
    });

    if (plan.collaboration) {
      revalidatePath(`/collaborations/${plan.collaboration.id}`);
    }
    return { success: true };
  } catch (error) {
    console.error("Error updating terms:", error);
    return { success: false, error: "Gagal memperbarui ketentuan kolaborasi." };
  }
}

export async function createTask(collaborationId: string, formData: FormData) {
  const actor = await getPrimaryActor();

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const priorityStr = (formData.get("priority") as string)?.trim() as TaskPriority;
  const assignedActorId = (formData.get("assignedActorId") as string)?.trim() || actor.id;

  if (!title) {
    return { success: false, error: "Judul tugas wajib diisi." };
  }

  try {
    await ensureCollaborationParticipant(collaborationId, actor.id);

    if (assignedActorId) {
      const isAssignedParticipant = await prisma.collaborationParticipant.findFirst({
        where: {
          collaborationId,
          actorId: assignedActorId,
          status: "ACTIVE",
        },
      });
      if (!isAssignedParticipant) {
        return { success: false, error: "Aktor yang ditugaskan bukan peserta aktif dalam kolaborasi ini." };
      }
    }

    const task = await prisma.task.create({
      data: {
        collaborationId,
        title,
        description: description || null,
        priority: priorityStr || TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        assignedActorId,
      },
    });

    if (assignedActorId && assignedActorId !== actor.id) {
      const collab = await prisma.collaboration.findUnique({
        where: { id: collaborationId },
        select: { title: true },
      });
      createNotification({
        actorId: assignedActorId,
        title: `Tugas Baru: ${title}`,
        message: `${actor.name} mengalokasikan tugas '${title}' kepada Anda di kolaborasi '${collab?.title || "Proyek"}'.`,
        type: "INFO",
        link: `/collaborations/${collaborationId}`,
        metadata: { collaborationId, taskId: task.id },
      }).catch((e) => console.error("Failed to notify assigned task:", e));
    }

    revalidatePath(`/collaborations/${collaborationId}`);
    return { success: true };
  } catch (error) {
    console.error("Error creating task:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal menambahkan tugas." };
  }
}

export async function toggleTaskStatus(taskId: string, collaborationId: string, currentStatus: TaskStatus) {
  const actor = await getPrimaryActor();

  const nextStatus: Record<TaskStatus, TaskStatus> = {
    TODO: TaskStatus.IN_PROGRESS,
    IN_PROGRESS: TaskStatus.DONE,
    DONE: TaskStatus.TODO,
    BLOCKED: TaskStatus.TODO,
    CANCELLED: TaskStatus.TODO,
  };

  try {
    await ensureCollaborationParticipant(collaborationId, actor.id);

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task || task.collaborationId !== collaborationId) {
      return { success: false, error: "Tugas tidak ditemukan pada kolaborasi ini." };
    }

    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: nextStatus[currentStatus],
        completedAt: nextStatus[currentStatus] === TaskStatus.DONE ? new Date() : null,
      },
    });

    revalidatePath(`/collaborations/${collaborationId}`);
    return { success: true };
  } catch (error) {
    console.error("Error toggling task:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal mengubah status tugas." };
  }
}

export async function deleteTask(taskId: string, collaborationId: string) {
  const actor = await getPrimaryActor();

  try {
    await ensureCollaborationParticipant(collaborationId, actor.id);

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task || task.collaborationId !== collaborationId) {
      return { success: false, error: "Tugas tidak ditemukan pada kolaborasi ini." };
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    revalidatePath(`/collaborations/${collaborationId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting task:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal menghapus tugas." };
  }
}

export async function updateMilestoneStatus(
  milestoneId: string,
  collaborationId: string,
  status: MilestoneStatus
) {
  const actor = await getPrimaryActor();

  try {
    await ensureCollaborationParticipant(collaborationId, actor.id);

    const milestone = await prisma.milestone.findUnique({ where: { id: milestoneId } });
    if (!milestone || milestone.collaborationId !== collaborationId) {
      return { success: false, error: "Milestone tidak ditemukan pada kolaborasi ini." };
    }

    await prisma.milestone.update({
      where: { id: milestoneId },
      data: { status },
    });

    revalidatePath(`/collaborations/${collaborationId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating milestone:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal mengubah status milestone." };
  }
}

export async function recordDecision(collaborationId: string, formData: FormData) {
  const actor = await getPrimaryActor();

  const title = (formData.get("title") as string)?.trim();
  const decision = (formData.get("decision") as string)?.trim();
  const reason = (formData.get("reason") as string)?.trim();

  if (!title || !decision) {
    return { success: false, error: "Judul dan rincian keputusan wajib diisi." };
  }

  try {
    await ensureCollaborationParticipant(collaborationId, actor.id);

    await prisma.decision.create({
      data: {
        collaborationId,
        title,
        decision,
        reason: reason || null,
        agreedByActors: [actor.id] as unknown as Prisma.InputJsonValue,
      },
    });

    const collab = await prisma.collaboration.findUnique({
      where: { id: collaborationId },
      include: {
        participants: {
          where: { status: "ACTIVE" },
        },
      },
    });

    if (collab) {
      for (const p of collab.participants) {
        if (p.actorId !== actor.id) {
          createNotification({
            actorId: p.actorId,
            title: `Mufakat Baru: ${title}`,
            message: `${actor.name} mencatat keputusan baru di kolaborasi '${collab.title}': "${decision}".`,
            type: "INFO",
            link: `/collaborations/${collaborationId}`,
            metadata: { collaborationId },
          }).catch((e) => console.error("Failed to notify decision:", e));
        }
      }
    }

    revalidatePath(`/collaborations/${collaborationId}`);
    return { success: true };
  } catch (error) {
    console.error("Error recording decision:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal mencatat keputusan." };
  }
}

export async function updateSharedProjectLinks(planId: string, formData: FormData) {
  const actor = await getPrimaryActor();

  const moodboardUrl = (formData.get("moodboardUrl") as string)?.trim() || "";
  const assetsFolderUrl = (formData.get("assetsFolderUrl") as string)?.trim() || "";
  const notesUrl = (formData.get("notesUrl") as string)?.trim() || "";

  try {
    const plan = await prisma.collaborationPlan.findUnique({
      where: { id: planId },
      include: {
        collaboration: {
          include: { participants: true },
        },
      },
    });

    if (!plan) throw new Error("Rencana kolaborasi tidak ditemukan.");

    const isAuthorized =
      plan.createdByActorId === actor.id ||
      plan.collaboration?.participants.some((p) => p.actorId === actor.id);

    if (!isAuthorized) {
      throw new Error("Anda tidak memiliki izin untuk mengubah tautan kerja sama ini.");
    }

    const timeline = ((plan.timeline as any) || {}) as Record<string, any>;
    timeline.projectLinks = {
      moodboardUrl,
      assetsFolderUrl,
      notesUrl,
    };

    await prisma.collaborationPlan.update({
      where: { id: planId },
      data: {
        timeline: timeline as unknown as Prisma.InputJsonValue,
      },
    });

    if (plan.collaboration) {
      revalidatePath(`/collaborations/${plan.collaboration.id}`);
    }
    return { success: true };
  } catch (error) {
    console.error("Error updating project links:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal menyimpan tautan kerja sama." };
  }
}

export async function signSpkAction(
  collaborationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await getPrimaryActor();

    const collabCheck = await prisma.collaboration.findUnique({
      where: { id: collaborationId },
      select: { status: true },
    });
    if (!collabCheck) {
      return { success: false, error: "Kolaborasi tidak ditemukan." };
    }
    if (collabCheck.status === CollaborationStatus.CANCELLED) {
      return { success: false, error: "Kolaborasi yang telah dibatalkan tidak dapat ditandatangani." };
    }

    const participant = await prisma.collaborationParticipant.findFirst({
      where: {
        collaborationId,
        actorId: actor.id,
        status: "ACTIVE",
      },
    });

    if (!participant) {
      return {
        success: false,
        error: "Anda bukan bagian dari kolaborasi ini atau tidak memiliki akses untuk menandatangani.",
      };
    }

    if (participant.signedAt) {
      return {
        success: false,
        error: "Anda sudah pernah menandatangani perjanjian ini sebelumnya.",
      };
    }

    await prisma.collaborationParticipant.update({
      where: { id: participant.id },
      data: { signedAt: new Date() },
    });

    // Periksa status pengesahan seluruh pihak
    const collab = await prisma.collaboration.findUnique({
      where: { id: collaborationId },
      include: {
        participants: {
          where: { status: "ACTIVE" },
          include: { actor: true },
        },
      },
    });

    if (collab) {
      const activeParticipants = collab.participants;
      const allSigned =
        activeParticipants.length > 0 &&
        activeParticipants.every((p) => Boolean(p.signedAt));

      if (allSigned) {
        // Otomatis aktifkan kolaborasi secara formal
        if (collab.status !== CollaborationStatus.COMPLETED) {
          await prisma.collaboration.update({
            where: { id: collaborationId },
            data: {
              status: CollaborationStatus.ACTIVE,
              startedAt: collab.startedAt ?? new Date(),
            },
          });
        }

        // Sinkronisasi status pengesahan ke bookingRequest terkait jika ada
        try {
          const linkedBookings = await prisma.bookingRequest.findMany({
            where: {
              details: {
                path: ["collaborationId"],
                equals: collaborationId,
              },
            },
          });
          for (const lb of linkedBookings) {
            const currentDetails = (lb.details as Record<string, any>) || {};
            await prisma.bookingRequest.update({
              where: { id: lb.id },
              data: {
                details: {
                  ...currentDetails,
                  spkFullySignedAt: new Date().toISOString(),
                  spkStatus: "RATIFIED",
                },
              },
            });
            revalidatePath(`/dashboard/bookings/${lb.id}`);
          }
        } catch (e) {
          console.error("Failed to sync spk sign status to booking request:", e);
        }

        // Notifikasi ke seluruh pihak bahwa SPK telah sah penuh
        for (const p of activeParticipants) {
          createNotification({
            actorId: p.actorId,
            title: "SPK Sah & Berlaku Penuh!",
            message: `Seluruh pihak (${activeParticipants.length} kreator) telah menandatangani SPK kolaborasi '${collab.title}'. Ruang kerja resmi aktif penuh.`,
            type: "COLLABORATION_STARTED",
            link: `/collaborations/${collaborationId}`,
            metadata: { collaborationId, status: "ACTIVE" },
          }).catch((e) => console.error("Failed to notify SPK full ratification:", e));
        }
      } else {
        // Notifikasi ke pihak lain bahwa rekan mereka telah menandatangani SPK
        for (const p of activeParticipants) {
          if (p.actorId !== actor.id) {
            createNotification({
              actorId: p.actorId,
              title: `${actor.name} Telah Menandatangani SPK`,
              message: `${actor.name} telah membubuhkan tanda tangan digital pada SPK '${collab.title}'. Silakan tanda tangani untuk mengaktifkan kesepakatan.`,
              type: "INFO",
              link: `/collaborations/${collaborationId}`,
              metadata: { collaborationId, signedByActorId: actor.id },
            }).catch((e) => console.error("Failed to notify partner SPK sign:", e));
          }
        }
      }
    }

    revalidatePath(`/collaborations/${collaborationId}`);
    revalidatePath("/collaborations");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/bookings");

    return { success: true };
  } catch (error) {
    console.error("Error signing SPK:", error);
    return { success: false, error: "Gagal mencatat tanda tangan digital. Silakan coba lagi." };
  }
}
