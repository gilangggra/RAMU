"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import {
  initiateCollaborationFromOpportunity,
} from "@/application/collaborationService";
import {
  TaskStatus,
  TaskPriority,
  MilestoneStatus,
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

export async function initiateCollaboration(opportunityId: string) {
  const actor = await getPrimaryActor();

  try {
    const res = await initiateCollaborationFromOpportunity(opportunityId, actor.id);
    revalidatePath("/collaborations");
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
  await getPrimaryActor();

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
      include: { collaboration: true },
    });

    if (!plan) throw new Error("Rencana kolaborasi tidak ditemukan.");

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
        // Status plan dipertahankan sesuai nilai saat ini — perubahan status dilakukan terpisah
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
    await prisma.task.create({
      data: {
        collaborationId,
        title,
        description: description || null,
        priority: priorityStr || TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        assignedActorId,
      },
    });

    revalidatePath(`/collaborations/${collaborationId}`);
    return { success: true };
  } catch (error) {
    console.error("Error creating task:", error);
    return { success: false, error: "Gagal menambahkan tugas." };
  }
}

export async function toggleTaskStatus(taskId: string, collaborationId: string, currentStatus: TaskStatus) {
  await getPrimaryActor();

  const nextStatus: Record<TaskStatus, TaskStatus> = {
    TODO: TaskStatus.IN_PROGRESS,
    IN_PROGRESS: TaskStatus.DONE,
    DONE: TaskStatus.TODO,
    BLOCKED: TaskStatus.TODO,
    CANCELLED: TaskStatus.TODO,
  };

  try {
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
    return { success: false, error: "Gagal mengubah status tugas." };
  }
}

export async function updateMilestoneStatus(
  milestoneId: string,
  collaborationId: string,
  status: MilestoneStatus
) {
  await getPrimaryActor();

  try {
    await prisma.milestone.update({
      where: { id: milestoneId },
      data: { status },
    });

    revalidatePath(`/collaborations/${collaborationId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating milestone:", error);
    return { success: false, error: "Gagal mengubah status milestone." };
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
    await prisma.decision.create({
      data: {
        collaborationId,
        title,
        decision,
        reason: reason || null,
        agreedByActors: [actor.id] as unknown as Prisma.InputJsonValue,
      },
    });

    revalidatePath(`/collaborations/${collaborationId}`);
    return { success: true };
  } catch (error) {
    console.error("Error recording decision:", error);
    return { success: false, error: "Gagal mencatat keputusan." };
  }
}
