"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import {
  createProjectBrief,
  expressInterest,
  acceptCollaborator,
  declineCollaborator,
  withdrawInterest,
  formCollaborationFromBrief,
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
  const estimatedTotal = (formData.get("estimatedTotal") as string)?.trim();
  const budgetNotes = (formData.get("budgetNotes") as string)?.trim();

  if (!title || !description || !projectType || !targetOutput) {
    return { success: false, error: "Judul, deskripsi, jenis proyek, dan target output wajib diisi." };
  }

  let neededRoles: {
    roleLabel: string;
    assetCategory: string;
    description?: string;
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
      neededRoles,
    });

    revalidatePath("/projects");
    revalidatePath("/dashboard");

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

// ----------------------------------------------------------------------------
// ACCEPT COLLABORATOR
// ----------------------------------------------------------------------------

export async function acceptCollaboratorAction(interestId: string, briefId: string) {
  const actor = await getPrimaryActor();

  try {
    await acceptCollaborator(interestId, actor.id);
    revalidatePath(`/projects/${briefId}`);
    revalidatePath(`/projects/${briefId}/interests`);
    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error accepting collaborator:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menerima kolaborator.",
    };
  }
}

// ----------------------------------------------------------------------------
// DECLINE COLLABORATOR
// ----------------------------------------------------------------------------

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

// ----------------------------------------------------------------------------
// WITHDRAW INTEREST
// ----------------------------------------------------------------------------

export async function withdrawInterestAction(interestId: string, briefId: string) {
  const actor = await getPrimaryActor();

  try {
    await withdrawInterest(interestId, actor.id);
    revalidatePath(`/projects/${briefId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menarik minat.",
    };
  }
}

// ----------------------------------------------------------------------------
// FORM COLLABORATION FROM BRIEF
// ----------------------------------------------------------------------------

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
