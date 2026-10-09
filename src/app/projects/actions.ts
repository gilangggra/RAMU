"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import {
  createProjectBrief,
  updateProjectBrief,
  closeProjectBrief,
  deleteProjectBrief,
  expressInterest,
  acceptCollaborator,
  declineCollaborator,
  withdrawInterest,
  formCollaborationFromBrief,
  getCrewRecommendationsForBrief,
  inviteActorToBriefRole,
  respondToProjectInvitation,
  clearRecommendationsCache,
} from "@/application/projectBriefService";


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

export async function createProjectBriefAction(formData: FormData) {
  const actor = await getPrimaryActor();

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const projectType = (formData.get("projectType") as string)?.trim();
  const targetOutput = (formData.get("targetOutput") as string)?.trim();
  const location = (formData.get("location") as string)?.trim() || undefined;
  const estimatedDuration = (formData.get("estimatedDuration") as string)?.trim();
  const targetLaunch = (formData.get("targetLaunch") as string)?.trim();
  const compensationModel = (formData.get("compensationModel") as string)?.trim();
  const estimatedTotal = (formData.get("estimatedTotal") as string)?.trim();
  const budgetNotes = (formData.get("budgetNotes") as string)?.trim();
  const aestheticStyle = (formData.get("aestheticStyle") as string)?.trim();

  if (!title || !description || !projectType || !targetOutput) {
    return { success: false, error: "Judul, deskripsi, jenis proyek, dan target output wajib diisi." };
  }

  let neededRoles: {
    roleLabel: string;
    assetCategory: string;
    description?: string;
    fee?: string;
    maxCollaborators?: number;
  }[] = [];

  try {
    const rolesRaw = formData.get("neededRoles") as string;
    if (rolesRaw) {
      neededRoles = JSON.parse(rolesRaw);
    }
  } catch {
    return { success: false, error: "Format data peran tidak valid." };
  }

  if (neededRoles.length === 0) {
    return { success: false, error: "Tambahkan minimal satu peran yang dibutuhkan." };
  }

  try {
    const brief = await createProjectBrief(actor.id, {
      title,
      description,
      projectType,
      targetOutput,
      location,
      timeline: { estimatedDuration, targetLaunch },
      budget: { estimatedTotal, notes: budgetNotes },
      aestheticStyle,
      compensationModel,
      neededRoles,
    });

    revalidatePath("/projects");
    revalidatePath("/dashboard");

    getCrewRecommendationsForBrief(brief.id).catch((err) =>
      console.error("Failed to auto-trigger engine:", err)
    );

    return { success: true, briefId: brief.id };
  } catch (error) {
    console.error("Error creating project brief:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal membuat project brief.",
    };
  }
}

export async function expressInterestAction(formData: FormData) {
  const actor = await getPrimaryActor();

  const briefId = formData.get("briefId") as string;
  const roleId = formData.get("roleId") as string;
  const message = (formData.get("message") as string)?.trim() || undefined;

  let proposedAssetIds: string[] = [];
  try {
    const raw = formData.get("proposedAssets") as string;
    if (raw) proposedAssetIds = JSON.parse(raw);
  } catch {
  }

  if (!briefId || !roleId) {
    return { success: false, error: "Data tidak lengkap." };
  }

  try {
    await expressInterest(actor.id, briefId, roleId, message, proposedAssetIds);
    revalidatePath(`/projects/${briefId}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error expressing interest:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menyatakan minat.",
    };
  }
}

export async function acceptCollaboratorAction(interestId: string, briefId: string) {
  const actor = await getPrimaryActor();

  try {
    const result = await acceptCollaborator(interestId, actor.id);
    revalidatePath(`/projects/${briefId}`);
    revalidatePath(`/projects/${briefId}/interests`);
    revalidatePath("/projects");
    revalidatePath("/dashboard");
    revalidatePath("/collaborations");
    return {
      success: true,
      collaborationId: result.collaborationId,
      isFilled: result.isFilled,
    };
  } catch (error) {
    console.error("Error accepting collaborator:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menerima kolaborator.",
    };
  }
}

export async function declineCollaboratorAction(interestId: string, briefId: string) {
  const actor = await getPrimaryActor();

  try {
    await declineCollaborator(interestId, actor.id);
    revalidatePath(`/projects/${briefId}/interests`);
    return { success: true };
  } catch (error) {
    console.error("Error declining collaborator:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menolak kolaborator.",
    };
  }
}

export async function withdrawInterestAction(interestId: string, briefId: string) {
  const actor = await getPrimaryActor();

  try {
    await withdrawInterest(interestId, actor.id);
    revalidatePath(`/projects/${briefId}`);
    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menarik minat.",
    };
  }
}

export async function formCollaborationAction(briefId: string) {
  const actor = await getPrimaryActor();

  try {
    const result = await formCollaborationFromBrief(briefId, actor.id);
    revalidatePath("/collaborations");
    revalidatePath(`/projects/${briefId}`);
    revalidatePath("/dashboard");
    return { success: true, collaborationId: result.collaborationId };
  } catch (error) {
    console.error("Error forming collaboration:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal membentuk kolaborasi.",
    };
  }
}

export async function inviteActorToRoleAction(
  targetActorId: string,
  briefId: string,
  roleId: string
) {
  const initiator = await getPrimaryActor();

  try {
    const res = await inviteActorToBriefRole(
      initiator.id,
      targetActorId,
      briefId,
      roleId
    );

    revalidatePath(`/projects/${briefId}`);
    revalidatePath(`/projects/${briefId}/interests`);
    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { success: true, interestId: res.interestId };
  } catch (error) {
    console.error("Error inviting actor:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengirim undangan.",
    };
  }
}

export async function respondToInvitationAction(
  interestId: string,
  response: "ACCEPT" | "DECLINE"
) {
  const actor = await getPrimaryActor();

  try {
    const res = await respondToProjectInvitation(interestId, actor.id, response);
    revalidatePath("/projects");
    revalidatePath("/dashboard");
    revalidatePath("/collaborations");
    return {
      success: true,
      status: res.status,
      collaborationId: res.collaborationId,
      isFilled: res.isFilled,
    };
  } catch (error) {
    console.error("Error responding to project invitation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menanggapi undangan.",
    };
  }
}

export async function refreshCrewRecommendationsAction(briefId: string) {
  try {
    clearRecommendationsCache(briefId);
    revalidatePath(`/projects/${briefId}`);
    return { success: true };
  } catch (error) {
    console.error("Error refreshing crew recommendations:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menyegarkan rekomendasi.",
    };
  }
}

export async function updateProjectBriefAction(formData: FormData) {
  const actor = await getPrimaryActor();

  const briefId = formData.get("briefId") as string;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const projectType = (formData.get("projectType") as string)?.trim();
  const targetOutput = (formData.get("targetOutput") as string)?.trim();
  const location = (formData.get("location") as string)?.trim() || undefined;
  const estimatedDuration = (formData.get("estimatedDuration") as string)?.trim();
  const targetLaunch = (formData.get("targetLaunch") as string)?.trim();
  const compensationModel = (formData.get("compensationModel") as string)?.trim();
  const estimatedTotal = (formData.get("estimatedTotal") as string)?.trim();
  const budgetNotes = (formData.get("budgetNotes") as string)?.trim();
  const aestheticStyle = (formData.get("aestheticStyle") as string)?.trim();

  if (!briefId) return { success: false, error: "ID brief tidak valid." };

  try {
    await updateProjectBrief(briefId, actor.id, {
      title,
      description,
      projectType,
      targetOutput,
      location,
      timeline: { estimatedDuration, targetLaunch },
      budget: { estimatedTotal, notes: budgetNotes },
      aestheticStyle,
      compensationModel,
      neededRoles: [],
    });

    revalidatePath(`/projects/${briefId}`);
    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui brief.",
    };
  }
}

export async function closeProjectBriefAction(briefId: string) {
  const actor = await getPrimaryActor();

  try {
    await closeProjectBrief(briefId, actor.id);
    revalidatePath(`/projects/${briefId}`);
    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menutup brief.",
    };
  }
}

export async function deleteProjectBriefAction(briefId: string) {
  const actor = await getPrimaryActor();

  try {
    await deleteProjectBrief(briefId, actor.id);
    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus brief.",
    };
  }
}
