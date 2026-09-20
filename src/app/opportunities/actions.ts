"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { generateAndSaveOpportunities } from "@/application/opportunityService";
import { submitOpportunityFeedback } from "@/application/outcomeService";
import { OpportunityStatus } from "@prisma/client";

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

export async function runOpportunityEngine() {
  const actor = await getPrimaryActor();

  try {
    const result = await generateAndSaveOpportunities({ focusActorId: actor.id });
    revalidatePath("/opportunities");
    revalidatePath("/dashboard");
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Error running opportunity engine:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menjalankan engine peluang.",
    };
  }
}

export async function updateOpportunityStatus(opportunityId: string, status: OpportunityStatus) {
  await getPrimaryActor();

  try {
    await prisma.opportunity.update({
      where: { id: opportunityId },
      data: { status },
    });
    revalidatePath("/opportunities");
    revalidatePath(`/opportunities/${opportunityId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating opportunity status:", error);
    return { success: false, error: "Gagal memperbarui status peluang." };
  }
}

export async function submitOpportunityFeedbackAction(
  opportunityId: string,
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
    await submitOpportunityFeedback({
      opportunityId,
      actorId: actor.id,
      relevanceScore,
      feasibilityScore,
      noveltyScore,
      usefulnessScore,
      comments: comments || null,
    });

    revalidatePath(`/opportunities/${opportunityId}`);
    revalidatePath("/dashboard");
    revalidatePath("/engine-insights");
    return { success: true };
  } catch (error) {
    console.error("Error submitting opportunity feedback:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menyimpan ulasan evaluasi peluang.",
    };
  }
}
