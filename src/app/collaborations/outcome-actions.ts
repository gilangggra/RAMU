"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import {
  recordOutcome,
  completeCollaboration,
  submitCollaborationFeedback,
} from "@/application/outcomeService";
import { OutcomeType } from "@prisma/client";

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

export async function recordOutcomeAction(collaborationId: string, formData: FormData) {
  const actor = await getPrimaryActor();

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const outcomeType = (formData.get("outcomeType") as OutcomeType) || OutcomeType.PRODUCT;
  const unitsProducedRaw = (formData.get("unitsProduced") as string)?.trim();
  const revenueAmount = (formData.get("revenueAmount") as string)?.trim();
  const audienceReached = (formData.get("audienceReached") as string)?.trim();
  const evidenceUrl = (formData.get("evidenceUrl") as string)?.trim();
  const notes = (formData.get("notes") as string)?.trim();

  if (!title || !description) {
    return { success: false, error: "Judul dan deskripsi luaran wajib diisi." };
  }

  const unitsProduced = unitsProducedRaw && !isNaN(Number(unitsProducedRaw)) ? Number(unitsProducedRaw) : null;

  try {
    await recordOutcome({
      collaborationId,
      actorId: actor.id,
      title,
      description,
      outcomeType,
      metrics: {
        unitsProduced,
        revenueAmount: revenueAmount || null,
        audienceReached: audienceReached || null,
        evidenceUrl: evidenceUrl || null,
        notes: notes || null,
      },
    });

    revalidatePath(`/collaborations/${collaborationId}`);
    revalidatePath("/collaborations");
    revalidatePath("/dashboard");
    revalidatePath("/engine-insights");
    return { success: true };
  } catch (error) {
    console.error("Error recording outcome:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mencatat luaran kolaborasi.",
    };
  }
}

export async function completeCollaborationAction(collaborationId: string) {
  const actor = await getPrimaryActor();

  try {
    await completeCollaboration(collaborationId, actor.id);

    revalidatePath(`/collaborations/${collaborationId}`);
    revalidatePath("/collaborations");
    revalidatePath("/dashboard");
    revalidatePath("/engine-insights");
    return { success: true };
  } catch (error) {
    console.error("Error completing collaboration:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menyelesaikan status kolaborasi.",
    };
  }
}

export async function submitCollaborationFeedbackAction(
  collaborationId: string,
  formData: FormData
) {
  const actor = await getPrimaryActor();

  const relevanceScoreRaw = formData.get("relevanceScore") as string;
  const feasibilityScoreRaw = formData.get("feasibilityScore") as string;
  const noveltyScoreRaw = formData.get("noveltyScore") as string;
  const usefulnessScoreRaw = formData.get("usefulnessScore") as string;
  const comments = (formData.get("comments") as string)?.trim();

  const relevanceScore = relevanceScoreRaw ? Number(relevanceScoreRaw) : null;
  const feasibilityScore = feasibilityScoreRaw ? Number(feasibilityScoreRaw) : null;
  const noveltyScore = noveltyScoreRaw ? Number(noveltyScoreRaw) : null;
  const usefulnessScore = usefulnessScoreRaw ? Number(usefulnessScoreRaw) : null;

  try {
    await submitCollaborationFeedback({
      collaborationId,
      actorId: actor.id,
      relevanceScore,
      feasibilityScore,
      noveltyScore,
      usefulnessScore,
      comments: comments || null,
    });

    revalidatePath(`/collaborations/${collaborationId}`);
    revalidatePath("/dashboard");
    revalidatePath("/engine-insights");
    return { success: true };
  } catch (error) {
    console.error("Error submitting collaboration feedback:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menyimpan umpan balik evaluasi.",
    };
  }
}
