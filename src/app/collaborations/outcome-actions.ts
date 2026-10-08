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
import { createNotification } from "@/application/notificationService";
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

  const galleryUrlsRaw = (formData.get("galleryUrls") as string)?.trim();
  const galleryUrls = galleryUrlsRaw
    ? galleryUrlsRaw
        .split(/[\n,]+/)
        .map((u) => u.trim())
        .filter((u) => u.startsWith("http://") || u.startsWith("https://"))
    : null;

  if (!title || !description) {
    return { success: false, error: "Judul dan deskripsi luaran wajib diisi." };
  }

  const unitsProduced = unitsProducedRaw && !isNaN(Number(unitsProducedRaw)) ? Number(unitsProducedRaw) : null;

  try {
    const outcome = await recordOutcome({
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
        galleryUrls,
        notes: notes || null,
      },
    });

    const collab = await prisma.collaboration.findUnique({
      where: { id: collaborationId },
      include: {
        participants: {
          include: { actor: true },
        },
      },
    });

    if (collab && evidenceUrl) {
      for (const p of collab.participants) {
        await prisma.asset.create({
          data: {
            actorId: p.actorId,
            category: "PORTFOLIO_WORK",
            subtype: "Karya Kolaborasi",
            name: title,
            description: `${description} • Kolaborasi di RAMU: ${collab.title}`,
            roles: ["OUTPUT", "CREATIVE_ELEMENT"],
            sourceType: "VERIFIED",
            confidenceLevel: "HIGH",
            status: "ACTIVE",
            attributes: {
              image_url: evidenceUrl,
              collaborationId: collab.id,
              outcomeId: outcome.id,
              credits: collab.participants.map(part => `${part.actor.name} (${part.roleCode})`),
              tags: ["Kolaborasi RAMU", "Verified Outcome"],
            },
          },
        }).catch((err) => console.error("Auto asset creation error:", err));
      }
    }

    if (collab) {
      for (const p of collab.participants) {
        if (p.actorId !== actor.id) {
          createNotification({
            actorId: p.actorId,
            title: "Luaran Kolaborasi Dicatat",
            message: `${actor.name} mencatat luaran baru '${title}' pada kolaborasi '${collab.title}'.`,
            type: "INFO",
            link: `/collaborations/${collaborationId}`,
            metadata: { collaborationId, outcomeId: outcome.id },
          }).catch((e) => console.error("Failed to notify outcome:", e));
        }
      }
    }

    revalidatePath(`/collaborations/${collaborationId}`);
    revalidatePath("/collaborations");
    revalidatePath("/dashboard");
    revalidatePath("/showcase");
    revalidatePath("/dashboard/showcase");
    revalidatePath("/directory");
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
            title: "Proyek Kolaborasi Selesai!",
            message: `${actor.name} telah menandai kolaborasi '${collab.title}' selesai (COMPLETED). Silakan lengkapi luaran dan evaluasi.`,
            type: "COLLABORATION_STARTED",
            link: `/collaborations/${collaborationId}`,
            metadata: { collaborationId, status: "COMPLETED" },
          }).catch((e) => console.error("Failed to notify collab completed:", e));
        }
      }
    }

    revalidatePath(`/collaborations/${collaborationId}`);
    revalidatePath("/collaborations");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/bookings");
    revalidatePath("/projects");
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
