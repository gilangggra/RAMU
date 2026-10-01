"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import {
  submitFeedback,
  getFeedbackForCollaboration,
  deleteFeedback,
} from "@/application/feedbackService";

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

export async function submitCollaborationFeedbackAction(formData: FormData) {
  const actor = await getPrimaryActor();

  const collaborationId = (formData.get("collaborationId") as string)?.trim();
  const relevanceScoreRaw = formData.get("relevanceScore");
  const feasibilityScoreRaw = formData.get("feasibilityScore");
  const noveltyScoreRaw = formData.get("noveltyScore");
  const usefulnessScoreRaw = formData.get("usefulnessScore");
  const comments = (formData.get("comments") as string)?.trim();

  if (!collaborationId) {
    return { success: false, error: "ID Kolaborasi wajib disertakan." };
  }

  try {
    const feedback = await submitFeedback({
      actorId: actor.id,
      collaborationId,
      relevanceScore: relevanceScoreRaw ? Number(relevanceScoreRaw) : undefined,
      feasibilityScore: feasibilityScoreRaw ? Number(feasibilityScoreRaw) : undefined,
      noveltyScore: noveltyScoreRaw ? Number(noveltyScoreRaw) : undefined,
      usefulnessScore: usefulnessScoreRaw ? Number(usefulnessScoreRaw) : undefined,
      comments: comments || undefined,
    });

    revalidatePath(`/collaborations/${collaborationId}`);
    revalidatePath("/collaborations");
    revalidatePath("/dashboard");
    return { success: true, feedbackId: feedback.id };
  } catch (error) {
    console.error("Error submitting collaboration feedback:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengirim ulasan/feedback.",
    };
  }
}

export async function getCollaborationFeedbacksAction(collaborationId: string) {
  return getFeedbackForCollaboration(collaborationId);
}

export async function deleteFeedbackAction(feedbackId: string) {
  const actor = await getPrimaryActor();

  try {
    await deleteFeedback(feedbackId, actor.id);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus feedback.",
    };
  }
}
